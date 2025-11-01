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
    console.log(process.env.VIDEOSDK_API_KEY);

    if (!this.apiKey || !this.secret) {
      throw new Error('VideoSDK credentials not found in environment variables');
    }
  }

  // Generate VideoSDK Auth Token for just creating and deleting a room
  generateAuthTokenForCreatingAndDeletingRoom() {
    try {
      const options = {
        algorithm: 'HS256',
        expiresIn: '10m',
      };

      const payload = {
        apikey: this.apiKey,
        permissions: 'allow_join',
      };

      return jwt.sign(payload, this.secret, options);
    } catch (error) {
      logger.error('Error generating VideoSDK auth token:', error);
      throw new ApiError(500, 'Failed to generate authentication token');
    }
  }

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
        throw new ApiError(500, 'Failes to get the room Id');
      }

      logger.info(`VideoSDK meeting created: ${data.roomId}`);

      return {
        success: true,
        roomId: data.roomId,
        createdAt: data.createdAt,
      };
    } catch (error) {
      logger.error('Error creating VideoSDK meeting:', error.response?.data || error.message);
      throw new ApiError(500, 'Failed to create video meeting room');
    }
  }

  // Generate meeting token for participants
  generateTokenForJoiningSession(roomId, participantId, permissions = ['allow_join']) {
    try {
      const options = {
        algorithm: 'HS256',
        expiresIn: '1h',
      };
      const payload = {
        apikey: this.apiKey,
        permissions,
        version: 2,
        roomId,
        participantId,
      };

      return jwt.sign(payload, this.secret, options);
    } catch (error) {
      logger.error('Error generating meeting token:', error);
      throw new ApiError(500, 'Failed to generate meeting access token');
    }
  }

  // end all active sessions and deactivate ( delete room )
  async deleteRoom(roomId) {
    try {
      if (!roomId) {
        throw new ApiError(400, 'Room ID is required');
      }

      logger.info(`[VideoSDK] Attempting to delete room: ${roomId}`);

      // Generate auth token
      const authToken = this.generateAuthTokenForCreatingAndDeletingRoom();

      // Check if room exists first
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
      //checking and ending all the active sessions for the room
      await this.endAllActiveSessions(roomId, authToken);

      // Delete the room
      const response = await fetch(`${this.baseURL}/rooms/deactivate`, {
        method: 'POST',
        headers: {
          Authorization: authToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId,
        }),
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
      // Handle specific error cases
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
   * Check if room exists
   * @param {string} roomId - Room ID
   * @param {string} authToken - Auth token
   * @returns {Promise<boolean>}
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
    } catch (error) {
      return false;
    }
  }

  // /**
  //  * Get room details including active sessions
  //  * @param {string} roomId - Room ID
  //  * @param {string} authToken - Auth token
  //  * @returns {Promise<Object>}
  //  */
  // async getRoomDetails(roomId, authToken) {
  //   try {
  //     const response = await fetch(`${this.baseURL}/rooms/${roomId}`, {
  //       method: 'GET',
  //       headers: {
  //         Authorization: authToken,
  //         'Content-Type': 'application/json',
  //       },
  //     });

  //     if (!response.ok) {
  //       throw new Error(`Room not found: ${response.status}`);
  //     }

  //     const data = await response.json();

  //     return {
  //       roomId: data.roomId,
  //       disabled: data.disabled,
  //       activeSessions: data.activeSessions,
  //       createdAt: data.createdAt,
  //     };
  //   } catch (error) {
  //     logger.error(`[VideoSDK] Error getting room details: ${error.message}`);
  //     return {
  //       roomId,
  //       activeSessions: 0,
  //     };
  //   }
  // }

  /**
   * End all active sessions in a room
   * @param {string} roomId - Room ID
   * @param {string} authToken - Auth token
   */
  async endAllActiveSessions(roomId, authToken) {
    try {
      // Get list of all active sessions
      const sessionsResponse = await fetch(`${this.baseURL}/sessions/end`, {
        method: 'POST',
        headers: {
          Authorization: authToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId,
        }),
      });

      if (!sessionsResponse.ok) {
        logger.warn(`[VideoSDK] Could not end all sessions for room ${roomId}`);
        return;
      }

      const sessionsData = await sessionsResponse.json();
      logger.info(`[VideoSDK] Ended all sessions in room ${roomId}`);
      return {
        sessionsData,
        message: 'deletion successfull of the active rooms',
      };
    } catch (error) {
      logger.error(`[VideoSDK] Failed to end sessions in room ${roomId}:`, error.message);
      throw new ApiError(500, `Error ending active sessions for roomId :${roomId}`);
    }
  }

  // /**
  //  * End a specific session
  //  * @param {string} sessionId - Session ID
  //  * @param {string} authToken - Auth token
  //  */
  // async endSession(sessionId, roomId, authToken) {
  //   try {
  //     const response = await fetch(`${this.baseURL}/sessions/end`, {
  //       method: 'POST',
  //       headers: {
  //         Authorization: authToken,
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         roomId: roomId,
  //         sessionId: sessionId,
  //       }),
  //     });

  //     if (response.ok) {
  //       logger.info(`[VideoSDK] Session ${sessionId} ended successfully`);
  //     } else if (response.status === 404) {
  //       logger.warn(`[VideoSDK] Session ${sessionId} not found (already ended)`);
  //     } else {
  //       throw new Error(`Failed to end session: ${response.status}`);
  //     }
  //   } catch (error) {
  //     logger.error(`[VideoSDK] Error ending session ${sessionId}:`, error.message);
  //     throw error;
  //   }
  // }

  // Get meeting details
  async getMeetingDetails(meetingId) {
    try {
      const authToken = this.generateAuthToken();

      const response = await axios.get(`${this.baseURL}/rooms/${meetingId}`, {
        headers: {
          Authorization: authToken,
        },
      });

      return response.data;
    } catch (error) {
      logger.error('Error fetching meeting details:', error.response?.data || error.message);
      throw new ApiError(404, 'Meeting not found');
    }
  }

  // Get session recordings
  async getSessionRecordings(sessionId) {
    try {
      const authToken = this.generateAuthToken();

      const response = await axios.get(`${this.baseURL}/recordings`, {
        headers: {
          Authorization: authToken,
        },
        params: {
          sessionId,
        },
      });

      return response.data;
    } catch (error) {
      logger.error('Error fetching recordings:', error.response?.data || error.message);
      return { recordings: [] };
    }
  }

  // Get detailed session analytics
  async getSessionAnalytics(sessionId, meetingId) {
    try {
      const authToken = this.generateAuthToken();

      const response = await axios.get(`${this.baseURL}/sessions/${sessionId}`, {
        headers: {
          Authorization: authToken,
        },
      });

      return this.processAnalyticsData(response.data);
    } catch (error) {
      logger.error('Error fetching session analytics:', error.response?.data || error.message);
      return null;
    }
  }

  // Process analytics data into structured format
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

      // Process participant data
      if (rawData.participants) {
        analytics.participants = rawData.participants.map((participant) => ({
          participantId: participant.participantId,
          name: participant.name,
          joinTime: new Date(participant.timelog?.join || rawData.start),
          leaveTime: new Date(participant.timelog?.leave || rawData.end),
          duration: participant.timelog
            ? (participant.timelog.leave - participant.timelog.join) / 1000
            : (rawData.end - rawData.start) / 1000,
          events: participant.events || [],
          qualityStats: this.extractQualityStats(participant),
        }));

        // Calculate overall quality metrics
        const allStats = analytics.participants.map((p) => p.qualityStats);
        analytics.qualityStats = this.calculateAverageStats(allStats);
      }

      return analytics;
    } catch (error) {
      logger.error('Error processing analytics data:', error);
      return null;
    }
  }

  // Extract quality statistics from participant data
  extractQualityStats(participant) {
    const stats = {
      avgBitrate: 0,
      avgLatency: 0,
      packetLoss: 0,
      jitter: 0,
      connectionIssues: 0,
    };

    if (participant.stats) {
      // Process WebRTC stats if available
      const rtcStats = participant.stats;

      if (rtcStats.video) {
        stats.avgBitrate = rtcStats.video.avgBitrate || 0;
        stats.packetLoss = rtcStats.video.packetsLost || 0;
      }

      if (rtcStats.audio) {
        stats.jitter = rtcStats.audio.jitter || 0;
      }

      if (rtcStats.connection) {
        stats.avgLatency = rtcStats.connection.rtt || 0;
        stats.connectionIssues = rtcStats.connection.issues || 0;
      }
    }

    return stats;
  }

  // Calculate average statistics across participants
  calculateAverageStats(allStats) {
    if (!allStats.length)
      return {
        avgBitrate: 0,
        avgLatency: 0,
        packetLoss: 0,
        connectionIssues: 0,
      };

    const totals = allStats.reduce(
      (acc, stats) => {
        acc.avgBitrate += stats.avgBitrate || 0;
        acc.avgLatency += stats.avgLatency || 0;
        acc.packetLoss += stats.packetLoss || 0;
        acc.connectionIssues += stats.connectionIssues || 0;
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

  // Handle VideoSDK webhooks
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

  // Handle session started webhook
  async handleSessionStarted(sessionId, meetingId, data) {
    try {
      const { Session } = await import('../models/session.model.js');

      await Session.findOneAndUpdate(
        { videoSDKMeetingId: meetingId },
        {
          status: 'active',
          actualStartTime: new Date(),
          $push: {
            sessionEvents: {
              eventType: 'session-started',
              timestamp: new Date(),
              metadata: data,
            },
          },
        }
      );

      logger.info(`Session started: ${sessionId} - ${meetingId}`);
    } catch (error) {
      logger.error('Error handling session started:', error);
    }
  }

  // Handle session ended webhook
  async handleSessionEnded(sessionId, meetingId, data) {
    try {
      const { Session } = await import('../models/session.model.js');

      const session = await Session.findOneAndUpdate(
        { videoSDKMeetingId: meetingId },
        {
          status: 'ended',
          actualEndTime: new Date(),
          $push: {
            sessionEvents: {
              eventType: 'session-ended',
              timestamp: new Date(),
              metadata: data,
            },
          },
        },
        { new: true }
      );

      if (session && session.actualStartTime) {
        const duration = Math.floor((new Date() - session.actualStartTime) / 1000);
        session.totalDuration = duration;
        await session.save();
      }

      // Get and store detailed analytics
      setTimeout(async () => {
        try {
          const analytics = await this.getSessionAnalytics(sessionId, meetingId);
          if (analytics && session) {
            await this.updateSessionWithAnalytics(session._id, analytics);
          }
        } catch (error) {
          logger.error('Error updating session analytics:', error);
        }
      }, 5000); // Wait 5 seconds for analytics to be ready

      logger.info(`Session ended: ${sessionId} - ${meetingId}`);
    } catch (error) {
      logger.error('Error handling session ended:', error);
    }
  }

  // Handle participant joined webhook
  async handleParticipantJoined(sessionId, meetingId, data) {
    try {
      const { Session } = await import('../models/session.model.js');

      await Session.findOneAndUpdate(
        { videoSDKMeetingId: meetingId },
        {
          $push: {
            sessionEvents: {
              eventType: 'participant-joined',
              participantId: data.participantId,
              timestamp: new Date(),
              metadata: data,
            },
          },
        }
      );

      logger.info(`Participant joined: ${data.participantId} in session ${sessionId}`);
    } catch (error) {
      logger.error('Error handling participant joined:', error);
    }
  }

  // Handle participant left webhook
  async handleParticipantLeft(sessionId, meetingId, data) {
    try {
      const { Session } = await import('../models/session.model.js');

      await Session.findOneAndUpdate(
        { videoSDKMeetingId: meetingId },
        {
          $push: {
            sessionEvents: {
              eventType: 'participant-left',
              participantId: data.participantId,
              timestamp: new Date(),
              metadata: data,
            },
          },
        }
      );

      logger.info(`Participant left: ${data.participantId} from session ${sessionId}`);
    } catch (error) {
      logger.error('Error handling participant left:', error);
    }
  }

  // Handle recording events
  async handleRecordingEvent(sessionId, meetingId, eventType, data) {
    try {
      const { Session } = await import('../models/session.model.js');

      const updateData = {
        $push: {
          sessionEvents: {
            eventType,
            timestamp: new Date(),
            metadata: data,
          },
        },
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

  // Update session with detailed analytics
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

  // Get network stability rating based on connection metrics
  getNetworkStabilityRating(qualityStats) {
    const { avgLatency, packetLoss, connectionIssues } = qualityStats;

    if (avgLatency < 100 && packetLoss < 1 && connectionIssues < 2) {
      return 'excellent';
    } else if (avgLatency < 200 && packetLoss < 3 && connectionIssues < 5) {
      return 'good';
    } else if (avgLatency < 300 && packetLoss < 5 && connectionIssues < 10) {
      return 'fair';
    } else {
      return 'poor';
    }
  }

  // Get quality rating based on metrics
  getQualityRating(value, type = 'latency') {
    if (type === 'latency') {
      if (value < 100) return 5;
      if (value < 200) return 4;
      if (value < 300) return 3;
      if (value < 500) return 2;
      return 1;
    } else if (type === 'bitrate') {
      if (value > 1000) return 5;
      if (value > 500) return 4;
      if (value > 250) return 3;
      if (value > 100) return 2;
      return 1;
    }
    return 3; // default
  }
}

export default new VideoSDKService();
