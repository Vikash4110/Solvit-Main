import { useMeeting, useParticipant } from '@videosdk.live/react-sdk';
import React, { useMemo } from 'react';
import MicOffIcon from '../../icons/ParticipantTabPanel/MicOffIcon';
import MicOnIcon from '../../icons/ParticipantTabPanel/MicOnIcon';
import RaiseHand from '../../icons/ParticipantTabPanel/RaiseHand';
import VideoCamOffIcon from '../../icons/ParticipantTabPanel/VideoCamOffIcon';
import VideoCamOnIcon from '../../icons/ParticipantTabPanel/VideoCamOnIcon';
import { useMeetingAppContext } from '../../MeetingAppContextDef';
import { nameTructed } from '../../utils/helper';

function ParticipantListItem({ participantId, raisedHand }) {
  const { micOn, webcamOn, displayName, isLocal } = useParticipant(participantId);

  return (
    <div className="flex items-center justify-between bg-gray-800 rounded-xl p-3 m-2 shadow-md hover:bg-gray-700 transition-colors">
      <div className="flex items-center flex-1 min-w-0">
        <div
          style={{
            color: '#212032',
            backgroundColor: '#757575',
          }}
          className="flex items-center justify-center rounded-full h-12 w-12 text-lg font-semibold select-none"
        >
          {displayName?.charAt(0).toUpperCase()}
        </div>
        <p className="ml-4 text-white text-lg truncate select-text">
          {isLocal ? 'You' : nameTructed(displayName, 20)}
        </p>
      </div>

      <div className="flex items-center space-x-4">
        {raisedHand && (
          <div className="flex items-center justify-center p-1">
            <RaiseHand fillcolor={'#8b5cf6'} />
          </div>
        )}
        <div className="p-1">
          {micOn ? <MicOnIcon fillcolor="#34d399" /> : <MicOffIcon fillcolor="#ef4444" />}
        </div>
        <div className="p-1">
          {webcamOn ? (
            <VideoCamOnIcon fillcolor="#34d399" />
          ) : (
            <VideoCamOffIcon fillcolor="#ef4444" />
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
      className="flex flex-col bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100 rounded-3xl overflow-y-auto border border-gray-300 shadow-lg"
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
