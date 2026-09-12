import React, { useState, useEffect, useRef, createRef, memo, useCallback, useMemo } from 'react';
import { Constants, useMeeting, useParticipant, usePubSub } from '@videosdk.live/react-sdk';
import { Clock } from 'lucide-react';
import { BottomBar } from './components/BottomBar';
import { SidebarConatiner } from '../components/sidebar/SidebarContainer';
import MemorizedParticipantView from './components/ParticipantView';
import { PresenterView } from '../components/PresenterView';
import { nameTructed, trimSnackBarText } from '../utils/helper';
import WaitingToJoinScreen from '../components/screens/WaitingToJoinScreen';
import ConfirmBox from '../components/ConfirmBox';
import useIsMobile from '../hooks/useIsMobile';
import useIsTab from '../hooks/useIsTab';
import { useMediaQuery } from 'react-responsive';
import { toast } from 'react-toastify';
import { useMeetingAppContext } from '../MeetingAppContextDef';

// Memoized Participant Audio Stream Component
const ParticipantMicStream = memo(
  ({ participantId }) => {
    const { micStream } = useParticipant(participantId);
    const audioElementRef = useRef(null);

    useEffect(() => {
      if (micStream) {
        const mediaStream = new MediaStream();
        mediaStream.addTrack(micStream.track);

        if (!audioElementRef.current) {
          audioElementRef.current = new Audio();
        }

        audioElementRef.current.srcObject = mediaStream;
        audioElementRef.current.play().catch((err) => {
          console.error('Error playing audio:', err);
        });
      }

      return () => {
        if (audioElementRef.current) {
          audioElementRef.current.pause();
          audioElementRef.current.srcObject = null;
        }
      };
    }, [micStream]);

    return null;
  },
  (prevProps, nextProps) => prevProps.participantId === nextProps.participantId
);

ParticipantMicStream.displayName = 'ParticipantMicStream';

