import { useParams } from 'react-router-dom';
import { MeetingProvider } from '@videosdk.live/react-sdk';
import { useEffect } from 'react';
import { useState } from 'react';
import { MeetingAppProvider } from './MeetingAppContextDef';
import { MeetingContainer } from './meeting/MeetingContainer';
import { LeaveScreen } from './components/screens/LeaveScreen';
import { JoiningScreen } from './components/screens/JoiningScreen';
import { useNavigate } from 'react-router-dom';
function VideoCallInterface() {
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [sessionData, setSessionData] = useState(null);
  const [userType, setUserType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { bookingId } = useParams();
  const [meetingId, setMeetingId] = useState('');
  const [participantId, setParticipantId] = useState('');
  const [participantName, setParticipantName] = useState('');
  const [micOn, setMicOn] = useState(false);
  const [webcamOn, setWebcamOn] = useState(false);
  const [customAudioStream, setCustomAudioStream] = useState(null);
  const [customVideoStream, setCustomVideoStream] = useState(null);
  const [isMeetingStarted, setMeetingStarted] = useState(false);
  const [isMeetingLeft, setIsMeetingLeft] = useState(false);

  const isMobile = window.matchMedia('only screen and (max-width: 768px)').matches;

  useEffect(() => {
    if (isMobile) {
      window.onbeforeunload = () => {
        return 'Are you sure you want to exit?';
      };
    }
  }, [isMobile]);

  useEffect(() => {
    const initializeSession = async () => {
      try {
        setLoading(true);

        // Get session details
        const detailsResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/meeting/session/${bookingId}/details`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('clientAccessToken')}`,
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          }
        );

        if (!detailsResponse.ok) {
          throw new Error('Failed to get session details');
        }

        const detailsData = await detailsResponse.json();

        setSessionData(detailsData.data);

        //setting user Type wether client or counselor
        setUserType(detailsData.data.userType);
        // console.log(userType)

        //setting participant id and participant name
        setParticipantId(
          detailsData.data.userType === 'client'
            ? `client - ${detailsData.data.booking.clientId._id}`
            : `counselor - ${detailsData.data.booking.slotId.counselorId._id}`
        );

        console.log(participantId);
        setParticipantName(
          detailsData.data.userType === 'client'
            ? detailsData.data.booking.clientId.fullName
            : detailsData.data.booking.slotId.counselorId.fullName
        );

        // setting meeting id
        setMeetingId(detailsData.data.booking.videoSDKRoomId);
      } catch (err) {
        console.error('Session initialization error:', err);
        setError(err.message);
        toast.error(err.message);
      } finally {
        // setLoading(false);
      }
    };

    if (bookingId) {
      initializeSession();
    }
  }, [bookingId]);

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
                setToken('');
                setMeetingId('');
                setParticipantName('');
                setWebcamOn(false);
                setMicOn(false);
                setMeetingStarted(false);
              }}
              setIsMeetingLeft={setIsMeetingLeft}
              participantId={participantId}
            />
          </MeetingProvider>
        ) : isMeetingLeft ? (
          <LeaveScreen setIsMeetingLeft={setIsMeetingLeft} participantId={participantId} />
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
