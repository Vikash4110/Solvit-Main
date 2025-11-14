import { Constants, useMeeting, usePubSub, useMediaDevice } from '@videosdk.live/react-sdk';
import React, { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import {
  Copy,
  Check,
  ChevronDown,
  MoreHorizontal,
  Mic,
  MicOff,
  Video,
  VideoOff,
  MonitorUp,
  MessageSquare,
  Users,
  PhoneOff,
  Hand,
  PictureInPicture2,
  Circle,
} from 'lucide-react';
import recordingBlink from '../../static/animations/recording-blink.json';
import useIsRecording from '../../hooks/useIsRecording';
import { OutlinedButton } from '../../components/buttons/OutlinedButton';
import useIsTab from '../../hooks/useIsTab';
import useIsMobile from '../../hooks/useIsMobile';
import { MobileIconButton } from '../../components/buttons/MobileIconButton';
import { sideBarModes } from '../../utils/common';
import { Dialog, Popover, Transition } from '@headlessui/react';
import { createPopper } from '@popperjs/core';
import { useMeetingAppContext } from '../../MeetingAppContextDef';
import useMediaStream from '../../hooks/useMediaStream';

function PipBTN({ isMobile, isTab }) {
  const { pipMode, setPipMode } = useMeetingAppContext();

  const getRowCount = (length) => {
    return length > 2 ? 2 : length > 0 ? 1 : 0;
  };
  const getColCount = (length) => {
    return length < 2 ? 1 : length < 5 ? 2 : 3;
  };

  const pipWindowRef = useRef(null);
  const togglePipMode = async () => {
    if (pipWindowRef.current) {
      await document.exitPictureInPicture();
      pipWindowRef.current = null;
      return;
    }

    if ('pictureInPictureEnabled' in document) {
      const source = document.createElement('canvas');
      const ctx = source.getContext('2d');

      const pipVideo = document.createElement('video');
      pipWindowRef.current = pipVideo;
      pipVideo.autoplay = true;

      const stream = source.captureStream();
      pipVideo.srcObject = stream;
      drawCanvas();

      pipVideo.onloadedmetadata = () => {
        pipVideo.requestPictureInPicture();
      };
      await pipVideo.play();

      pipVideo.addEventListener('enterpictureinpicture', (event) => {
        drawCanvas();
        setPipMode(true);
      });

      pipVideo.addEventListener('leavepictureinpicture', (event) => {
        pipWindowRef.current = null;
        setPipMode(false);
        pipVideo.srcObject.getTracks().forEach((track) => track.stop());
      });

      function drawCanvas() {
        const videos = document.querySelectorAll('video');
        try {
          ctx.fillStyle = 'black';
          ctx.fillRect(0, 0, source.width, source.height);

          const rows = getRowCount(videos.length);
          const columns = getColCount(videos.length);
          for (let i = 0; i < rows; i++) {
            for (let j = 0; j < columns; j++) {
              if (j + i * columns <= videos.length || videos.length === 1) {
                ctx.drawImage(
                  videos[j + i * columns],
                  j < 1 ? 0 : source.width / (columns / j),
                  i < 1 ? 0 : source.height / (rows / i),
                  source.width / columns,
                  source.height / rows
                );
              }
            }
          }
        } catch (error) {
          console.log(error);
        }

        if (document.pictureInPictureElement === pipVideo) {
          requestAnimationFrame(drawCanvas);
        }
      }
    } else {
      alert('PIP is not supported by your browser');
    }
  };

  return isMobile || isTab ? (
    <MobileIconButton
      id="pip-btn"
      tooltipTitle={pipMode ? 'Stop PiP' : 'Start Pip'}
      buttonText={pipMode ? 'Stop PiP' : 'Start Pip'}
      isFocused={pipMode}
      Icon={PictureInPicture2}
      onClick={() => {
        togglePipMode();
      }}
      disabled={false}
    />
  ) : (
    <OutlinedButton
      Icon={PictureInPicture2}
      onClick={() => {
        togglePipMode();
      }}
      isFocused={pipMode}
      tooltip={pipMode ? 'Stop PiP' : 'Start PiP'}
      disabled={false}
    />
  );
}

const MicBTN = () => {
  const {
    selectedMic,
    setSelectedMic,
    selectedSpeaker,
    setSelectedSpeaker,
    isMicrophonePermissionAllowed,
  } = useMeetingAppContext();

  const { getMicrophones, getPlaybackDevices } = useMediaDevice();

  const mMeeting = useMeeting();
  const [mics, setMics] = useState([]);
  const [speakers, setSpeakers] = useState([]);
  const localMicOn = mMeeting?.localMicOn;
  const changeMic = mMeeting?.changeMic;

  useMediaDevice({
    onDeviceChanged,
  });

  function onDeviceChanged(devices) {
    getMics();
    const newSpeakerList = devices.devices.filter((device) => device.kind === 'audiooutput');

    if (newSpeakerList.length > 0) {
      setSelectedSpeaker({ id: newSpeakerList[0].deviceId, label: newSpeakerList[0].label });
    }
  }

  const getMics = async () => {
    const mics = await getMicrophones();
    const speakers = await getPlaybackDevices();

    mics && mics?.length && setMics(mics);
    speakers && speakers?.length && setSpeakers(speakers);
  };

  const [tooltipShow, setTooltipShow] = useState(false);
  const btnRef = useRef();
  const tooltipRef = useRef();

  const openTooltip = () => {
    createPopper(btnRef.current, tooltipRef.current, {
      placement: 'top',
    });
    setTooltipShow(true);
  };
  const closeTooltip = () => {
    setTooltipShow(false);
  };

  return (
    <>
      <OutlinedButton
        Icon={localMicOn ? Mic : MicOff}
        onClick={() => {
          mMeeting.toggleMic();
        }}
        bgColor={localMicOn ? 'bg-gradient-to-br from-primary-600 to-primary-700' : 'bg-neutral-800'}
        borderColor={localMicOn && 'border-primary-700'}
        isFocused={localMicOn}
        focusIconColor={localMicOn && 'white'}
        tooltip={'Toggle Mic'}
        renderRightComponent={() => {
          return (
            <>
              <Popover className="relative">
                {({ close }) => (
                  <>
                    <Popover.Button
                      disabled={!isMicrophonePermissionAllowed}
                      className="flex items-center justify-center mt-1 mr-1 focus:outline-none"
                    >
                      <div ref={btnRef} onMouseEnter={openTooltip} onMouseLeave={closeTooltip}>
                        <button
                          onClick={() => {
                            getMics();
                          }}
                        >
                          <ChevronDown
                            className="h-4 w-4"
                            style={{
                              color: mMeeting.localMicOn ? 'white' : '#6B7280',
                            }}
                          />
                        </button>
                      </div>
                    </Popover.Button>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="opacity-0 translate-y-1"
                      enterTo="opacity-100 translate-y-0"
                      leave="transition ease-in duration-150"
                      leaveFrom="opacity-100 translate-y-0"
                      leaveTo="opacity-0 translate-y-1"
                    >
                      <Popover.Panel className="absolute left-1/2 bottom-full z-10 mt-3 w-72 -translate-x-1/2 transform px-4 sm:px-0 pb-4">
                        <div className="overflow-hidden rounded-xl shadow-2xl ring-1 ring-neutral-700">
                          <div className="bg-neutral-800 py-1">
                            <div>
                              <div className="flex items-center p-3 pb-0 gap-2">
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-primary-700 shadow-lg">
                                  <Mic className="h-3.5 w-3.5 text-white" />
                                </div>
                                <p className="text-sm font-bold text-white">MICROPHONE</p>
                              </div>
                              <div className="flex flex-col">
                                {mics.map(({ deviceId, label }, index) => (
                                  <div
                                    key={`mics_${deviceId}`}
                                    className={`px-3 py-2 my-1 pl-6 text-white text-left hover:bg-primary-900/30 transition-colors ${
                                      deviceId === selectedMic.id && 'bg-primary-900/20'
                                    }`}
                                  >
                                    <button
                                      className={`flex flex-1 w-full text-left text-sm`}
                                      onClick={() => {
                                        setSelectedMic({ id: deviceId, label });
                                        changeMic(deviceId);
                                        close();
                                      }}
                                    >
                                      {label || `Mic ${index + 1}`}
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <hr className="border border-neutral-700 mt-2 mb-1" />
                            <div>
                              <div className="flex items-center p-3 pb-0 gap-2">
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-primary-700 shadow-lg">
                                  <svg className="h-3.5 w-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                  </svg>
                                </div>
                                <p className="text-sm font-bold text-white">SPEAKER</p>
                              </div>
                              <div className="flex flex-col">
                                {speakers.map(({ deviceId, label }, index) => (
                                  <div
                                    key={`speakers_${deviceId}`}
                                    className={`px-3 py-2 my-1 pl-6 text-white hover:bg-primary-900/30 transition-colors ${
                                      deviceId === selectedSpeaker.id && 'bg-primary-900/20'
                                    }`}
                                  >
                                    <button
                                      className={`flex flex-1 w-full text-left text-sm`}
                                      onClick={() => {
                                        setSelectedSpeaker({ id: deviceId, label });
                                        close();
                                      }}
                                    >
                                      {label || `Speaker ${index + 1}`}
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Popover.Panel>
                    </Transition>
                  </>
                )}
              </Popover>
              <div
                style={{ zIndex: 999 }}
                className={`${
                  tooltipShow ? '' : 'hidden'
                } overflow-hidden flex flex-col items-center justify-center pb-4`}
                ref={tooltipRef}
              >
                <div className="rounded-lg p-2 bg-neutral-900 shadow-xl">
                  <p className="text-sm text-white font-medium">Change microphone</p>
                </div>
              </div>
            </>
          );
        }}
      />
    </>
  );
};

const WebCamBTN = () => {
  const { selectedWebcam, setSelectedWebcam, isCameraPermissionAllowed } = useMeetingAppContext();

  const { getCameras } = useMediaDevice();
  const mMeeting = useMeeting();
  const [webcams, setWebcams] = useState([]);
  const { getVideoTrack } = useMediaStream();

  const localWebcamOn = mMeeting?.localWebcamOn;
  const changeWebcam = mMeeting?.changeWebcam;

  const getWebcams = async () => {
    let webcams = await getCameras();
    webcams && webcams?.length && setWebcams(webcams);
  };

  const [tooltipShow, setTooltipShow] = useState(false);
  const btnRef = useRef();
  const tooltipRef = useRef();

  const openTooltip = () => {
    createPopper(btnRef.current, tooltipRef.current, {
      placement: 'top',
    });
    setTooltipShow(true);
  };
  const closeTooltip = () => {
    setTooltipShow(false);
  };

  return (
    <>
      <OutlinedButton
        Icon={localWebcamOn ? Video : VideoOff}
        onClick={async () => {
          let track;
          if (!localWebcamOn) {
            track = await getVideoTrack({
              webcamId: selectedWebcam.id,
            });
          }
          mMeeting.toggleWebcam(track);
        }}
        bgColor={localWebcamOn ? 'bg-gradient-to-br from-primary-600 to-primary-700' : 'bg-neutral-800'}
        borderColor={localWebcamOn && 'border-primary-700'}
        isFocused={localWebcamOn}
        focusIconColor={localWebcamOn && 'white'}
        tooltip={'Toggle Webcam'}
        renderRightComponent={() => {
          return (
            <>
              <Popover className="relative">
                {({ close }) => (
                  <>
                    <Popover.Button
                      disabled={!isCameraPermissionAllowed}
                      className="flex items-center justify-center mt-1 mr-1 focus:outline-none"
                    >
                      <div ref={btnRef} onMouseEnter={openTooltip} onMouseLeave={closeTooltip}>
                        <button
                          onClick={() => {
                            getWebcams();
                          }}
                        >
                          <ChevronDown
                            className="h-4 w-4"
                            style={{
                              color: localWebcamOn ? 'white' : '#6B7280',
                            }}
                          />
                        </button>
                      </div>
                    </Popover.Button>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="opacity-0 translate-y-1"
                      enterTo="opacity-100 translate-y-0"
                      leave="transition ease-in duration-150"
                      leaveFrom="opacity-100 translate-y-0"
                      leaveTo="opacity-0 translate-y-1"
                    >
                      <Popover.Panel className="absolute left-1/2 bottom-full z-10 mt-3 w-72 -translate-x-1/2 transform px-4 sm:px-0 pb-4">
                        <div className="overflow-hidden rounded-xl shadow-2xl ring-1 ring-neutral-700">
                          <div className="bg-neutral-800 py-1">
                            <div>
                              <div className="flex items-center p-3 pb-0 gap-2">
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-primary-700 shadow-lg">
                                  <Video className="h-3.5 w-3.5 text-white" />
                                </div>
                                <p className="text-sm font-bold text-white">WEBCAM</p>
                              </div>
                              <div className="flex flex-col">
                                {webcams.map(({ deviceId, label }, index) => (
                                  <div
                                    key={`output_webcams_${deviceId}`}
                                    className={`px-3 py-2 my-1 pl-6 text-white hover:bg-primary-900/30 transition-colors ${
                                      deviceId === selectedWebcam.id && 'bg-primary-900/20'
                                    }`}
                                  >
                                    <button
                                      className={`flex flex-1 w-full text-left text-sm`}
                                      onClick={() => {
                                        setSelectedWebcam({ id: deviceId, label });
                                        changeWebcam(deviceId);
                                        close();
                                      }}
                                    >
                                      {label || `Webcam ${index + 1}`}
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Popover.Panel>
                    </Transition>
                  </>
                )}
              </Popover>
              <div
                style={{ zIndex: 999 }}
                className={`${
                  tooltipShow ? '' : 'hidden'
                } overflow-hidden flex flex-col items-center justify-center pb-4`}
                ref={tooltipRef}
              >
                <div className="rounded-lg p-2 bg-neutral-900 shadow-xl">
                  <p className="text-sm text-white font-medium">Change webcam</p>
                </div>
              </div>
            </>
          );
        }}
      />
    </>
  );
};

export function BottomBar({ bottomBarHeight, setIsMeetingLeft }) {
  const { sideBarMode, setSideBarMode } = useMeetingAppContext();
  
  const RaiseHandBTN = ({ isMobile, isTab }) => {
    const { publish } = usePubSub('RAISE_HAND');
    const RaiseHand = () => {
      publish('Raise Hand');
   
    };

    return isMobile || isTab ? (
      <MobileIconButton
        id="RaiseHandBTN"
        tooltipTitle={'Raise hand'}
        Icon={Hand}
        onClick={RaiseHand}
        buttonText={'Raise Hand'}
      />
    ) : (
      <OutlinedButton onClick={RaiseHand} tooltip={'Raise Hand'} Icon={Hand} />
    );
  };

  const RecordingBTN = () => {
    const { startRecording, stopRecording, recordingState } = useMeeting();
    const defaultOptions = {
      loop: true,
      autoplay: true,
      animationData: recordingBlink,
      rendererSettings: {
        preserveAspectRatio: 'xMidYMid slice',
      },
      height: 64,
      width: 160,
    };

    const isRecording = useIsRecording();
    const isRecordingRef = useRef(isRecording);

    useEffect(() => {
      isRecordingRef.current = isRecording;
    }, [isRecording]);

    const { isRequestProcessing } = useMemo(
      () => ({
        isRequestProcessing:
          recordingState === Constants.recordingEvents.RECORDING_STARTING ||
          recordingState === Constants.recordingEvents.RECORDING_STOPPING,
      }),
      [recordingState]
    );

    const _handleClick = () => {
      const isRecording = isRecordingRef.current;

      if (isRecording) {
        stopRecording();
      } else {
        startRecording();
      }
    };

    return (
      <OutlinedButton
        Icon={Circle}
        onClick={_handleClick}
        isFocused={isRecording}
        bgColor={isRecording ? 'bg-gradient-to-br from-red-500 to-red-600 animate-pulse' : 'bg-neutral-800'}
        tooltip={
          recordingState === Constants.recordingEvents.RECORDING_STARTED
            ? 'Stop Recording'
            : recordingState === Constants.recordingEvents.RECORDING_STARTING
              ? 'Starting Recording'
              : recordingState === Constants.recordingEvents.RECORDING_STOPPED
                ? 'Start Recording'
                : recordingState === Constants.recordingEvents.RECORDING_STOPPING
                  ? 'Stopping Recording'
                  : 'Start Recording'
        }
        lottieOption={isRecording ? defaultOptions : null}
        isRequestProcessing={isRequestProcessing}
      />
    );
  };

  const ScreenShareBTN = ({ isMobile, isTab }) => {
    const { localScreenShareOn, toggleScreenShare, presenterId } = useMeeting();

    return isMobile || isTab ? (
      <MobileIconButton
        id="screen-share-btn"
        tooltipTitle={
          presenterId ? (localScreenShareOn ? 'Stop Presenting' : null) : 'Present Screen'
        }
        buttonText={
          presenterId ? (localScreenShareOn ? 'Stop Presenting' : null) : 'Present Screen'
        }
        isFocused={localScreenShareOn}
        Icon={MonitorUp}
        onClick={() => {
          toggleScreenShare();
        }}
        disabled={presenterId ? (localScreenShareOn ? false : true) : isMobile ? true : false}
      />
    ) : (
      <OutlinedButton
        Icon={MonitorUp}
        onClick={() => {
          toggleScreenShare();
        }}
        isFocused={localScreenShareOn}
        tooltip={presenterId ? (localScreenShareOn ? 'Stop Presenting' : null) : 'Present Screen'}
        disabled={presenterId ? (localScreenShareOn ? false : true) : false}
      />
    );
  };

  const LeaveBTN = () => {
    const { leave } = useMeeting();

    return (
      <OutlinedButton
        Icon={PhoneOff}
        bgColor="bg-gradient-to-br from-red-500 to-red-600"
        onClick={() => {
          leave();
          setIsMeetingLeft(true);
        }}
        tooltip="Leave Meeting"
      />
    );
  };

  const ChatBTN = ({ isMobile, isTab }) => {
    return isMobile || isTab ? (
      <MobileIconButton
        tooltipTitle={'Chat'}
        buttonText={'Chat'}
        Icon={MessageSquare}
        isFocused={sideBarMode === sideBarModes.CHAT}
        onClick={() => {
          setSideBarMode((s) => (s === sideBarModes.CHAT ? null : sideBarModes.CHAT));
          setOpen(false)
        }}
      />
    ) : (
      <OutlinedButton
        Icon={MessageSquare}
        onClick={() => {
          setSideBarMode((s) => (s === sideBarModes.CHAT ? null : sideBarModes.CHAT));
        }}
        isFocused={sideBarMode === 'CHAT'}
        tooltip="View Chat"
      />
    );
  };

  const ParticipantsBTN = ({ isMobile, isTab }) => {
    const { participants } = useMeeting();
    return isMobile || isTab ? (
      <MobileIconButton
        tooltipTitle={'Participants'}
        isFocused={sideBarMode === sideBarModes.PARTICIPANTS}
        buttonText={'Participants'}
        disabledOpacity={1}
        Icon={Users}
        onClick={() => {
          setSideBarMode((s) =>
            s === sideBarModes.PARTICIPANTS ? null : sideBarModes.PARTICIPANTS
          );
          setOpen(false)
        }}
        badge={`${new Map(participants)?.size}`}
      />
    ) : (
      <OutlinedButton
        Icon={Users}
        onClick={() => {
          setSideBarMode((s) =>
            s === sideBarModes.PARTICIPANTS ? null : sideBarModes.PARTICIPANTS
          );
        }}
        isFocused={sideBarMode === sideBarModes.PARTICIPANTS}
        tooltip={'View Participants'}
        badge={`${new Map(participants)?.size}`}
      />
    );
  };

  const MeetingIdCopyBTN = () => {
    const { meetingId } = useMeeting();
    const [isCopied, setIsCopied] = useState(false);
    return (
      <div className="flex items-center justify-center lg:ml-0 ml-4 mt-4 xl:mt-0">
        <div className="flex border-2 border-neutral-700 bg-neutral-800/50 backdrop-blur-sm p-2.5 rounded-xl items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300">
          <h1 className="text-white text-sm font-semibold">{meetingId}</h1>
          <button
            className="ml-2 p-1.5 rounded-lg hover:bg-primary-900/30 transition-colors"
            onClick={() => {
              navigator.clipboard.writeText(meetingId);
              setIsCopied(true);
              setTimeout(() => {
                setIsCopied(false);
              }, 3000);
            }}
          >
            {isCopied ? (
              <Check className="h-4 w-4 text-green-400" />
            ) : (
              <Copy className="h-4 w-4 text-white" />
            )}
          </button>
        </div>
      </div>
    );
  };

  const tollTipEl = useRef();
  const isMobile = useIsMobile();
  const isTab = useIsTab();
  const [open, setOpen] = useState(false);

  const handleClickFAB = () => {
    setOpen(true);
  };

  const handleCloseFAB = () => {
    setOpen(false);
  };

  const BottomBarButtonTypes = useMemo(
    () => ({
      END_CALL: 'END_CALL',
      CHAT: 'CHAT',
      PARTICIPANTS: 'PARTICIPANTS',
      SCREEN_SHARE: 'SCREEN_SHARE',
      WEBCAM: 'WEBCAM',
      MIC: 'MIC',
      RAISE_HAND: 'RAISE_HAND',
      RECORDING: 'RECORDING',
      PIP: 'PIP',
      MEETING_ID_COPY: 'MEETING_ID_COPY',
    }),
    []
  );

  const otherFeatures = [
    { icon: BottomBarButtonTypes.RAISE_HAND },
    { icon: BottomBarButtonTypes.PIP },
    { icon: BottomBarButtonTypes.SCREEN_SHARE },
    { icon: BottomBarButtonTypes.CHAT },
    { icon: BottomBarButtonTypes.PARTICIPANTS },
    { icon: BottomBarButtonTypes.MEETING_ID_COPY },
  ];

  return isMobile || isTab ? (
    <div className="flex items-center justify-center gap-2 px-4 bg-neutral-900 border-t border-neutral-800" style={{ height: bottomBarHeight }}>
      <LeaveBTN />
      <MicBTN />
      <WebCamBTN />
      <RecordingBTN />
      <OutlinedButton Icon={MoreHorizontal} onClick={handleClickFAB} />
      <Transition appear show={Boolean(open)} as={Fragment}>
        <Dialog as="div" className="relative" style={{ zIndex: 9999 }} onClose={handleCloseFAB}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
          </Transition.Child>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="translate-y-full opacity-0 scale-95"
            enterTo="translate-y-0 opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="translate-y-0 opacity-100 scale-100"
            leaveTo="translate-y-full opacity-0 scale-95"
          >
            <div className="fixed inset-0 overflow-y-hidden">
              <div className="flex h-full items-end justify-end text-center">
                <Dialog.Panel className="w-screen transform overflow-hidden bg-neutral-900 shadow-2xl transition-all rounded-t-3xl border-t border-neutral-800">
                  <div className="grid container bg-neutral-900 py-6">
                    <div className="grid grid-cols-12 gap-2">
                      {otherFeatures.map(({ icon }) => {
                        return (
                          <div
                            key={icon}
                            className={`grid items-center justify-center ${
                              icon === BottomBarButtonTypes.MEETING_ID_COPY
                                ? 'col-span-7 sm:col-span-5 md:col-span-3'
                                : 'col-span-4 sm:col-span-3 md:col-span-2'
                            }`}
                          >
                            {icon === BottomBarButtonTypes.RAISE_HAND ? (
                              <RaiseHandBTN isMobile={isMobile} isTab={isTab} />
                            ) : icon === BottomBarButtonTypes.SCREEN_SHARE ? (
                              <ScreenShareBTN isMobile={isMobile} isTab={isTab} />
                            ) : icon === BottomBarButtonTypes.CHAT ? (
                              <ChatBTN isMobile={isMobile} isTab={isTab} />
                            ) : icon === BottomBarButtonTypes.PARTICIPANTS ? (
                              <ParticipantsBTN isMobile={isMobile} isTab={isTab} />
                            ) : icon === BottomBarButtonTypes.MEETING_ID_COPY ? (
                              <MeetingIdCopyBTN isMobile={isMobile} isTab={isTab} />
                            ) : icon === BottomBarButtonTypes.PIP ? (
                              <PipBTN isMobile={isMobile} isTab={isTab} />
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Dialog.Panel>
              </div>
            </div>
          </Transition.Child>
        </Dialog>
      </Transition>
    </div>
  ) : (
    <div className="md:flex lg:px-2 xl:px-6 pb-2 px-2 hidden bg-neutral-900 border-t border-neutral-800">
      <MeetingIdCopyBTN />

      <div className="flex flex-1 items-center justify-center gap-3" ref={tollTipEl}>
        <RecordingBTN />
        <RaiseHandBTN isMobile={isMobile} isTab={isTab} />
        <MicBTN />
        <WebCamBTN />
        <ScreenShareBTN isMobile={isMobile} isTab={isTab} />
        <PipBTN isMobile={isMobile} isTab={isTab} />
        <LeaveBTN />
      </div>
      <div className="flex items-center justify-center gap-3">
        <ChatBTN isMobile={isMobile} isTab={isTab} />
        <ParticipantsBTN isMobile={isMobile} isTab={isTab} />
      </div>
    </div>
  );
}