export function MeetingContainer({
  onMeetingLeave,
  setIsMeetingLeft,
  participantId,
  sessionData,
  setLeaveReason,
}) {
  const { setSelectedMic, setSelectedWebcam, setSelectedSpeaker, useRaisedHandParticipants } =
    useMeetingAppContext();

  // State
  const [participantsData, setParticipantsData] = useState([]);
  const [containerHeight, setContainerHeight] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [localParticipantAllowedJoin, setLocalParticipantAllowedJoin] = useState(null);
  const [meetingErrorVisible, setMeetingErrorVisible] = useState(false);
  const [meetingError, setMeetingError] = useState({ code: null, message: '' });

  // Session timer state
  const [remainingSeconds, setRemainingSeconds] = useState(null);
  const [isEndingSession, setIsEndingSession] = useState(false);
  const warned5MinRef = useRef(false);
  const warned1MinRef = useRef(false);

  // Refs
  const mMeetingRef = useRef();
  const containerRef = createRef();
  const containerHeightRef = useRef();
  const containerWidthRef = useRef();

  // Responsive hooks
  const isMobile = useIsMobile();
  const isTab = useIsTab();
  const isLGDesktop = useMediaQuery({ minWidth: 1024, maxWidth: 1439 });
  const isXLDesktop = useMediaQuery({ minWidth: 1440 });

  // Constants - Updated to account for navbar
  const NAVBAR_HEIGHT = 80;
  const BOTTOM_BAR_HEIGHT = 60;

  // Calculate sidebar width based on screen size
  const sideBarContainerWidth = useMemo(() => {
    if (isXLDesktop) return 400;
    if (isLGDesktop) return 360;
    if (isTab) return 320;
    if (isMobile) return 280;
    return 240;
  }, [isXLDesktop, isLGDesktop, isTab, isMobile]);

  // Update container dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current?.offsetHeight) {
        setContainerHeight(containerRef.current.offsetHeight);
        containerHeightRef.current = containerRef.current.offsetHeight;
      }
      if (containerRef.current?.offsetWidth) {
        setContainerWidth(containerRef.current.offsetWidth);
        containerWidthRef.current = containerRef.current.offsetWidth;
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => window.removeEventListener('resize', updateDimensions);
  }, [containerRef]);

  // Audio notification helper
  const playNotificationSound = useCallback((type = 'default') => {
    const soundUrl =
      type === 'critical'
        ? 'https://static.videosdk.live/prebuilt/notification_critical_err.mp3'
        : type === 'error'
          ? 'https://static.videosdk.live/prebuilt/notification_err.mp3'
          : 'https://static.videosdk.live/prebuilt/notification.mp3';

    new Audio(soundUrl).play().catch((err) => console.error('Error playing sound:', err));
  }, []);

  // Toast notification helper
  const showToast = useCallback((message, options = {}) => {
    toast(message, {
      position: 'bottom-left',
      autoClose: 4000,
      hideProgressBar: true,
      closeButton: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'light',
      ...options,
    });
  }, []);

  // Meeting event handlers
  const handleMeetingLeft = useCallback(() => {
    setIsMeetingLeft(true);
  }, [setIsMeetingLeft]);

  const handleRecordingStateChanged = useCallback(
    ({ status }) => {
      if (
        status === Constants.recordingEvents.RECORDING_STARTED ||
        status === Constants.recordingEvents.RECORDING_STOPPED
      ) {
        const message =
          status === Constants.recordingEvents.RECORDING_STARTED
            ? 'Meeting recording started'
            : 'Meeting recording stopped';
        showToast(message);
      }
    },
    [showToast]
  );

  const handleParticipantJoined = useCallback((participant) => {
    if (participant) {
      participant.setQuality('high');
    }
  }, []);

  const handleEntryResponded = useCallback(
    (participantId, name) => {
      if (mMeetingRef.current?.localParticipant?.id === participantId) {
        if (name === 'allowed') {
          setLocalParticipantAllowedJoin(true);
        } else {
          setLocalParticipantAllowedJoin(false);
          setTimeout(() => {
            handleMeetingLeft();
          }, 3000);
        }
      }
    },
    [handleMeetingLeft]
  );

  const handleMeetingJoined = useCallback(() => {
    console.log('Meeting joined successfully');
  }, []);

  const handleMeetingLeftCallback = useCallback(() => {
    setSelectedMic({ id: null, label: null });
    setSelectedWebcam({ id: null, label: null });
    setSelectedSpeaker({ id: null, label: null });
    onMeetingLeave();
  }, [setSelectedMic, setSelectedWebcam, setSelectedSpeaker, onMeetingLeave]);

  const handleMeetingStateChanged = useCallback(
    ({ state }) => {
      showToast(`Meeting is ${state}`);
    },
    [showToast]
  );

  const handleError = useCallback(
    (data) => {
      const { code, message } = data;
      console.error('Meeting error:', code, message);

      const joiningErrCodes = [4001, 4002, 4003, 4004, 4005, 4006, 4007, 4008, 4009, 4010];
      const isJoiningError = joiningErrCodes.includes(code);
      const isCriticalError = `${code}`.startsWith('500');

      playNotificationSound(isCriticalError ? 'critical' : 'error');

      setMeetingErrorVisible(true);
      setMeetingError({
        code,
        message: isJoiningError ? 'Unable to join meeting!' : message,
      });
    },
    [playNotificationSound]
  );

  // Initialize meeting with all handlers
  const mMeeting = useMeeting({
    onParticipantJoined: handleParticipantJoined,
    onEntryResponded: handleEntryResponded,
    onMeetingJoined: handleMeetingJoined,
    onMeetingStateChanged: handleMeetingStateChanged,
    onMeetingLeft: handleMeetingLeftCallback,
    onError: handleError,
    onRecordingStateChanged: handleRecordingStateChanged,
  });

  const isPresenting = Boolean(mMeeting.presenterId);

  // Update participants data with debounce
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      const participantIds = Array.from(mMeeting.participants.keys());
      setParticipantsData(participantIds);
    }, 500);

    return () => clearTimeout(debounceTimeout);
  }, [mMeeting.participants]);

  // Update meeting ref
  useEffect(() => {
    mMeetingRef.current = mMeeting;
  }, [mMeeting]);

  // Deterministic teardown of local hardware tracks and meeting session on unmount
  useEffect(() => {
    return () => {
      const currentMeeting = mMeetingRef.current;
      if (currentMeeting) {
        try {
          const localPart = currentMeeting.localParticipant;
          if (localPart?.webcamStream?.track && typeof localPart.webcamStream.track.stop === 'function') {
            localPart.webcamStream.track.stop();
          }
          if (localPart?.micStream?.track && typeof localPart.micStream.track.stop === 'function') {
            localPart.micStream.track.stop();
          }
          if (typeof currentMeeting.disableWebcam === 'function') {
            currentMeeting.disableWebcam();
          }
          if (typeof currentMeeting.disableMic === 'function') {
            currentMeeting.disableMic();
          }
          if (typeof currentMeeting.leave === 'function') {
            currentMeeting.leave();
          }
        } catch (err) {
          console.error('Error during meeting container teardown:', err);
        }
      }
    };
  }, []);

  // Raised hand participants hook
  const { participantRaisedHand, participantLoweredHand } = useRaisedHandParticipants();

  // Subscribe to RAISE_HAND events
  usePubSub('RAISE_HAND', {
    onMessageReceived: useCallback(
      (data) => {
        const localParticipantId = mMeeting?.localParticipant?.id;
        const { senderId, senderName, message } = data;
        const isLocal = senderId === localParticipantId;

        const isLower =
          message === 'LOWER_HAND' ||
          message === 'Lower Hand' ||
          data?.action === 'LOWER' ||
          data?.action === 'DOWN';

        if (isLower) {
          if (participantLoweredHand) {
            participantLoweredHand(senderId);
          }
        } else {
          playNotificationSound();
          showToast(`${isLocal ? 'You' : nameTructed(senderName, 15)} raised hand 🖐🏼`);
          if (participantRaisedHand) {
            participantRaisedHand(senderId);
          }
        }
      },
      [mMeeting, playNotificationSound, showToast, participantRaisedHand, participantLoweredHand]
    ),
  });

  // Subscribe to CHAT events
  usePubSub('CHAT', {
    onMessageReceived: useCallback(
      (data) => {
        const localParticipantId = mMeeting?.localParticipant?.id;
        const { senderId, senderName, message } = data;
        const isLocal = senderId === localParticipantId;

        if (!isLocal) {
          playNotificationSound();
          showToast(trimSnackBarText(`${nameTructed(senderName, 15)} says: ${message}`));
        }
      },
      [mMeeting, playNotificationSound, showToast]
    ),
  });

  // Calculate scheduled end time
  const scheduledEndTime = useMemo(() => {
    const endTimeStr =
      sessionData?.booking?.slotId?.endTime ||
      sessionData?.booking?.endTime ||
      sessionData?.slotId?.endTime;
    return endTimeStr ? new Date(endTimeStr).getTime() : null;
  }, [sessionData]);

  // Automatic session end and remaining time tracking
  useEffect(() => {
    if (!scheduledEndTime) return;

    const checkSessionTime = () => {
      const now = Date.now();
      const diffInSeconds = Math.floor((scheduledEndTime - now) / 1000);

      if (diffInSeconds <= 0) {
        setRemainingSeconds(0);
        if (!isEndingSession) {
          setIsEndingSession(true);
          if (setLeaveReason) {
            setLeaveReason('The scheduled session time has ended.');
          }
          toast.info('The scheduled session time has ended. Leaving call...', {
            position: 'top-center',
            autoClose: 4000,
          });
          const currentMeeting = mMeetingRef.current;
          if (currentMeeting && typeof currentMeeting.leave === 'function') {
            try {
              currentMeeting.leave();
            } catch (err) {
              console.error('Error leaving meeting on expiration:', err);
            }
          }
          setIsMeetingLeft(true);
        }
        return;
      }

      setRemainingSeconds(diffInSeconds);

      // Warning at 5 minutes
      if (diffInSeconds <= 300 && diffInSeconds > 60 && !warned5MinRef.current) {
        warned5MinRef.current = true;
        toast.warning('⚠️ 5 minutes remaining in this session.', {
          position: 'top-center',
          autoClose: 6000,
        });
      }

      // Warning at 1 minute
      if (diffInSeconds <= 60 && diffInSeconds > 0 && !warned1MinRef.current) {
        warned1MinRef.current = true;
        toast.error('⏳ 1 minute remaining! The session will automatically end at the scheduled time.', {
          position: 'top-center',
          autoClose: 8000,
        });
      }
    };

    checkSessionTime();
    const timerInterval = setInterval(checkSessionTime, 1000);
    return () => clearInterval(timerInterval);
  }, [scheduledEndTime, isEndingSession, setIsMeetingLeft, setLeaveReason]);

  const formattedTimeRemaining = useMemo(() => {
    if (remainingSeconds === null) return null;
    const mins = Math.max(0, Math.floor(remainingSeconds / 60));
    const secs = Math.max(0, remainingSeconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }, [remainingSeconds]);

  // Render waiting screen or meeting content
  const renderMeetingContent = () => {
    if (typeof localParticipantAllowedJoin !== 'boolean') {
      return !mMeeting.isMeetingJoined && <WaitingToJoinScreen />;
    }

    if (!localParticipantAllowedJoin) {
      return null;
    }

    return (
      <>
        {/* Main Meeting Area - Takes remaining height after bottom bar */}
        <div className="relative flex flex-1 flex-row bg-gradient-to-br from-neutral-900 via-neutral-900 to-primary-950/30 overflow-hidden">
          {formattedTimeRemaining && (
            <div
              className={`absolute top-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-3.5 py-1.5 rounded-full border shadow-lg backdrop-blur-md transition-all ${
                remainingSeconds <= 60
                  ? 'bg-red-950/80 text-red-300 border-red-500/60 animate-pulse'
                  : remainingSeconds <= 300
                    ? 'bg-amber-950/80 text-amber-300 border-amber-500/60'
                    : 'bg-neutral-900/80 text-neutral-200 border-neutral-700/80'
              }`}
            >
              <Clock
                className={`w-3.5 h-3.5 ${
                  remainingSeconds <= 60
                    ? 'text-red-400'
                    : remainingSeconds <= 300
                      ? 'text-amber-400'
                      : 'text-primary-400'
                }`}
              />
              <span className="text-xs font-semibold tracking-wide">
                Time Left: {formattedTimeRemaining}
              </span>
            </div>
          )}

          <div className="flex flex-1 overflow-hidden">
            {isPresenting && <PresenterView height={containerHeight - BOTTOM_BAR_HEIGHT} />}

            {isPresenting && isMobile ? (
              participantsData.map((participantId) => (
                <ParticipantMicStream key={participantId} participantId={participantId} />
              ))
            ) : (
              <MemorizedParticipantView isPresenting={isPresenting} />
            )}
          </div>

          <SidebarConatiner
            height={containerHeight - BOTTOM_BAR_HEIGHT}
            sideBarContainerWidth={sideBarContainerWidth}
          />
        </div>

        {/* Bottom Bar - Fixed height with theme colors */}
        <div className="flex-shrink-0 border-t border-neutral-800">
          <BottomBar bottomBarHeight={BOTTOM_BAR_HEIGHT} setIsMeetingLeft={setIsMeetingLeft} />
        </div>
      </>
    );
  };

  return (
    <div 
      className="fixed inset-0 overflow-hidden bg-gradient-to-br from-neutral-50 via-primary-50/30 to-primary-100/20 dark:from-neutral-950 dark:via-neutral-900 dark:to-primary-950/30"
      style={{ paddingTop: `${NAVBAR_HEIGHT}px` }}
    >
      <div ref={containerRef} className="h-full w-full flex flex-col overflow-hidden">
        {renderMeetingContent()}

        <ConfirmBox
          open={meetingErrorVisible}
          successText="OKAY"
          onSuccess={() => {
            setMeetingErrorVisible(false);
          }}
          title={`Error Code: ${meetingError.code}`}
          subTitle={meetingError.message}
        />
      </div>
    </div>
  );
}
