import { Popover, Transition } from '@headlessui/react';
import { X, MicOff, Volume2, Activity } from 'lucide-react';
import { useParticipant, VideoPlayer } from '@videosdk.live/react-sdk';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import useIsMobile from '../hooks/useIsMobile';
import useIsTab from '../hooks/useIsTab';
import useWindowSize from '../hooks/useWindowSize';
import { getQualityScore, nameTructed } from '../utils/common';
import * as ReactDOM from 'react-dom';
import { useMeetingAppContext } from '../MeetingAppContextDef';

export const CornerDisplayName = ({
  participantId,
  isPresenting,
  displayName,
  isLocal,
  micOn,
  mouseOver,
  isActiveSpeaker,
}) => {
  const isMobile = useIsMobile();
  const isTab = useIsTab();
  const isLGDesktop = useMediaQuery({ minWidth: 1024, maxWidth: 1439 });
  const isXLDesktop = useMediaQuery({ minWidth: 1440 });

  const { height: windowHeight } = useWindowSize();

  const [statsBoxHeightRef, setStatsBoxHeightRef] = useState(null);
  const [statsBoxWidthRef, setStatsBoxWidthRef] = useState(null);

  const [coords, setCoords] = useState({}); // takes current button coordinates

  const statsBoxHeight = useMemo(() => statsBoxHeightRef?.offsetHeight, [statsBoxHeightRef]);

  const statsBoxWidth = useMemo(() => statsBoxWidthRef?.offsetWidth, [statsBoxWidthRef]);

  const analyzerSize = isXLDesktop ? 32 : isLGDesktop ? 28 : isTab ? 24 : isMobile ? 20 : 18;

  const show = useMemo(() => mouseOver, [mouseOver]);

  const {
    webcamStream,
    micStream,
    screenShareStream,
    getVideoStats,
    getAudioStats,
    getShareStats,
    getShareAudioStats,
  } = useParticipant(participantId);

  const statsIntervalIdRef = useRef();
  const [score, setScore] = useState({});
  const [audioStats, setAudioStats] = useState({});
  const [videoStats, setVideoStats] = useState({});

  const updateStats = async () => {
    let stats = [];
    let audioStats = [];
    let videoStats = [];
    if (isPresenting) {
      stats = await getShareStats();
    } else if (webcamStream) {
      stats = await getVideoStats();
    } else if (micStream) {
      stats = await getAudioStats();
    }

    if (webcamStream || micStream || isPresenting) {
      videoStats = isPresenting ? await getShareStats() : await getVideoStats();
      audioStats = isPresenting ? await getShareAudioStats() : await getAudioStats();
    }

    let score = stats ? (stats.length > 0 ? getQualityScore(stats[0]) : 100) : 100;

    setScore(score);
    setAudioStats(audioStats);
    setVideoStats(videoStats);
  };

  const qualityStateArray = [
    { label: '', audio: 'Audio', video: 'Video' },
    {
      label: 'Latency',
      audio: audioStats && audioStats[0]?.rtt ? `${audioStats[0]?.rtt} ms` : '-',
      video: videoStats && videoStats[0]?.rtt ? `${videoStats[0]?.rtt} ms` : '-',
    },
    {
      label: 'Jitter',
      audio:
        audioStats && audioStats[0]?.jitter
          ? `${parseFloat(audioStats[0]?.jitter).toFixed(2)} ms`
          : '-',
      video:
        videoStats && videoStats[0]?.jitter
          ? `${parseFloat(videoStats[0]?.jitter).toFixed(2)} ms`
          : '-',
    },
    {
      label: 'Packet Loss',
      audio: audioStats
        ? audioStats[0]?.packetsLost
          ? `${parseFloat((audioStats[0]?.packetsLost * 100) / audioStats[0]?.totalPackets).toFixed(
              2
            )}%`
          : '-'
        : '-',
      video: videoStats
        ? videoStats[0]?.packetsLost
          ? `${parseFloat((videoStats[0]?.packetsLost * 100) / videoStats[0]?.totalPackets).toFixed(
              2
            )}%`
          : '-'
        : '-',
    },
    {
      label: 'Bitrate',
      audio:
        audioStats && audioStats[0]?.bitrate
          ? `${parseFloat(audioStats[0]?.bitrate).toFixed(2)} kb/s`
          : '-',
      video:
        videoStats && videoStats[0]?.bitrate
          ? `${parseFloat(videoStats[0]?.bitrate).toFixed(2)} kb/s`
          : '-',
    },
    {
      label: 'Frame rate',
      audio: '-',
      video:
        videoStats &&
        (videoStats[0]?.size?.framerate === null || videoStats[0]?.size?.framerate === undefined)
          ? '-'
          : `${videoStats ? videoStats[0]?.size?.framerate : '-'}`,
    },
    {
      label: 'Resolution',
      audio: '-',
      video: videoStats
        ? videoStats && videoStats[0]?.size?.width === null
          ? '-'
          : `${videoStats[0]?.size?.width}x${videoStats[0]?.size?.height}`
        : '-',
    },
    {
      label: 'Codec',
      audio: audioStats && audioStats[0]?.codec ? audioStats[0]?.codec : '-',
      video: videoStats && videoStats[0]?.codec ? videoStats[0]?.codec : '-',
    },
    {
      label: 'Cur. Layers',
      audio: '-',
      video:
        videoStats && !isLocal
          ? videoStats && videoStats[0]?.currentSpatialLayer === null
            ? '-'
            : `S:${videoStats[0]?.currentSpatialLayer || 0} T:${
                videoStats[0]?.currentTemporalLayer || 0
              }`
          : '-',
    },
    {
      label: 'Pref. Layers',
      audio: '-',
      video:
        videoStats && !isLocal
          ? videoStats && videoStats[0]?.preferredSpatialLayer === null
            ? '-'
            : `S:${videoStats[0]?.preferredSpatialLayer || 0} T:${
                videoStats[0]?.preferredTemporalLayer || 0
              }`
          : '-',
    },
  ];

  useEffect(() => {
    if (webcamStream || micStream || screenShareStream) {
      updateStats();

      if (statsIntervalIdRef.current) {
        clearInterval(statsIntervalIdRef.current);
      }

      statsIntervalIdRef.current = setInterval(updateStats, 500);
    } else {
      if (statsIntervalIdRef.current) {
        clearInterval(statsIntervalIdRef.current);
        statsIntervalIdRef.current = null;
      }
    }

    return () => {
      if (statsIntervalIdRef.current) clearInterval(statsIntervalIdRef.current);
    };
  }, [webcamStream, micStream, screenShareStream]);

  return (
    <>
      <div
        className="absolute bottom-2 left-2 rounded-xl flex items-center justify-center px-3 py-2 backdrop-blur-md border border-neutral-700/50"
        style={{
          backgroundColor: '#00000088',
          transition: 'all 200ms',
          transitionTimingFunction: 'linear',
          transform: `scale(${show ? 1 : 0})`,
        }}
      >
        {!micOn && !isPresenting ? (
          <MicOff className="h-4 w-4 text-red-400" />
        ) : micOn && isActiveSpeaker ? (
          <Volume2 className="h-4 w-4 text-green-400" />
        ) : null}
        <p className="text-sm text-white ml-2 font-medium">
          {isPresenting
            ? isLocal
              ? `You are presenting`
              : `${nameTructed(displayName, 15)} is presenting`
            : isLocal
              ? 'You'
              : nameTructed(displayName, 26)}
        </p>
      </div>

      {(webcamStream || micStream || screenShareStream) && (
        <div>
          <div
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="absolute top-2 right-2 rounded-xl p-2 cursor-pointer"
          >
            <Popover className="relative">
              {({ close }) => (
                <>
                  <Popover.Button
                    className={`absolute right-0 top-0 rounded-lg flex items-center justify-center p-2 cursor-pointer transition-all hover:scale-110`}
                    style={{
                      backgroundColor: score > 7 ? '#3BA55D' : score > 4 ? '#faa713' : '#FF5D5D',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      const rect = e.target.getBoundingClientRect();
                      setCoords({
                        left: Math.round(rect.x + rect.width / 2),
                        top: Math.round(rect.y + window.scrollY),
                      });
                    }}
                  >
                    <div>
                      <Activity
                        className="text-white"
                        style={{
                          height: analyzerSize * 0.6,
                          width: analyzerSize * 0.6,
                        }}
                      />
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
                    <Popover.Panel style={{ zIndex: 999 }} className="absolute">
                      {ReactDOM.createPortal(
                        <div
                          ref={setStatsBoxWidthRef}
                          style={{
                            top:
                              coords?.top + statsBoxHeight > windowHeight
                                ? windowHeight - statsBoxHeight - 20
                                : coords?.top,
                            left:
                              coords?.left - statsBoxWidth < 0 ? 12 : coords?.left - statsBoxWidth,
                          }}
                          className={`absolute`}
                        >
                          <div
                            ref={setStatsBoxHeightRef}
                            className="bg-neutral-800 rounded-xl shadow-2xl ring-1 ring-neutral-700"
                          >
                            <div
                              className={`p-3 flex items-center justify-between rounded-t-xl`}
                              style={{
                                backgroundColor:
                                  score > 7 ? '#3BA55D' : score > 4 ? '#faa713' : '#FF5D5D',
                              }}
                            >
                              <p className="text-sm text-white font-bold">{`Quality Score : ${
                                score > 7 ? 'Good' : score > 4 ? 'Average' : 'Poor'
                              }`}</p>

                              <button
                                className="cursor-pointer text-white hover:bg-white/20 rounded-full p-1 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  close();
                                }}
                              >
                                <X className="text-white h-4 w-4" />
                              </button>
                            </div>
                            <div className="flex">
                              <div className="flex flex-col">
                                {qualityStateArray.map((item, index) => {
                                  return (
                                    <div
                                      key={index}
                                      className="flex"
                                      style={{
                                        borderBottom:
                                          index === qualityStateArray.length - 1
                                            ? ''
                                            : `1px solid #ffffff33`,
                                      }}
                                    >
                                      <div className="flex flex-1 items-center w-[120px]">
                                        {index !== 0 && (
                                          <p className="text-xs text-white my-2 ml-2 font-medium">
                                            {item.label}
                                          </p>
                                        )}
                                      </div>
                                      <div
                                        className="flex flex-1 items-center justify-center"
                                        style={{
                                          borderLeft: `1px solid #ffffff33`,
                                        }}
                                      >
                                        <p className={`text-xs my-2 w-[80px] text-center ${index === 0 ? 'text-white font-bold' : 'text-neutral-300'}`}>
                                          {item.audio}
                                        </p>
                                      </div>
                                      <div
                                        className="flex flex-1 items-center justify-center"
                                        style={{
                                          borderLeft: `1px solid #ffffff33`,
                                        }}
                                      >
                                        <p className={`text-xs my-2 w-[80px] text-center ${index === 0 ? 'text-white font-bold' : 'text-neutral-300'}`}>
                                          {item.video}
                                        </p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>,
                        document.body
                      )}
                    </Popover.Panel>
                  </Transition>
                </>
              )}
            </Popover>
          </div>
        </div>
      )}
    </>
  );
};

export function ParticipantView({ participantId }) {
  const { displayName, micStream, webcamOn, micOn, isLocal, mode, isActiveSpeaker } =
    useParticipant(participantId);

  const { selectedSpeaker } = useMeetingAppContext();
  const micRef = useRef(null);
  const [mouseOver, setMouseOver] = useState(false);

  useEffect(() => {
    const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
    if (micRef.current) {
      try {
        if (!isFirefox) {
          micRef.current.setSinkId(selectedSpeaker.id);
        }
      } catch (err) {
        console.log('Setting speaker device failed', err);
      }
    }
  }, [selectedSpeaker]);

  useEffect(() => {
    if (micRef.current) {
      if (micOn && micStream) {
        const mediaStream = new MediaStream();
        mediaStream.addTrack(micStream.track);
        micRef.current.srcObject = mediaStream;
        micRef.current
          .play()
          .catch((error) => console.error('micRef.current.play() failed', error));
      } else {
        micRef.current.srcObject = null;
      }
    }
  }, [micStream, micOn, micRef]);

  return mode === 'SEND_AND_RECV' ? (
    <div
      onMouseEnter={() => {
        setMouseOver(true);
      }}
      onMouseLeave={() => {
        setMouseOver(false);
      }}
      className={`h-full w-full bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800 relative overflow-hidden rounded-xl border border-neutral-700/50 hover:border-neutral-600/50 transition-all duration-300 shadow-lg hover:shadow-xl`}
    >
      <audio ref={micRef} autoPlay muted={isLocal} />
      {webcamOn ? (
        <div className="absolute inset-0">
          <VideoPlayer
            participantId={participantId}
            type="video"
            containerStyle={{
              height: '100%',
              width: '100%',
            }}
            className="h-full w-full"
            classNameVideo="h-full w-full object-cover"
            videoStyle={{
              objectFit: 'cover',
            }}
          />
        </div>
      ) : (
        <div className="h-full w-full flex items-center justify-center">
          <div
            className={`z-10 flex items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-primary-700 shadow-2xl border-4 border-neutral-700 2xl:h-[92px] h-[52px] 2xl:w-[92px] w-[52px]`}
          >
            <p className="text-2xl text-white font-bold">{String(displayName).charAt(0).toUpperCase()}</p>
          </div>
        </div>
      )}
      <CornerDisplayName
        {...{
          isLocal,
          displayName,
          micOn,
          webcamOn,
          isPresenting: false,
          participantId,
          mouseOver,
          isActiveSpeaker,
        }}
      />
    </div>
  ) : null;
}
