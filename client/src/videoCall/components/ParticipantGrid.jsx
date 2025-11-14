import React, { useMemo } from 'react';
import { useMeetingAppContext } from '../MeetingAppContextDef';
import { ParticipantView } from './ParticipantView';
import useIsMobile from '../hooks/useIsMobile';

const MemoizedParticipant = React.memo(
  ParticipantView,
  (prevProps, nextProps) => prevProps.participantId === nextProps.participantId
);

function ParticipantGrid({ participantIds, isPresenting }) {
  const { sideBarMode } = useMeetingAppContext();
  const isMobile = useIsMobile();

  // Calculate participants per row based on total count and screen state
  const perRow = useMemo(() => {
    const count = participantIds.length;

    if (isMobile || isPresenting) {
      if (count < 4) return 1;
      if (count < 9) return 2;
      return 3;
    }

    // Desktop layout
    if (count < 5) return 2;
    if (count < 7) return 3;
    if (count < 10) return 4;
    return 4;
  }, [participantIds.length, isMobile, isPresenting]);

  // Calculate container padding based on participant count
  const getContainerPadding = () => {
    if (sideBarMode || isPresenting) return 'md:px-0';

    const count = participantIds.length;
    if (count < 2) return 'md:px-16 md:py-2';
    if (count < 3) return 'md:px-16 md:py-8';
    if (count < 4) return 'md:px-16 md:py-4';
    if (count > 4) return 'md:px-14';
    return 'md:px-0';
  };

  // Calculate participant card sizing
  const getParticipantSize = (count) => {
    if (!isPresenting) return 'w-full';

    if (count === 1) return 'md:h-48 md:w-44 xl:w-52 xl:h-48';
    if (count === 2) return 'md:w-44 xl:w-56';
    return 'md:w-44 xl:w-48';
  };

  // Calculate max width for participant containers
  const getMaxWidth = (count) => {
    return count === 1 ? 'md:max-w-7xl 2xl:max-w-[1480px]' : 'md:max-w-lg 2xl:max-w-2xl';
  };

  const totalRows = Math.ceil(participantIds.length / perRow);

  return (
    <div
      className={`flex flex-col md:flex-row flex-grow m-3 items-center justify-center transition-all duration-300 ${getContainerPadding()}`}
    >
      <div className="flex flex-col w-full h-full gap-1">
        {Array.from({ length: totalRows }, (_, rowIndex) => {
          const startIndex = rowIndex * perRow;
          const endIndex = (rowIndex + 1) * perRow;
          const rowParticipants = participantIds.slice(startIndex, endIndex);

          return (
            <div
              key={`row-${rowIndex}`}
              className={`flex flex-1 gap-1 ${
                isPresenting
                  ? participantIds.length === 1
                    ? 'justify-start items-start'
                    : 'items-center justify-center'
                  : 'items-center justify-center'
              }`}
            >
              {rowParticipants.map((participantId) => (
                <div
                  key={`participant_${participantId}`}
                  className={`flex flex-1 items-center justify-center h-full overflow-hidden rounded-lg transition-all duration-300 ${getParticipantSize(
                    participantIds.length
                  )} ${getMaxWidth(participantIds.length)}`}
                >
                  <MemoizedParticipant participantId={participantId} />
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const MemoizedParticipantGrid = React.memo(
  ParticipantGrid,
  (prevProps, nextProps) =>
    JSON.stringify(prevProps.participantIds) === JSON.stringify(nextProps.participantIds) &&
    prevProps.isPresenting === nextProps.isPresenting
);
