import { useMeeting, useParticipant, VideoPlayer } from '@videosdk.live/react-sdk';
import { useEffect, useMemo, useRef } from 'react';
import ReactPlayer from 'react-player';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MonitorUp, MicOff, Mic, Volume2, User } from 'lucide-react';
import { nameTructed } from '../utils/helper';
import { CornerDisplayName } from './ParticipantView';

export function PresenterView({ height }) {
  const mMeeting = useMeeting();
  const presenterId = mMeeting?.presenterId;
  const {
    micOn,
    webcamOn,
    isLocal,
    screenShareAudioStream,
    screenShareOn,
    displayName,
    isActiveSpeaker,
  } = useParticipant(presenterId);

  const audioPlayer = useRef();

  useEffect(() => {
    if (!isLocal && audioPlayer.current && screenShareOn && screenShareAudioStream) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(screenShareAudioStream.track);

      audioPlayer.current.srcObject = mediaStream;
      audioPlayer.current.play().catch((err) => {
        if (
          err.message ===
          "play() failed because the user didn't interact with the document first. https://goo.gl/xX8pDD"
        ) {
          console.error('audio' + err.message);
        }
      });
    } else {
      audioPlayer.current.srcObject = null;
    }
  }, [screenShareAudioStream, screenShareOn, isLocal]);

  return (
    <div
      className="bg-neutral-900 rounded-xl m-2 relative overflow-hidden w-full border-2 border-neutral-800 shadow-2xl"
      style={{ height: `calc(${height}px - 4rem)` }}
    >
      <audio autoPlay playsInline controls={false} ref={audioPlayer} />
      
      <div className="video-contain absolute h-full w-full">
        <VideoPlayer
          participantId={presenterId}
          type="share"
          containerStyle={{
            height: '100%',
            width: '100%',
          }}
          className="h-full"
          classNameVideo="h-full"
          videoStyle={{
            filter: isLocal ? 'blur(1rem)' : undefined,
          }}
        />

        {/* Presenter Info Badge - Bottom Left */}
        <div
          className="bottom-3 left-3 absolute"
          style={{
            transition: 'all 200ms',
            transitionTimingFunction: 'linear',
          }}
        >
          <Badge className="inline-flex items-center gap-2 px-3 py-2 bg-neutral-900/95 border border-neutral-700 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
            {/* Mic Status Icon */}
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-neutral-800">
              {!micOn ? (
                <MicOff className="h-3.5 w-3.5 text-red-400" />
              ) : isActiveSpeaker ? (
                <Volume2 className="h-3.5 w-3.5 text-green-400 animate-pulse" />
              ) : (
                <Mic className="h-3.5 w-3.5 text-primary-400" />
              )}
            </div>

            {/* Presenter Name */}
            <span className="text-sm font-semibold text-white">
              {isLocal ? 'You are presenting' : `${nameTructed(displayName, 15)} is presenting`}
            </span>
          </Badge>
        </div>

        {/* Local Presenter Overlay */}
        {isLocal && (
          <>
            <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/60 backdrop-blur-sm">
              <Card className="p-8 rounded-2xl flex flex-col items-center justify-center bg-neutral-900/95 border-2 border-neutral-700 shadow-2xl max-w-md">
                {/* Screen Share Icon with Gradient Background */}
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 shadow-lg mb-6">
                  <MonitorUp className="h-8 w-8 text-white" />
                </div>

                {/* Title */}
                <div className="text-center mb-6">
                  <h3 className="text-white text-xl font-bold mb-2">
                    You are presenting to everyone
                  </h3>
                  <p className="text-neutral-400 text-sm">
                    Your screen is being shared with all participants
                  </p>
                </div>

                {/* Stop Presenting Button */}
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    mMeeting.toggleScreenShare();
                  }}
                  className="group relative overflow-hidden w-full h-11 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:shadow-red-500/30 transition-all duration-300 hover:scale-105"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <MonitorUp className="h-4 w-4" />
                    Stop Presenting
                  </span>
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                </Button>
              </Card>
            </div>

            {/* Corner Display Name */}
            <CornerDisplayName
              {...{
                isLocal,
                displayName,
                micOn,
                webcamOn,
                isPresenting: true,
                participantId: presenterId,
                isActiveSpeaker,
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}
