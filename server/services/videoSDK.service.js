import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

class VideoSDKService {
  constructor() {
    this.apiKey = process.env.VIDEOSDK_API_KEY;
    this.secret = process.env.VIDEOSDK_SECRET_KEY;
    this.baseURL = process.env.VIDEOSDK_API_ENDPOINT || 'https://api.videosdk.live/v2';

    if (!this.apiKey || !this.secret) {
      throw new Error('VideoSDK credentials not found in environment variables');
    }
  }

  // ─── Token generation ────────────────────────────────────────────────────────

  // Generate VideoSDK Auth Token for just creating and deleting a room
  generateAuthTokenForCreatingAndDeletingRoom() {
    try {
      const payload = {
        apikey: this.apiKey,
        permissions: 'allow_join',
      };
      return jwt.sign(payload, this.secret, { algorithm: 'HS256', expiresIn: '10m' });
    } catch (error) {
      logger.error('Error generating VideoSDK auth token:', error);
      throw new ApiError(500, 'Failed to generate authentication token');
    }
  }

  // Generate meeting token for a specific participant joining a specific room.
  // participantId is embedded in the JWT so VideoSDK uses OUR id (not its own internal one).
  generateTokenForJoiningSession(roomId, participantId, permissions = ['allow_join']) {
    try {
      const payload = {
        apikey: this.apiKey,
        permissions,
        version: 2,
        roomId,
        participantId, // ← VideoSDK will use this as the participant's ID in the session
      };
      return jwt.sign(payload, this.secret, { algorithm: 'HS256', expiresIn: '1h' });
    } catch (error) {
      logger.error('Error generating meeting token:', error);
      throw new ApiError(500, 'Failed to generate meeting access token');
    }
  }

  // ─── Live participant check ───────────────────────────────────────────────────

