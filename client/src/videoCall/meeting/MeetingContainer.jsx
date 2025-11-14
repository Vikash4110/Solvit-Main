import React, { useState, useEffect, useRef, createRef, memo, useCallback, useMemo } from 'react';
import { Constants, useMeeting, useParticipant, usePubSub } from '@videosdk.live/react-sdk';
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

export function MeetingContainer({ onMeetingLeave, setIsMeetingLeft }) {
  const { setSelectedMic, setSelectedWebcam, setSelectedSpeaker, useRaisedHandParticipants } =
    useMeetingAppContext();

  // State
  const [participantsData, setParticipantsData] = useState([]);
  const [containerHeight, setContainerHeight] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [localParticipantAllowedJoin, setLocalParticipantAllowedJoin] = useState(null);
  const [meetingErrorVisible, setMeetingErrorVisible] = useState(false);
  const [meetingError, setMeetingError] = useState({ code: null, message: '' });

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

  // Raised hand participants hook
  const { participantRaisedHand } = useRaisedHandParticipants();

  // Subscribe to RAISE_HAND events
  usePubSub('RAISE_HAND', {
    onMessageReceived: useCallback(
      (data) => {
        const localParticipantId = mMeeting?.localParticipant?.id;
        const { senderId, senderName } = data;
        const isLocal = senderId === localParticipantId;

        playNotificationSound();
        showToast(`${isLocal ? 'You' : nameTructed(senderName, 15)} raised hand 🖐🏼`);
        participantRaisedHand(senderId);
      },
      [mMeeting, playNotificationSound, showToast, participantRaisedHand]
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
        <div className="flex flex-1 flex-row bg-gradient-to-br from-neutral-900 via-neutral-900 to-primary-950/30 overflow-hidden">
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
