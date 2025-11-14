import { useMeeting, useParticipant } from '@videosdk.live/react-sdk';
import React, { useMemo } from 'react';
import { Mic, MicOff, Video, VideoOff, Hand } from 'lucide-react';
import { useMeetingAppContext } from '../../MeetingAppContextDef';
import { nameTructed } from '../../utils/helper';

function ParticipantListItem({ participantId, raisedHand }) {
  const { micOn, webcamOn, displayName, isLocal } = useParticipant(participantId);

  return (
    <div className="flex items-center justify-between bg-neutral-800 border border-neutral-700 rounded-xl p-3.5 m-2 shadow-lg hover:bg-neutral-750 hover:border-neutral-600 transition-all duration-200 hover:shadow-xl">
      <div className="flex items-center flex-1 min-w-0 gap-3">
        <div className="flex items-center justify-center rounded-full h-11 w-11 bg-gradient-to-br from-primary-600 to-primary-700 text-white text-base font-bold select-none shadow-lg">
          {displayName?.charAt(0).toUpperCase()}
        </div>
        <p className="text-white text-base font-medium truncate select-text">
          {isLocal ? 'You' : nameTructed(displayName, 20)}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {raisedHand && (
          <div className="flex items-center justify-center p-2 rounded-lg bg-yellow-500/20 border border-yellow-500/30">
            <Hand className="h-4 w-4 text-yellow-400" />
          </div>
        )}
        <div className={`p-2 rounded-lg transition-colors ${micOn ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
          {micOn ? (
            <Mic className="h-4 w-4 text-green-400" />
          ) : (
            <MicOff className="h-4 w-4 text-red-400" />
          )}
        </div>
        <div className={`p-2 rounded-lg transition-colors ${webcamOn ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
          {webcamOn ? (
            <Video className="h-4 w-4 text-green-400" />
          ) : (
            <VideoOff className="h-4 w-4 text-red-400" />
          )}
        </div>
      </div>
    </div>
  );
}

export function ParticipantPanel({ panelHeight }) {
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
    <div
      className="flex flex-col bg-neutral-900 rounded-xl overflow-y-auto border border-neutral-800 shadow-2xl scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-neutral-800"
      style={{ height: panelHeight }}
    >
      <div className="flex flex-col flex-1 p-3" style={{ height: panelHeight - 100 }}>
        {[...participants.keys()].map((participantId, index) => {
          const { raisedHand, participantId: peerId } = sortedRaisedHandsParticipants[index];
          return (
            <ParticipantListItem key={peerId} participantId={peerId} raisedHand={raisedHand} />
          );
        })}
      </div>
    </div>
  );
}
