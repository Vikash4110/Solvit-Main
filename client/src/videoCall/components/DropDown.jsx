import React, { useEffect, useRef, useState } from 'react';
import { useMeetingAppContext } from '../MeetingAppContextDef';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Mic,
  MicOff,
  Play,
  Square,
  Circle,
  Check,
  ChevronDown,
  Activity,
  Info,
} from 'lucide-react';

export default function DropDown({
  mics,
  changeMic,
  customAudioStream,
  audioTrack,
  micOn,
  didDeviceChange,
  setDidDeviceChange,
}) {
  const { setSelectedMic, selectedMic, selectedSpeaker, isMicrophonePermissionAllowed } =
    useMeetingAppContext();
  const [audioProgress, setAudioProgress] = useState(0);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [recordingStatus, setRecordingStatus] = useState('inactive');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [volume, setVolume] = useState(null);
  const [audio, setAudio] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const audioTrackRef = useRef();
  const intervalRef = useRef();
  const audioAnalyserIntervalRef = useRef();
  const mediaRecorder = useRef(null);

  const mimeType = 'audio/webm';

  useEffect(() => {
    audioTrackRef.current = audioTrack;
    if (audioTrack) {
      analyseAudio(audioTrack);
    } else {
      stopAudioAnalyse();
    }
  }, [audioTrack]);

  useEffect(() => {
    if (didDeviceChange) {
      setDidDeviceChange(false);
      if (mediaRecorder.current != null && mediaRecorder.current.state === 'recording') {
        stopRecording();
      }
      setRecordingProgress(0);
      setRecordingStatus('inactive');
    }
  }, [didDeviceChange]);

  const analyseAudio = (audioTrack) => {
    const audioStream = new MediaStream([audioTrack]);
    const audioContext = new AudioContext();
    const audioSource = audioContext.createMediaStreamSource(audioStream);
    const analyser = audioContext.createAnalyser();

    analyser.fftSize = 512;
    analyser.minDecibels = -127;
    analyser.maxDecibels = 0;
    analyser.smoothingTimeConstant = 0.4;

    audioSource.connect(analyser);

    const volumes = new Uint8Array(analyser.frequencyBinCount);
    const volumeCallback = () => {
      analyser.getByteFrequencyData(volumes);
      const volumeSum = volumes.reduce((sum, vol) => sum + vol, 0);
      const averageVolume = volumeSum / volumes.length;
      setVolume(averageVolume);
    };
    audioAnalyserIntervalRef.current = setInterval(volumeCallback, 100);
  };

  const stopAudioAnalyse = () => {
    clearInterval(audioAnalyserIntervalRef.current);
  };

  const handlePlaying = () => {
    setRecordingStatus('playing');
    const audioTags = document.getElementsByTagName('audio');

    for (let i = 0; i < audioTags.length; i++) {
      audioTags
        .item(i)
        .setSinkId(selectedSpeaker.id)
        .then(() => {
          audioTags.item(i).play();
          audioTags.item(i).addEventListener('timeupdate', () => {
            const progress = (audioTags.item(i).currentTime / recordingDuration) * 100;
            setAudioProgress(progress);
          });
          audioTags.item(i).addEventListener('ended', () => {
            setAudioProgress(0);
            setRecordingStatus('inactive');
          });
        });
    }
  };

  const startRecording = async () => {
    setAudio(null);
    setRecordingProgress(0);
    setRecordingStatus('recording');

    try {
      const media = new MediaRecorder(customAudioStream, { type: mimeType });
      mediaRecorder.current = media;
      mediaRecorder.current.start();
      let localAudioChunks = [];

      mediaRecorder.current.ondataavailable = (event) => {
        if (typeof event.data === 'undefined') return;
        if (event.data.size === 0) return;
        localAudioChunks.push(event.data);
      };

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(localAudioChunks, { type: mimeType });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudio(audioUrl);
        localAudioChunks = [];
        const elapsedTime = Date.now() - startTime;
        const durationInSeconds = elapsedTime / 1000;
        setRecordingDuration(durationInSeconds);
      };

      const startTime = Date.now();
      intervalRef.current = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        const progress = (elapsedTime / 7000) * 100;
        setRecordingProgress(progress);
      });

      setTimeout(() => {
        clearInterval(intervalRef.current);
        stopRecording();
      }, 7000);
    } catch (err) {
      console.log('Error in MediaRecorder:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current.state != 'inactive') {
      setRecordingProgress(0);
      setRecordingStatus('stopped recording');
      clearInterval(intervalRef.current);
      mediaRecorder.current.stop();
    }
  };

  const getVolumeStatus = () => {
    const volumePercent = (volume / 256) * 100;
    if (volumePercent < 20) return { label: 'Low', color: 'text-yellow-600 dark:text-yellow-400' };
    if (volumePercent < 60) return { label: 'Good', color: 'text-green-600 dark:text-green-400' };
    return { label: 'Excellent', color: 'text-primary-600 dark:text-primary-400' };
  };

  return (
    <>
      <TooltipProvider>
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <button
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  disabled={!isMicrophonePermissionAllowed}
                  className={`group inline-flex w-full items-center justify-between gap-2 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/60 focus-visible:ring-offset-2 ${
                    isOpen
                      ? 'bg-white text-primary-900 border border-neutral-200 shadow-sm dark:bg-neutral-800 dark:text-white dark:border-neutral-700'
                      : 'bg-neutral-50 text-neutral-700 hover:text-primary-900 hover:bg-white hover:border-neutral-200 border border-transparent dark:bg-neutral-800/50 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:border-neutral-700'
                  } ${!isMicrophonePermissionAllowed ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => {
                    if (
                      mediaRecorder.current != null &&
                      mediaRecorder.current.state == 'recording'
                    ) {
                      stopRecording();
                    }
                    setRecordingProgress(0);
                    setRecordingStatus('inactive');
                  }}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="flex-shrink-0">
                      <Mic
                        className={`h-4 w-4 ${
                          isHovered || isOpen
                            ? 'text-primary-900 dark:text-white'
                            : 'text-neutral-500 dark:text-neutral-400'
                        }`}
                      />
                    </div>
                    <span className="truncate text-left font-medium">
                      {isMicrophonePermissionAllowed ? selectedMic?.label : 'Permission Needed'}
                    </span>
                  </div>
                  <ChevronDown
                    className={`${
                      isOpen
                        ? 'rotate-180 text-primary-900 dark:text-white'
                        : 'text-neutral-500 dark:text-neutral-400'
                    } h-4 w-4 flex-shrink-0 transition-transform duration-200`}
                    aria-hidden="true"
                  />
                </button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-primary-900 text-white dark:bg-primary-700">
              <p className="text-xs font-medium">
                {isMicrophonePermissionAllowed
                  ? 'Select microphone device'
                  : 'Microphone permission required'}
              </p>
            </TooltipContent>
          </Tooltip>

          <DropdownMenuContent
            align="start"
            side="top"
            className="w-[var(--radix-dropdown-menu-trigger-width)] rounded-xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-700 dark:bg-neutral-800 p-0 overflow-x-hidden"
          >
            {/* Header with HowItWorks Icon Style */}
            <DropdownMenuLabel className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-4xl bg-gradient-to-br from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 shadow-lg">
                  <Mic className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-neutral-900 dark:text-white">
                  Microphone Settings
                </span>
              </div>
            </DropdownMenuLabel>

            <Separator className="bg-neutral-200 dark:bg-neutral-700" />

            {/* Device List with Scrollbar */}
            <ScrollArea className="h-auto max-h-64 overflow-x-hidden overflow-y-scroll">
              <div className="p-1.5">
                {mics.map((item, index) => {
                  return (
                    item?.kind === 'audioinput' && (
                      <DropdownMenuItem
                        key={`mics_${index}`}
                        className="group relative flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm transition-all hover:bg-primary-50 focus:bg-primary-50 cursor-pointer dark:hover:bg-neutral-700/50 dark:focus:bg-neutral-700/50"
                        onClick={() => {
                          setSelectedMic((s) => ({
                            ...s,
                            label: item?.label,
                            id: item?.deviceId,
                          }));
                          changeMic(item?.deviceId);
                          if (
                            mediaRecorder.current != null &&
                            mediaRecorder.current.state == 'recording'
                          ) {
                            stopRecording();
                          }
                          setRecordingProgress(0);
                          setRecordingStatus('inactive');
                        }}
                      >
                        <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center self-start mt-0.5">
                          {selectedMic?.label === item?.label && (
                            <Check className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                          )}
                        </span>
                        <span className="flex-1 text-neutral-900 font-medium dark:text-neutral-100 break-words">
                          {item?.label || `Mic ${index + 1}`}
                        </span>
                      </DropdownMenuItem>
                    )
                  );
                })}
              </div>
            </ScrollArea>

            <Separator className="bg-neutral-200 dark:bg-neutral-700" />

            {/* Mic Test Section */}
            <div className="p-4">
              {micOn ? (
                <div className="space-y-4">
                  {/* Live Meter with HowItWorks Icon Style */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-neutral-900 dark:text-white">
                          Input Level
                        </span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-3 w-3 text-neutral-400 dark:text-neutral-500 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="bg-primary-900 text-white dark:bg-primary-700">
                              <p className="text-xs max-w-xs">
                                Real-time audio input level from your microphone
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Badge
                        variant="secondary"
                        className="text-xs font-bold bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 border-0"
                      >
                        {Math.round((volume / 256) * 100)}%
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-4xl bg-gradient-to-br from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 shadow-lg">
                        <Mic className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <Progress
                          value={Math.min((volume / 256) * 100, 100)}
                          className="h-3 bg-neutral-200 dark:bg-neutral-700"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-neutral-200 dark:bg-neutral-700" />

                  {/* Recording Controls */}
                  <div className="rounded-xl border border-neutral-200 bg-gradient-to-br from-neutral-50/50 to-neutral-100/30 p-4 dark:border-neutral-700 dark:from-neutral-900/30 dark:to-neutral-800/30">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <span className="text-xs font-bold text-neutral-900 dark:text-white">
                        Test Recording
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {recordingStatus === 'inactive' && (
                        <Button
                          size="sm"
                          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 px-4 text-xs font-bold text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                          onClick={startRecording}
                          aria-label="Start recording"
                        >
                          <Circle className="h-3.5 w-3.5 fill-current" />
                          Start Recording
                        </Button>
                      )}

                      {recordingStatus === 'stopped recording' && (
                        <Button
                          size="sm"
                          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 px-4 text-xs font-bold text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                          onClick={handlePlaying}
                          aria-label="Play recording"
                        >
                          <Play className="h-3.5 w-3.5 fill-current" />
                          Play Test
                        </Button>
                      )}

                      {recordingStatus === 'recording' && (
                        <div className="flex-1 space-y-2.5">
                          <Button
                            size="sm"
                            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-red-500 to-red-600 text-xs font-bold text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                            onClick={stopRecording}
                            aria-label="Stop recording"
                          >
                            <Square className="h-3.5 w-3.5 fill-current" />
                            Stop Recording
                          </Button>
                          <Progress value={recordingProgress} className="h-2" />
                        </div>
                      )}

                      {recordingStatus === 'playing' && (
                        <div className="flex-1 space-y-2.5">
                          <Button
                            size="sm"
                            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 text-xs font-bold text-white shadow-lg"
                            aria-label="Playing"
                            disabled
                          >
                            <Activity className="h-3.5 w-3.5 animate-pulse" />
                            Playing...
                          </Button>
                          <Progress value={audioProgress} className="h-2" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-gradient-to-br from-neutral-50/50 to-neutral-100/30 p-4 text-sm dark:border-neutral-700 dark:from-neutral-900/30 dark:to-neutral-800/30">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-neutral-200 dark:bg-neutral-700">
                    <MicOff className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                  </div>
                  <span className="text-neutral-700 font-semibold dark:text-neutral-300">
                    Unmute to test your mic
                  </span>
                </div>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </TooltipProvider>
      <audio src={audio}></audio>
    </>
  );
}
