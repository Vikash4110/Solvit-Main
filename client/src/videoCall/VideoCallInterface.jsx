import { useParams, useNavigate } from 'react-router-dom';
import { MeetingProvider } from '@videosdk.live/react-sdk';
import { useEffect, useState } from 'react';
import { MeetingAppProvider } from './MeetingAppContextDef';
import { MeetingContainer } from './meeting/MeetingContainer';
import { LeaveScreen } from './components/screens/LeaveScreen';
import { JoiningScreen } from './components/screens/JoiningScreen';
import { toast } from 'react-toastify';
import { useMeetingSession } from '../hooks/useMeetingSession';

// Helper to safely terminate media tracks and streams
const stopMediaStreamOrTrack = (streamOrTrack) => {
  if (!streamOrTrack) return;
  try {
    if (typeof streamOrTrack.stop === 'function') {
      streamOrTrack.stop();
    }
    if (typeof streamOrTrack.getTracks === 'function') {
      streamOrTrack.getTracks().forEach((track) => {
        if (track && typeof track.stop === 'function') {
          track.stop();
        }
      });
    }
  } catch (err) {
    console.error('Error stopping media track:', err);
  }
};

function VideoCallInterface() {
  const navigate = useNavigate();
  const { bookingId } = useParams();

  // Layer 3 Meeting Session Hook (Decoupled from Layer 4 Presentation)
  const {
    sessionData,
    userType,
    participantId,
    participantName,
    setParticipantName,
    meetingId,
    setMeetingId,
    loading,
    error,
  } = useMeetingSession(bookingId);

  const [token, setToken] = useState('');
  const [micOn, setMicOn] = useState(false);
  const [webcamOn, setWebcamOn] = useState(false);
  const [customAudioStream, setCustomAudioStream] = useState(null);
  const [customVideoStream, setCustomVideoStream] = useState(null);
  const [isMeetingStarted, setMeetingStarted] = useState(false);
  const [isMeetingLeft, setIsMeetingLeft] = useState(false);
  const [leaveReason, setLeaveReason] = useState('');

  const isMobile = window.matchMedia('only screen and (max-width: 768px)').matches;

  // Release camera and mic hardware handles on unmount, refresh, or tab close
  useEffect(() => {
    const handleTeardown = () => {
      stopMediaStreamOrTrack(customAudioStream);
      stopMediaStreamOrTrack(customVideoStream);
    };

    window.addEventListener('beforeunload', handleTeardown);
    window.addEventListener('pagehide', handleTeardown);

    return () => {
      window.removeEventListener('beforeunload', handleTeardown);
      window.removeEventListener('pagehide', handleTeardown);
      handleTeardown();
    };
  }, [customAudioStream, customVideoStream]);

  useEffect(() => {
    if (isMobile) {
      window.onbeforeunload = () => {
        return 'Are you sure you want to exit?';
      };
    }
  }, [isMobile]);

  return (
    <>
      <MeetingAppProvider>
        {isMeetingStarted ? (
          <MeetingProvider
            config={{
              meetingId,
              micEnabled: micOn,
              webcamEnabled: webcamOn,
              name: participantName ? participantName : 'TestUser',
              multiStream: false,
              customCameraVideoTrack: customVideoStream,
              customMicrophoneAudioTrack: customAudioStream,
              metaData: { participantId },
            }}
            token={token}
            reinitialiseMeetingOnConfigChange={true}
            joinWithoutUserInteraction={true}
          >
            <MeetingContainer
              onMeetingLeave={() => {
                stopMediaStreamOrTrack(customAudioStream);
                stopMediaStreamOrTrack(customVideoStream);
                setCustomAudioStream(null);
                setCustomVideoStream(null);
                setToken('');
                setMeetingId('');
                setParticipantName('');
                setWebcamOn(false);
                setMicOn(false);
                setMeetingStarted(false);
              }}
              setIsMeetingLeft={setIsMeetingLeft}
              participantId={participantId}
              sessionData={sessionData}
              setLeaveReason={setLeaveReason}
            />
          </MeetingProvider>
        ) : isMeetingLeft ? (
          <LeaveScreen
            setIsMeetingLeft={setIsMeetingLeft}
            participantId={participantId}
            leaveReason={leaveReason}
            setLeaveReason={setLeaveReason}
            sessionData={sessionData}
          />
        ) : (
          <JoiningScreen
            meetingId={meetingId}
            participantId={participantId}
            sessionData={sessionData}
            setToken={setToken}
            micOn={micOn}
            setMicOn={setMicOn}
            webcamOn={webcamOn}
            setWebcamOn={setWebcamOn}
            customAudioStream={customAudioStream}
            setCustomAudioStream={setCustomAudioStream}
            customVideoStream={customVideoStream}
            setCustomVideoStream={setCustomVideoStream}
            updateStartMeeting={() => {
              setMeetingStarted(true);
            }}
            startMeeting={isMeetingStarted}
            setIsMeetingLeft={setIsMeetingLeft}
            handleClickGoBack={() => navigate(-1)}
          />
        )}
      </MeetingAppProvider>
    </>
  );
}

export default VideoCallInterface;