  /**
   * Check whether OUR participantId is currently live (connected) in a room.
   *
   * How it works:
   *   1. Query VideoSDK /v2/sessions?roomId=X to get the active session.
   *   2. Look at the participants array in that session.
   *   3. Each participant has { participantId, timelog: [{ start, end }] }.
   *      - participantId here IS the id we put in our JWT (our own "client - <id>" string).
   *      - timelog.end === null  →  they are STILL IN the room right now.
   *      - timelog.end is a date string  →  they have left.
   *   4. A participant is "live" if their entry exists AND their latest timelog has end === null.
   *
   * Edge cases handled:
   *   - No active session yet (room created but nobody has joined) → returns false → allow join.
   *   - VideoSDK API is down / times out → returns false → fail open (don't lock user out).
   *   - Participant crashed without clean leave → timelog.end will eventually be filled by
   *     VideoSDK's own timeout; until then they appear live, which is correct behaviour
   *     (prevents a second tab joining while the first is still technically connected).
   *
   * @param {string} roomId       - booking.videoSDKRoomId
   * @param {string} participantId - e.g. "client - 6634abc..." or "counselor - 6634def..."
   * @returns {Promise<boolean>}  - true = currently in the room, false = not in the room
   */
  /**
   * Check whether a participant with `participantName` is currently live in a room.
   *
   * WHY NAME INSTEAD OF participantId:
   *   VideoSDK does NOT expose our custom participantId (the one we embed in the JWT)
   *   in the sessions API response — it uses its own internal id there. The `name`
   *   field however is exactly what we pass as `name` in MeetingProvider config,
   *   which the frontend now sets as "fullName_mongoId" (e.g. "Rahul Sharma_6634abc...").
   *   This is unique per user so it is a safe comparison key.
   *
   * Timelog logic:
   *   Each participant entry has timelog: [{ start, end }, ...].
   *   end === null  → still connected right now.
   *   end is a date → they have left.
   *   We check only the LAST timelog entry to handle rejoin cases correctly.
   *
   * Fail-open policy:
   *   If the VideoSDK API is down or returns an error we return false so legitimate
   *   users are never locked out during an outage.
   *
   * @param {string} roomId           - booking.videoSDKRoomId
   * @param {string} participantName  - "fullName_mongoId"  e.g. "Rahul Sharma_6634abc..."
   * @returns {Promise<boolean>}      - true = currently live, false = not in the room
   */
  async isParticipantLiveInRoom(roomId, participantName) {
    try {
      const authToken = this.generateAuthTokenForCreatingAndDeletingRoom();

      // Only fetch active sessions — saves bandwidth and avoids stale data
      const url = `${this.baseURL}/sessions?roomId=${encodeURIComponent(roomId)}&status=active&perPage=2`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: authToken,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const body = await response.text().catch(() => '');
        logger.error(
          `[VideoSDK] isParticipantLiveInRoom: sessions API returned ${response.status} — failing open. Body: ${body}`
        );
        return false;
      }

      const json = await response.json();
      const sessions = Array.isArray(json.data) ? json.data : [];

      logger.info(
        `[VideoSDK] isParticipantLiveInRoom: roomId=${roomId} participantName="${participantName}" activeSessions=${sessions.length}`
      );

      if (sessions.length === 0) {
        // Room exists but nobody is in it yet (or all have left)
        return false;
      }

      for (const session of sessions) {
        const participants = Array.isArray(session.participants) ? session.participants : [];

        for (const p of participants) {
          // VideoSDK exposes our name exactly as set in MeetingProvider → "fullName_mongoId"
          // p.name is that value; p.participantId is VideoSDK's own internal id (useless here)
          logger.info(`[VideoSDK] checking participant: name="${p.name}" timelog=${JSON.stringify(p.timelog)}`);

          if (p.name !== participantName) continue;

          // Found our participant — now check if they are currently connected
          const timelog = Array.isArray(p.timelog) ? p.timelog : [];

          if (timelog.length === 0) {
            // Record exists but no timelog — treat as live to be safe
            logger.warn(
              `[VideoSDK] name="${participantName}" found but timelog is empty — treating as live`
            );
            return true;
          }

          const lastEntry = timelog[timelog.length - 1];
          const isCurrentlyLive = lastEntry.end === null || lastEntry.end === undefined;

          logger.info(
            `[VideoSDK] isParticipantLiveInRoom: name="${participantName}" roomId=${roomId} ` +
            `isLive=${isCurrentlyLive} lastTimelog=${JSON.stringify(lastEntry)}`
          );

          return isCurrentlyLive;
        }
      }

      // Name not found in any active session → not in the room
      logger.info(
        `[VideoSDK] isParticipantLiveInRoom: name="${participantName}" not found in active session for roomId=${roomId}`
      );
      return false;
    } catch (error) {
      logger.error(
        `[VideoSDK] isParticipantLiveInRoom unexpected error (failing open): ${error.message}`
      );
      return false;
    }
  }

  // ─── Room management ─────────────────────────────────────────────────────────

  // Create a new meeting room
  async createRoom() {
    try {
      const authToken = this.generateAuthTokenForCreatingAndDeletingRoom();

      const response = await fetch(`${this.baseURL}/rooms`, {
        method: 'POST',
        headers: { Authorization: authToken, 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (!data.roomId) {
        throw new ApiError(500, 'Failed to get the room Id');
      }

      logger.info(`VideoSDK meeting created: ${data.roomId}`);

      return {
        success: true,
        roomId: data.roomId,
        createdAt: data.createdAt,
      };
    } catch (error) {
      logger.error('Error creating VideoSDK meeting:', error.message);
      throw new ApiError(500, 'Failed to create video meeting room');
    }
  }

  // End all active sessions and deactivate (delete) a room
  async deleteRoom(roomId) {
    try {
      if (!roomId) {
        throw new ApiError(400, 'Room ID is required');
      }

      logger.info(`[VideoSDK] Attempting to delete room: ${roomId}`);

      const authToken = this.generateAuthTokenForCreatingAndDeletingRoom();

      const roomExists = await this.checkRoomExists(roomId, authToken);

      if (!roomExists) {
        logger.warn(`[VideoSDK] Room ${roomId} not found or already deleted`);
        return {
          success: true,
          message: 'Room already deleted or does not exist',
          roomId,
          alreadyDeleted: true,
        };
      }

      await this.endAllActiveSessions(roomId, authToken);

      const response = await fetch(`${this.baseURL}/rooms/deactivate`, {
        method: 'POST',
        headers: {
          Authorization: authToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to delete room: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      logger.info(`[VideoSDK] Room deleted successfully: ${roomId}`);

      return {
        success: true,
        message: 'Room deleted successfully',
        roomId,
        deletedAt: new Date().toISOString(),
      };
    } catch (error) {
      if (error.message.includes('404') || error.message.includes('not found')) {
        logger.warn(`[VideoSDK] Room ${roomId} not found (404)`);
        return {
          success: true,
          message: 'Room not found (already deleted)',
          roomId,
          alreadyDeleted: true,
        };
      }

      logger.error(`[VideoSDK] Failed to delete room ${roomId}:`, error.message);
      throw new ApiError(500, `Failed to delete room: ${error.message}`);
    }
  }

  /**
   * Check if a room exists
   */
  async checkRoomExists(roomId, authToken) {
    try {
      const response = await fetch(`${this.baseURL}/rooms/${roomId}`, {
        method: 'GET',
        headers: {
          Authorization: authToken,
          'Content-Type': 'application/json',
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * End all active sessions in a room
   */
  async endAllActiveSessions(roomId, authToken) {
    try {
      const sessionsResponse = await fetch(`${this.baseURL}/sessions/end`, {
        method: 'POST',
        headers: {
          Authorization: authToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomId }),
      });

      if (!sessionsResponse.ok) {
        logger.warn(`[VideoSDK] Could not end all sessions for room ${roomId}`);
        return;
      }

      const sessionsData = await sessionsResponse.json();
      logger.info(`[VideoSDK] Ended all sessions in room ${roomId}`);
      return {
        sessionsData,
        message: 'Deletion successful of the active rooms',
      };
    } catch (error) {
      logger.error(`[VideoSDK] Failed to end sessions in room ${roomId}:`, error.message);
      throw new ApiError(500, `Error ending active sessions for roomId: ${roomId}`);
    }
  }

  // ─── Analytics ───────────────────────────────────────────────────────────────

  async getMeetingDetails(meetingId) {
    try {
      const authToken = this.generateAuthTokenForCreatingAndDeletingRoom();
      const response = await fetch(`${this.baseURL}/rooms/${meetingId}`, {
        headers: { Authorization: authToken },
      });
      if (!response.ok) throw new ApiError(404, 'Meeting not found');
      return await response.json();
    } catch (error) {
      logger.error('Error fetching meeting details:', error.message);
      throw new ApiError(404, 'Meeting not found');
    }
  }

  async getSessionRecordings(sessionId) {
    try {
      const authToken = this.generateAuthTokenForCreatingAndDeletingRoom();
      const response = await fetch(`${this.baseURL}/recordings?sessionId=${sessionId}`, {
        headers: { Authorization: authToken },
      });
      if (!response.ok) return { recordings: [] };
      return await response.json();
    } catch (error) {
      logger.error('Error fetching recordings:', error.message);
      return { recordings: [] };
    }
  }

  async getSessionAnalytics(sessionId) {
    try {
      const authToken = this.generateAuthTokenForCreatingAndDeletingRoom();
      const response = await fetch(`${this.baseURL}/sessions/${sessionId}`, {
        headers: { Authorization: authToken },
      });
      if (!response.ok) return null;
      const data = await response.json();
      return this.processAnalyticsData(data);
    } catch (error) {
      logger.error('Error fetching session analytics:', error.message);
      return null;
    }
  }

  processAnalyticsData(rawData) {
    try {
      const analytics = {
        sessionId: rawData.sessionId,
        meetingId: rawData.meetingId,
        duration: rawData.end - rawData.start,
        startTime: new Date(rawData.start),
        endTime: new Date(rawData.end),
        participantCount: rawData.participants?.length || 0,
        participants: [],
        events: rawData.events || [],
        qualityStats: {
          avgBitrate: 0,
          avgLatency: 0,
          packetLoss: 0,
          connectionIssues: 0,
        },
      };

      if (rawData.participants) {
        analytics.participants = rawData.participants.map((participant) => ({
          participantId: participant.participantId,
          name: participant.name,
          joinTime: new Date(participant.timelog?.[0]?.start || rawData.start),
          leaveTime: new Date(participant.timelog?.[participant.timelog.length - 1]?.end || rawData.end),
          duration: participant.timelog
            ? (new Date(participant.timelog[participant.timelog.length - 1]?.end) - new Date(participant.timelog[0]?.start)) / 1000
            : (rawData.end - rawData.start) / 1000,
          events: participant.events || [],
          qualityStats: this.extractQualityStats(participant),
        }));

        const allStats = analytics.participants.map((p) => p.qualityStats);
        analytics.qualityStats = this.calculateAverageStats(allStats);
      }

      return analytics;
    } catch (error) {
      logger.error('Error processing analytics data:', error);
      return null;
    }
  }

  extractQualityStats(participant) {
    const stats = { avgBitrate: 0, avgLatency: 0, packetLoss: 0, jitter: 0, connectionIssues: 0 };
    if (participant.stats) {
      const rtcStats = participant.stats;
      if (rtcStats.video) {
        stats.avgBitrate = rtcStats.video.avgBitrate || 0;
        stats.packetLoss = rtcStats.video.packetsLost || 0;
      }
      if (rtcStats.audio) stats.jitter = rtcStats.audio.jitter || 0;
      if (rtcStats.connection) {
        stats.avgLatency = rtcStats.connection.rtt || 0;
        stats.connectionIssues = rtcStats.connection.issues || 0;
      }
    }
    return stats;
  }

  calculateAverageStats(allStats) {
    if (!allStats.length) return { avgBitrate: 0, avgLatency: 0, packetLoss: 0, connectionIssues: 0 };
    const totals = allStats.reduce(
      (acc, s) => {
        acc.avgBitrate += s.avgBitrate || 0;
        acc.avgLatency += s.avgLatency || 0;
        acc.packetLoss += s.packetLoss || 0;
        acc.connectionIssues += s.connectionIssues || 0;
        return acc;
      },
      { avgBitrate: 0, avgLatency: 0, packetLoss: 0, connectionIssues: 0 }
    );
    const count = allStats.length;
    return {
      avgBitrate: Math.round(totals.avgBitrate / count),
      avgLatency: Math.round(totals.avgLatency / count),
      packetLoss: Math.round(totals.packetLoss / count),
      connectionIssues: Math.round(totals.connectionIssues / count),
    };
  }

  // ─── Webhook handling ────────────────────────────────────────────────────────

  async handleWebhook(webhookData) {
    try {
      logger.info('VideoSDK webhook received:', JSON.stringify(webhookData, null, 2));

      const { eventType, sessionId, meetingId, data } = webhookData;

      switch (eventType) {
        case 'session-started':
          await this.handleSessionStarted(sessionId, meetingId, data);
          break;
        case 'session-ended':
          await this.handleSessionEnded(sessionId, meetingId, data);
          break;
        case 'participant-joined':
          await this.handleParticipantJoined(sessionId, meetingId, data);
          break;
        case 'participant-left':
          await this.handleParticipantLeft(sessionId, meetingId, data);
          break;
        case 'recording-started':
        case 'recording-stopped':
          await this.handleRecordingEvent(sessionId, meetingId, eventType, data);
          break;
        default:
          logger.info(`Unhandled webhook event: ${eventType}`);
      }

      return { success: true };
    } catch (error) {
      logger.error('Error handling VideoSDK webhook:', error);
      return { success: false, error: error.message };
    }
  }

  async handleSessionStarted(sessionId, meetingId, data) {
    try {
      const { Session } = await import('../models/session.model.js');
      await Session.findOneAndUpdate(
        { videoSDKMeetingId: meetingId },
        {
          status: 'active',
          actualStartTime: new Date(),
          $push: { sessionEvents: { eventType: 'session-started', timestamp: new Date(), metadata: data } },
        }
      );
      logger.info(`Session started: ${sessionId} - ${meetingId}`);
    } catch (error) {
      logger.error('Error handling session started:', error);
    }
  }

  async handleSessionEnded(sessionId, meetingId, data) {
    try {
      const { Session } = await import('../models/session.model.js');
      const { Booking } = await import('../models/booking-model.js');

      const session = await Session.findOneAndUpdate(
        { videoSDKMeetingId: meetingId },
        {
          status: 'ended',
          actualEndTime: new Date(),
          $push: { sessionEvents: { eventType: 'session-ended', timestamp: new Date(), metadata: data } },
        },
        { new: true }
      );

      if (session?.actualStartTime) {
        session.totalDuration = Math.floor((new Date() - session.actualStartTime) / 1000);
        await session.save();
      }

      // Clear ALL activeParticipants when session ends — belt-and-suspenders cleanup
      if (session?.bookingId) {
        await Booking.findByIdAndUpdate(session.bookingId, {
          $set: { activeParticipants: {} },
        });
        logger.info(`[VideoSDK Webhook] Cleared all activeParticipants on session-ended | bookingId=${session.bookingId}`);
      }

      setTimeout(async () => {
        try {
          const analytics = await this.getSessionAnalytics(sessionId);
          if (analytics && session) {
            await this.updateSessionWithAnalytics(session._id, analytics);
          }
        } catch (error) {
          logger.error('Error updating session analytics:', error);
        }
      }, 5000);

      logger.info(`Session ended: ${sessionId} - ${meetingId}`);
    } catch (error) {
      logger.error('Error handling session ended:', error);
    }
  }

  async handleParticipantJoined(sessionId, meetingId, data) {
    try {
      const { Session } = await import('../models/session.model.js');
      await Session.findOneAndUpdate(
        { videoSDKMeetingId: meetingId },
        {
          $push: {
            sessionEvents: { eventType: 'participant-joined', participantId: data.participantId, timestamp: new Date(), metadata: data },
          },
        }
      );
      logger.info(`Participant joined: ${data.participantId} in session ${sessionId}`);
    } catch (error) {
      logger.error('Error handling participant joined:', error);
    }
  }

  /**
   * Webhook: participant left.
   * Also clears the activeParticipants DB entry for this role.
   * This is the belt-and-suspenders path for clean leaves (covers tab-close, crashes, etc.
   * since VideoSDK detects the disconnect and fires this webhook regardless of whether
   * the frontend called your own trackSessionEvent endpoint).
   */
  async handleParticipantLeft(sessionId, meetingId, data) {
    try {
      const { Session } = await import('../models/session.model.js');
      const { Booking } = await import('../models/booking-model.js');

      await Session.findOneAndUpdate(
        { videoSDKMeetingId: meetingId },
        {
          $push: {
            sessionEvents: { eventType: 'participant-left', participantId: data.participantId, timestamp: new Date(), metadata: data },
          },
        }
      );

      // data.participantId is OUR id ("client - <userId>" or "counselor - <userId>")
      // because we embedded it in the JWT — so we can derive the role and clear the DB.
      const participantId = data.participantId;
      const role = participantId?.startsWith('client - ')
        ? 'client'
        : participantId?.startsWith('counselor - ')
          ? 'counselor'
          : null;

      if (role) {
        // Find the booking via the session
        const session = await Session.findById(sessionId).select('bookingId');
        if (session?.bookingId) {
          await Booking.findByIdAndUpdate(session.bookingId, {
            $unset: { [`activeParticipants.${role}`]: '' },
          });
          logger.info(
            `[VideoSDK Webhook] Cleared activeParticipants.${role} | bookingId=${session.bookingId} participantId=${participantId}`
          );
        }
      }

      logger.info(`Participant left: ${participantId} from session ${sessionId}`);
    } catch (error) {
      logger.error('Error handling participant left:', error);
    }
  }

  async handleRecordingEvent(sessionId, meetingId, eventType, data) {
    try {
      const { Session } = await import('../models/session.model.js');
      const updateData = {
        $push: { sessionEvents: { eventType, timestamp: new Date(), metadata: data } },
      };
      if (eventType === 'recording-started') {
        updateData['recording.isRecorded'] = true;
        updateData['recording.recordingId'] = data.recordingId;
      } else if (eventType === 'recording-stopped') {
        updateData['recording.recordingUrl'] = data.recordingUrl;
        updateData['recording.downloadUrl'] = data.downloadUrl;
        updateData['recording.recordingDuration'] = data.duration;
      }
      await Session.findOneAndUpdate({ videoSDKMeetingId: meetingId }, updateData);
      logger.info(`Recording ${eventType}: ${sessionId} - ${meetingId}`);
    } catch (error) {
      logger.error(`Error handling recording ${eventType}:`, error);
    }
  }

  async updateSessionWithAnalytics(sessionId, analytics) {
    try {
      const { Session } = await import('../models/session.model.js');
      const updateData = {
        participants: analytics.participants.map((p) => ({
          participantId: p.participantId,
          displayName: p.name,
          joinedAt: p.joinTime,
          leftAt: p.leaveTime,
          duration: p.duration,
          connectionQuality: {
            avgBitrate: p.qualityStats.avgBitrate,
            avgLatency: p.qualityStats.avgLatency,
            packetLoss: p.qualityStats.packetLoss,
            jitter: p.qualityStats.jitter,
          },
        })),
        sessionQuality: {
          networkStability: this.getNetworkStabilityRating(analytics.qualityStats),
          connectionIssues: analytics.qualityStats.connectionIssues,
          audioQualityRating: this.getQualityRating(analytics.qualityStats.avgLatency),
          videoQualityRating: this.getQualityRating(analytics.qualityStats.avgBitrate, 'bitrate'),
        },
      };
      await Session.findByIdAndUpdate(sessionId, updateData);
      logger.info(`Session analytics updated: ${sessionId}`);
    } catch (error) {
      logger.error('Error updating session with analytics:', error);
    }
  }

  getNetworkStabilityRating(qualityStats) {
    const { avgLatency, packetLoss, connectionIssues } = qualityStats;
    if (avgLatency < 100 && packetLoss < 1 && connectionIssues < 2) return 'excellent';
    if (avgLatency < 200 && packetLoss < 3 && connectionIssues < 5) return 'good';
    if (avgLatency < 300 && packetLoss < 5 && connectionIssues < 10) return 'fair';
    return 'poor';
  }

  getQualityRating(value, type = 'latency') {
    if (type === 'latency') {
      if (value < 100) return 5;
      if (value < 200) return 4;
      if (value < 300) return 3;
      if (value < 500) return 2;
      return 1;
    }
    if (type === 'bitrate') {
      if (value > 1000) return 5;
      if (value > 500) return 4;
      if (value > 250) return 3;
      if (value > 100) return 2;
      return 1;
    }
    return 3;
  }
}

export default new VideoSDKService();