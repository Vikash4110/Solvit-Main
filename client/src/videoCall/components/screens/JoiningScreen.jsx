import React, { useEffect, useRef, useState } from 'react';
import { MeetingDetailsScreen } from '../MeetingDetailsScreen';
import { createMeeting, getTokenForJoiningSession, validateMeeting } from '../../api';
import ConfirmBox from '../ConfirmBox';
import { Constants, useMediaDevice } from '@videosdk.live/react-sdk';
import NetworkStats from '../NetworkStats';
import DropDownCam from '../DropDownCam';
import DropDownSpeaker from '../DropDownSpeaker';
import DropDown from '../DropDown';
import useMediaStream from '../../hooks/useMediaStream';
import useIsMobile from '../../hooks/useIsMobile';
import { useMeetingAppContext } from '../../MeetingAppContextDef';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Sparkles, 
  ShieldAlert 
} from 'lucide-react';

export function JoiningScreen({
  meetingId,
  participantId,
  handleClickGoBack,
  sessionData,
  setToken,
  setMicOn,
  setWebcamOn,
  updateStartMeeting,
  customAudioStream,
  setCustomAudioStream,
  setCustomVideoStream,
  micOn,
  webcamOn,
}) {
  const {
    selectedWebcam,
    selectedMic,
    setSelectedMic,
    setSelectedWebcam,
    setSelectedSpeaker,
    isCameraPermissionAllowed,
    isMicrophonePermissionAllowed,
    setIsCameraPermissionAllowed,
    setIsMicrophonePermissionAllowed,
  } = useMeetingAppContext();
  const isMobile = useIsMobile();

  const [{ webcams, mics, speakers }, setDevices] = useState({
    webcams: [],
    mics: [],
    speakers: [],
  });
  const { getVideoTrack, getAudioTrack } = useMediaStream();
  const { checkPermissions, getCameras, getMicrophones, requestPermission, getPlaybackDevices } =
    useMediaDevice({ onDeviceChanged });
  const [audioTrack, setAudioTrack] = useState(null);
  const [videoTrack, setVideoTrack] = useState(null);
  const [dlgMuted, setDlgMuted] = useState(false);
  const [dlgDevices, setDlgDevices] = useState(false);
  const [didDeviceChange, setDidDeviceChange] = useState(false);

  const videoPlayerRef = useRef();
  const videoTrackRef = useRef();
  const audioTrackRef = useRef();
  const audioAnalyserIntervalRef = useRef();
  const permissonAvaialble = useRef();
  const webcamRef = useRef();
  const micRef = useRef();

  useEffect(() => {
    webcamRef.current = webcamOn;
  }, [webcamOn]);

  useEffect(() => {
    micRef.current = micOn;
  }, [micOn]);

  useEffect(() => {
    permissonAvaialble.current = {
      isCameraPermissionAllowed,
      isMicrophonePermissionAllowed,
    };
  }, [isCameraPermissionAllowed, isMicrophonePermissionAllowed]);

  useEffect(() => {
    if (micOn) {
      audioTrackRef.current = audioTrack;
      startMuteListener();
    }
  }, [micOn, audioTrack]);

  useEffect(() => {
    if (webcamOn) {
      if (videoTrackRef.current && videoTrackRef.current !== videoTrack) {
        videoTrackRef.current.stop();
      }

      videoTrackRef.current = videoTrack;

      var isPlaying =
        videoPlayerRef.current.currentTime > 0 &&
        !videoPlayerRef.current.paused &&
        !videoPlayerRef.current.ended &&
        videoPlayerRef.current.readyState > videoPlayerRef.current.HAVE_CURRENT_DATA;

      if (videoTrack) {
        const videoSrcObject = new MediaStream([videoTrack]);

        if (videoPlayerRef.current) {
          videoPlayerRef.current.srcObject = videoSrcObject;
          if (videoPlayerRef.current.pause && !isPlaying) {
            videoPlayerRef.current.play().catch((error) => console.log('error', error));
          }
        }
      } else {
        if (videoPlayerRef.current) {
          videoPlayerRef.current.srcObject = null;
        }
      }
    }
  }, [webcamOn, videoTrack]);

  useEffect(() => {
    getCameraDevices();
  }, [isCameraPermissionAllowed]);

  useEffect(() => {
    getAudioDevices();
  }, [isMicrophonePermissionAllowed]);

  useEffect(() => {
    checkMediaPermission();
    return () => {};
  }, []);

  const _toggleWebcam = () => {
    const videoTrack = videoTrackRef.current;

    if (webcamOn) {
      if (videoTrack) {
        videoTrack.stop();
        setVideoTrack(null);
        setCustomVideoStream(null);
        setWebcamOn(false);
      }
    } else {
      getDefaultMediaTracks({ mic: false, webcam: true });
      setWebcamOn(true);
    }
  };

  const _toggleMic = () => {
    const audioTrack = audioTrackRef.current;

    if (micOn) {
      if (audioTrack) {
        audioTrack.stop();
        setAudioTrack(null);
        setCustomAudioStream(null);
        setMicOn(false);
      }
    } else {
      getDefaultMediaTracks({ mic: true, webcam: false });
      setMicOn(true);
    }
  };

  const changeWebcam = async (deviceId) => {
    if (webcamOn) {
      const currentvideoTrack = videoTrackRef.current;
      if (currentvideoTrack) {
        currentvideoTrack.stop();
      }

      const stream = await getVideoTrack({
        webcamId: deviceId,
      });
      setCustomVideoStream(stream);
      const videoTracks = stream?.getVideoTracks();
      const videoTrack = videoTracks.length ? videoTracks[0] : null;
      setVideoTrack(videoTrack);
    }
  };

  const changeMic = async (deviceId) => {
    if (micOn) {
      const currentAudioTrack = audioTrackRef.current;
      currentAudioTrack && currentAudioTrack.stop();
      const stream = await getAudioTrack({
        micId: deviceId,
      });
      setCustomAudioStream(stream);
      const audioTracks = stream?.getAudioTracks();
      const audioTrack = audioTracks.length ? audioTracks[0] : null;
      clearInterval(audioAnalyserIntervalRef.current);
      setAudioTrack(audioTrack);
    }
  };

  const getDefaultMediaTracks = async ({ mic, webcam }) => {
    if (mic) {
      const stream = await getAudioTrack({
        micId: selectedMic.id,
      });
      setCustomAudioStream(stream);
      const audioTracks = stream?.getAudioTracks();
      const audioTrack = audioTracks?.length ? audioTracks[0] : null;
      setAudioTrack(audioTrack);
    }

    if (webcam) {
      const stream = await getVideoTrack({
        webcamId: selectedWebcam?.id,
      });
      setCustomVideoStream(stream);
      const videoTracks = stream?.getVideoTracks();
      const videoTrack = videoTracks.length ? videoTracks[0] : null;
      setVideoTrack(videoTrack);
    }
  };

  async function startMuteListener() {
    const currentAudioTrack = audioTrackRef.current;
    if (currentAudioTrack) {
      if (currentAudioTrack.muted) {
        setDlgMuted(true);
      }
      currentAudioTrack.addEventListener('mute', (ev) => {
        setDlgMuted(true);
      });
    }
  }

  const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
  async function requestAudioVideoPermission(mediaType) {
    try {
      const permission = await requestPermission(mediaType);

      if (isFirefox) {
        const isVideoAllowed = permission.get('video');
        setIsCameraPermissionAllowed(isVideoAllowed);
        if (isVideoAllowed) {
          setWebcamOn(true);
          await getDefaultMediaTracks({ mic: false, webcam: true });
        }
      }

      if (isFirefox) {
        const isAudioAllowed = permission.get('audio');
        setIsMicrophonePermissionAllowed(isAudioAllowed);
        if (isAudioAllowed) {
          setMicOn(true);
          await getDefaultMediaTracks({ mic: true, webcam: false });
        }
      }

      if (mediaType === Constants.permission.AUDIO) {
        const isAudioAllowed = permission.get(Constants.permission.AUDIO);
        setIsMicrophonePermissionAllowed(isAudioAllowed);
        if (isAudioAllowed) {
          setMicOn(true);
          await getDefaultMediaTracks({ mic: true, webcam: false });
        }
      }

      if (mediaType === Constants.permission.VIDEO) {
        const isVideoAllowed = permission.get(Constants.permission.VIDEO);
        setIsCameraPermissionAllowed(isVideoAllowed);
        if (isVideoAllowed) {
          setWebcamOn(true);
          await getDefaultMediaTracks({ mic: false, webcam: true });
        }
      }
    } catch (ex) {
      console.log('Error in requestPermission ', ex);
    }
  }

  function onDeviceChanged() {
    setDidDeviceChange(true);
    getCameraDevices();
    getAudioDevices();
    getDefaultMediaTracks({ mic: micRef.current, webcam: webcamRef.current });
  }

  const checkMediaPermission = async () => {
    try {
      const checkAudioVideoPermission = await checkPermissions();
      const cameraPermissionAllowed = checkAudioVideoPermission.get(Constants.permission.VIDEO);
      const microphonePermissionAllowed = checkAudioVideoPermission.get(Constants.permission.AUDIO);

      setIsCameraPermissionAllowed(cameraPermissionAllowed);
      setIsMicrophonePermissionAllowed(microphonePermissionAllowed);

      if (microphonePermissionAllowed) {
        setMicOn(true);
        getDefaultMediaTracks({ mic: true, webcam: false });
      } else {
        await requestAudioVideoPermission(Constants.permission.AUDIO);
      }
      if (cameraPermissionAllowed) {
        setWebcamOn(true);
        getDefaultMediaTracks({ mic: false, webcam: true });
      } else {
        await requestAudioVideoPermission(Constants.permission.VIDEO);
      }
    } catch (error) {
      await requestAudioVideoPermission();
      console.log(error);
    }
  };

  const getCameraDevices = async () => {
    try {
      if (permissonAvaialble.current?.isCameraPermissionAllowed) {
        let webcams = await getCameras();
        setSelectedWebcam({
          id: webcams[0]?.deviceId,
          label: webcams[0]?.label,
        });
        setDevices((devices) => {
          return { ...devices, webcams };
        });
      }
    } catch (err) {
      console.log('Error in getting camera devices', err);
    }
  };

  const getAudioDevices = async () => {
    try {
      if (permissonAvaialble.current?.isMicrophonePermissionAllowed) {
        let mics = await getMicrophones();
        let speakers = await getPlaybackDevices();
        const hasMic = mics.length > 0;
        if (hasMic) {
          startMuteListener();
        }

        setSelectedSpeaker({
          id: speakers[0]?.deviceId,
          label: speakers[0]?.label,
        });
        await setSelectedMic({ id: mics[0]?.deviceId, label: mics[0]?.label });
        setDevices((devices) => {
          return { ...devices, mics, speakers };
        });
      }
    } catch (err) {
      console.log('Error in getting audio devices', err);
    }
  };

  useEffect(() => {
    getAudioDevices();
  }, []);

  // Button with HowItWorks Icon Style
  const ButtonWithTooltip = ({ onClick, onState, isMic }) => {
    const btnRef = useRef();
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              ref={btnRef}
              onClick={onClick}
              size="icon"
              className={`group h-14 w-14 rounded-xl transition-all duration-300 hover:scale-110 ${
                onState
                  ? 'bg-gradient-to-br from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 shadow-lg hover:shadow-xl hover:shadow-primary-500/30'
                  : 'bg-gradient-to-br from-red-500 to-red-600 shadow-lg hover:shadow-xl hover:shadow-red-500/30'
              }`}
            >
              {isMic ? (
                onState ? <Mic className="h-6 w-6 text-white" /> : <MicOff className="h-6 w-6 text-white" />
              ) : (
                onState ? <Video className="h-6 w-6 text-white" /> : <VideoOff className="h-6 w-6 text-white" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-primary-900 text-white dark:bg-primary-700">
            <p className="text-xs font-medium">
              {isMic 
                ? (onState ? 'Mute microphone' : 'Unmute microphone')
                : (onState ? 'Turn off camera' : 'Turn on camera')
              }
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  // Permission Denied Badge with HowItWorks Icon Style
  const PermissionDeniedBadge = ({ type }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-neutral-300 to-neutral-400 dark:from-neutral-700 dark:to-neutral-800 flex items-center justify-center shadow-lg opacity-60 cursor-not-allowed">
            {type === 'mic' ? (
              <MicOff className="h-6 w-6 text-white" />
            ) : (
              <VideoOff className="h-6 w-6 text-white" />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent className="bg-red-600 text-white">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" />
            <p className="text-xs font-medium">
              {type === 'mic' ? 'Microphone' : 'Camera'} permission denied
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <>
      <div className="flex min-h-screen flex-1 flex-col overflow-y-auto bg-gradient-to-br from-neutral-50 via-primary-50/30 to-primary-100/20 dark:from-neutral-950 dark:via-neutral-900 dark:to-primary-950/30">
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-6 md:px-6 md:py-8 lg:px-8 lg:py-12 pt-20">
          <div className="mx-auto w-full max-w-7xl">
            {/* Header Section */}
            <div className="mb-6 text-center space-y-3">
              <Badge className="inline-flex items-center gap-1.5 bg-primary-100 text-primary-700 hover:bg-primary-200 border-0 px-3 py-1 dark:bg-primary-900/30 dark:text-primary-400">
                <Sparkles className="h-3 w-3" />
                Setup Your Devices
              </Badge>
              <h1 className="text-2xl font-bold text-primary-900 dark:text-white md:text-3xl lg:text-4xl">
                Get Ready to Join
              </h1>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 md:text-base">
                Check your audio and video before joining the session
              </p>
            </div>

            <div className="grid grid-cols-12 gap-6">
              {/* Video Preview Section */}
              <div className="col-span-12 md:col-span-7 2xl:col-span-7">
                <Card className="group overflow-hidden border-neutral-200 bg-white shadow-xl hover:shadow-2xl transition-all duration-300 dark:border-neutral-800 dark:bg-neutral-900">
                  <CardContent className="p-4 sm:p-6">
                    <div className="relative w-full space-y-4">
                      {/* Video Container */}
                      <div
                        className="relative w-full overflow-hidden rounded-xl border-2 border-neutral-200 bg-neutral-900 shadow-2xl ring-4 ring-primary-100/50 group-hover:ring-primary-200/60 transition-all duration-300 dark:border-neutral-700 dark:ring-primary-900/30"
                        style={{ height: isMobile ? '45vh' : '55vh' }}
                      >
                        {/* Network Stats Badge */}
                        <div className={`absolute z-10 ${isMobile ? 'right-2 top-2' : 'right-3 top-3'}`}>
                          <NetworkStats />
                        </div>

                        {/* Video Player */}
                        <video
                          autoPlay
                          playsInline
                          muted
                          ref={videoPlayerRef}
                          controls={false}
                          style={{
                            backgroundColor: '#1c1c1c',
                            transform: 'scaleX(-1)',
                            WebkitTransform: 'scaleX(-1)',
                          }}
                          className="flip h-full w-full object-cover"
                        />

                        {/* Video Overlay - No Camera State */}
                        {!webcamOn && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900">
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-700/50 backdrop-blur-sm ring-4 ring-neutral-600/20">
                              <VideoOff className="h-10 w-10 text-neutral-400" />
                            </div>
                            <p className="mt-4 text-sm font-medium text-neutral-300">Camera is off</p>
                            <p className="mt-1 text-xs text-neutral-500">Turn on your camera to preview</p>
                          </div>
                        )}

                        {/* Control Bar with HowItWorks Icon Style */}
                        <div className="absolute bottom-4 left-0 right-0 xl:bottom-6">
                          <div className="mx-auto flex w-fit items-center justify-center gap-4 rounded-2xl border border-neutral-200/20 bg-white/95 px-5 py-4 shadow-2xl backdrop-blur-xl dark:border-neutral-700/30 dark:bg-neutral-900/95">
                            {isMicrophonePermissionAllowed ? (
                              <ButtonWithTooltip
                                onClick={_toggleMic}
                                onState={micOn}
                                isMic={true}
                              />
                            ) : (
                              <PermissionDeniedBadge type="mic" />
                            )}

                            {isCameraPermissionAllowed ? (
                              <ButtonWithTooltip
                                onClick={_toggleWebcam}
                                onState={webcamOn}
                                isMic={false}
                              />
                            ) : (
                              <PermissionDeniedBadge type="camera" />
                            )}
                          </div>
                        </div>
                      </div>

                      <Separator className="bg-neutral-200 dark:bg-neutral-700" />

                      {/* Device Settings */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                            Device Settings
                          </h3>
                          <Badge variant="secondary" className="text-xs">
                            {mics.length + webcams.length + speakers.length} devices
                          </Badge>
                        </div>
                        
                        <div className="flex flex-wrap gap-3">
                          <div className="flex-1 min-w-[200px]">
                            <Card className="border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">
                              <CardContent className="p-3">
                                <DropDown
                                  mics={mics}
                                  changeMic={changeMic}
                                  customAudioStream={customAudioStream}
                                  audioTrack={audioTrack}
                                  micOn={micOn}
                                  didDeviceChange={didDeviceChange}
                                  setDidDeviceChange={setDidDeviceChange}
                                />
                              </CardContent>
                            </Card>
                          </div>

                          {!isMobile && (
                            <div className="flex-1 min-w-[200px]">
                              <Card className="border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">
                                <CardContent className="p-3">
                                  <DropDownSpeaker speakers={speakers} />
                                </CardContent>
                              </Card>
                            </div>
                          )}

                          <div className="flex-1 min-w-[200px]">
                            <Card className="border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">
                              <CardContent className="p-3">
                                <DropDownCam changeWebcam={changeWebcam} webcams={webcams} />
                              </CardContent>
                            </Card>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Meeting Details Section */}
              <div className="col-span-12 md:col-span-5 2xl:col-span-5 md:relative">
                <div className="flex flex-1 flex-col items-center justify-center md:absolute md:inset-0 md:mt-0 mt-6 lg:mt-14 xl:mt-20 xl:m-16 lg:m-6">
                  <MeetingDetailsScreen
                    sessionData={sessionData}
                    handleOnClickJoin={async () => {
                      console.log(participantId);
                      const token = await getTokenForJoiningSession(sessionData, participantId);
                      setToken(token);
                      updateStartMeeting();
                    }}
                    handleClickGoBack={handleClickGoBack}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmBox
        open={dlgMuted}
        successText="OKAY"
        onSuccess={() => {
          setDlgMuted(false);
        }}
        title="System mic is muted"
        subTitle="You're default microphone is muted, please unmute it or increase audio input volume from system settings."
      />

      <ConfirmBox
        open={dlgDevices}
        successText="DISMISS"
        onSuccess={() => {
          setDlgDevices(false);
        }}
        title="Mic or webcam not available"
        subTitle="Please connect a mic and webcam to speak and share your video in the meeting. You can also join without them."
      />
    </>
  );
}
