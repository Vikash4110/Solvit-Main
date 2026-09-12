import { useMeeting, useParticipant } from '@videosdk.live/react-sdk';
import React, { useMemo } from 'react';
import { Mic, MicOff, Video, VideoOff, Hand } from 'lucide-react';
import { useMeetingAppContext } from '../../MeetingAppContextDef';
import { cleanDisplayName } from '../../utils/helper';

function ParticipantListItem({ participantId, raisedHand }) {
  const { micOn, webcamOn, displayName, isLocal } = useParticipant(participantId);
  const cleanName = cleanDisplayName(displayName);

  return (
    <div className="flex items-center justify-between bg-neutral-800/90 border border-neutral-700/80 rounded-xl p-3 my-1.5 shadow-md hover:bg-neutral-750 hover:border-neutral-600 transition-all duration-200">
      <div className="flex items-center flex-1 min-w-0 gap-3">
        <div className="flex items-center justify-center rounded-full h-10 w-10 bg-gradient-to-br from-primary-600 to-primary-700 text-white text-sm font-bold select-none shadow-md shrink-0">
          {cleanName?.charAt(0).toUpperCase() || 'U'}
        </div>
        <p className="text-white text-sm font-medium truncate select-text">
          {isLocal ? `${cleanName || 'You'} (You)` : cleanName}
        </p>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {raisedHand && (
          <div className="flex items-center justify-center p-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 animate-pulse">
            <Hand className="h-4 w-4 text-amber-400" />
          </div>
        )}
        <div className={`p-1.5 rounded-lg transition-colors ${micOn ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
          {micOn ? (
            <Mic className="h-3.5 w-3.5 text-green-400" />
          ) : (
            <MicOff className="h-3.5 w-3.5 text-red-400" />
          )}
        </div>
        <div className={`p-1.5 rounded-lg transition-colors ${webcamOn ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
          {webcamOn ? (
            <Video className="h-3.5 w-3.5 text-green-400" />
          ) : (
            <VideoOff className="h-3.5 w-3.5 text-red-400" />
          )}
        </div>
      </div>
    </div>
  );
}

export function ParticipantPanel() {
  const { raisedHandsParticipants } = useMeetingAppContext();
  const mMeeting = useMeeting();
  const participants = mMeeting.participants;

  const sortedRaisedHandsParticipants = useMemo(() => {
    const participantIds = [...participants.keys()];

    const notRaised = participantIds.filter(
      (pID) => raisedHandsParticipants.findIndex(({ participantId: rPID }) => rPID === pID) === -1
    );

    const raisedSorted = [...raisedHandsParticipants].sort(
      (a, b) => b.raisedHandOn - a.raisedHandOn
    );

    return [
      ...raisedSorted.map(({ participantId: p }) => ({
        raisedHand: true,
        participantId: p,
      })),
      ...notRaised.map((p) => ({ raisedHand: false, participantId: p })),
    ];
  }, [raisedHandsParticipants, participants]);

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-3 py-2 bg-neutral-900 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-neutral-800">
      {sortedRaisedHandsParticipants.map(({ raisedHand, participantId: peerId }) => {
        return (
          <ParticipantListItem key={peerId} participantId={peerId} raisedHand={raisedHand} />
        );
      })}
    </div>
  );
}
