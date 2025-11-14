import React, { useState } from 'react';
import { useMeetingAppContext } from '../MeetingAppContextDef';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Volume2, VolumeX, Check, ChevronDown, Activity } from 'lucide-react';
import test_sound from '../sounds/test_sound.mp3';

export default function DropDownSpeaker({ speakers }) {
  const { setSelectedSpeaker, selectedSpeaker, isMicrophonePermissionAllowed } =
    useMeetingAppContext();
  const [audioProgress, setAudioProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const testSpeakers = () => {
    const selectedSpeakerDeviceId = selectedSpeaker.id;
    if (selectedSpeakerDeviceId) {
      const audio = new Audio(test_sound);
      try {
        audio.setSinkId(selectedSpeakerDeviceId).then(() => {
          audio.play();
          setIsPlaying(true);
          audio.addEventListener('timeupdate', () => {
            const progress = (audio.currentTime / audio.duration) * 100;
            setAudioProgress(progress);
          });
          audio.addEventListener('ended', () => {
            setAudioProgress(0);
            setIsPlaying(false);
          });
        });
      } catch (error) {
        console.log(error);
      }
      audio.play().catch((error) => {
        console.error('Failed to set sinkId:', error);
      });
    } else {
      console.error('Selected speaker deviceId not found.');
    }
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
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="flex-shrink-0">
                      <Volume2
                        className={`h-4 w-4 ${
                          isHovered || isOpen
                            ? 'text-primary-900 dark:text-white'
                            : 'text-neutral-500 dark:text-neutral-400'
                        }`}
                      />
                    </div>
                    <span className="truncate text-left font-medium">
                      {isMicrophonePermissionAllowed ? selectedSpeaker?.label : 'Permission Needed'}
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
                  ? 'Select speaker device'
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
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 shadow-lg">
                  <Volume2 className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-neutral-900 dark:text-white">
                  Speaker Settings
                </span>
              </div>
            </DropdownMenuLabel>

            <Separator className="bg-neutral-200 dark:bg-neutral-700" />

            {/* Device List with Scrollbar */}
            <ScrollArea className="h-auto max-h-64 overflow-x-hidden">
              <div className="p-1.5">
                {speakers.map((item, index) => {
                  return (
                    item?.kind === 'audiooutput' && (
                      <DropdownMenuItem
                        key={`speaker_${index}`}
                        className="group relative flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm transition-all hover:bg-primary-50 focus:bg-primary-50 cursor-pointer dark:hover:bg-neutral-700/50 dark:focus:bg-neutral-700/50"
                        onClick={() => {
                          setSelectedSpeaker((s) => ({
                            ...s,
                            id: item?.deviceId,
                            label: item?.label,
                          }));
                        }}
                      >
                        <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center self-start mt-0.5">
                          {selectedSpeaker?.label === item?.label && (
                            <Check className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                          )}
                        </span>
                        <span className="flex-1 text-neutral-900 font-medium dark:text-neutral-100 break-words">
                          {item?.label || `Speaker ${index + 1}`}
                        </span>
                        {selectedSpeaker?.label === item?.label && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0 h-5 bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 flex-shrink-0 border-0"
                          >
                            Active
                          </Badge>
                        )}
                      </DropdownMenuItem>
                    )
                  );
                })}
              </div>
            </ScrollArea>

            {/* Speaker Test Section */}
            {speakers.length > 0 && (
              <>
                <Separator className="bg-neutral-200 dark:bg-neutral-700" />
                <div className="p-4">
                  <div className="rounded-xl border border-neutral-200 bg-gradient-to-br from-neutral-50/50 to-neutral-100/30 p-4 dark:border-neutral-700 dark:from-neutral-900/30 dark:to-neutral-800/30">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 shadow-md">
                          <Volume2 className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-xs font-bold text-neutral-900 dark:text-white">
                          Test Audio Output
                        </span>
                      </div>
                    </div>

                    {isPlaying ? (
                      <div className="space-y-2.5">
                        <Button
                          size="sm"
                          disabled
                          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 text-xs font-bold text-white shadow-lg"
                        >
                          <Activity className="h-3.5 w-3.5 animate-pulse" />
                          Playing Test Sound...
                        </Button>
                        <Progress value={audioProgress} className="h-2" />
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        onClick={testSpeakers}
                        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 px-4 text-xs font-bold text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                      >
                        <Volume2 className="h-3.5 w-3.5" />
                        Test Speakers
                      </Button>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* No Speakers Message */}
            {speakers.filter((item) => item?.kind === 'audiooutput').length === 0 && (
              <>
                <Separator className="bg-neutral-200 dark:bg-neutral-700" />
                <div className="p-4">
                  <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-gradient-to-br from-neutral-50/50 to-neutral-100/30 p-4 text-sm dark:border-neutral-700 dark:from-neutral-900/30 dark:to-neutral-800/30">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-neutral-200 dark:bg-neutral-700">
                      <VolumeX className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                    </div>
                    <span className="text-neutral-700 font-semibold dark:text-neutral-300">
                      No speakers detected
                    </span>
                  </div>
                </div>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TooltipProvider>
    </>
  );
}
