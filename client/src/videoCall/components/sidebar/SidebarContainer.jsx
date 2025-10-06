import { useMeeting } from '@videosdk.live/react-sdk';
import React, { Fragment } from 'react';
import useIsMobile from '../../hooks/useIsMobile';
import useIsTab from '../../hooks/useIsTab';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ChatPanel } from './ChatPanel';
import { ParticipantPanel } from './ParticipantPanel';
import { Dialog, Transition } from '@headlessui/react';
import { useMediaQuery } from 'react-responsive';
import { useMeetingAppContext } from '../../MeetingAppContextDef';

const SideBarTabView = ({
  height,
  sideBarContainerWidth,
  panelHeight,
  panelHeaderHeight,
  panelHeaderPadding,
  panelPadding,
  handleClose,
}) => {
  const { participants } = useMeeting();
  const { sideBarMode } = useMeetingAppContext();

  return (
    <div
      className="bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100 rounded-3xl shadow-lg border border-gray-300 overflow-hidden"
      style={{
        height,
        width: sideBarContainerWidth,
        padding: panelPadding,
      }}
    >
      <div
        className="bg-white rounded-2xl flex flex-col h-full"
        style={{
          height: height,
          overflow: 'hidden',
        }}
      >
        {sideBarMode && (
          <div
            className="flex items-center justify-between px-6"
            style={{
              height: panelHeaderHeight - 1,
              paddingTop: panelHeaderPadding / 2,
              paddingBottom: panelHeaderPadding / 2,
              borderBottom: '1px solid #d1d5db', // Tailwind gray-300
            }}
          >
            <p className="text-lg font-semibold text-gray-900 select-none">
              {sideBarMode === 'PARTICIPANTS'
                ? `Participants (${new Map(participants).size})`
                : sideBarMode.charAt(0).toUpperCase() + sideBarMode.slice(1).toLowerCase() || ''}
            </p>
            <button
              className="text-gray-800 hover:text-gray-600 transition-colors"
              onClick={handleClose}
              aria-label="Close sidebar"
              type="button"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto" style={{ height: panelHeight }}>
          {sideBarMode === 'PARTICIPANTS' ? (
            <ParticipantPanel panelHeight={panelHeight} />
          ) : sideBarMode === 'CHAT' ? (
            <ChatPanel panelHeight={panelHeight} />
          ) : null}
        </div>
      </div>
    </div>
  );
};

export function SidebarConatiner({ height, sideBarContainerWidth }) {
  const { raisedHandsParticipants, sideBarMode, setSideBarMode } = useMeetingAppContext();
  const isMobile = useIsMobile();
  const isTab = useIsTab();
  const isLGDesktop = useMediaQuery({ minWidth: 1024, maxWidth: 1439 });
  const isXLDesktop = useMediaQuery({ minWidth: 1440 });

  const panelPadding = 12;

  const paddedHeight = height - panelPadding * 3.5;

  const panelHeaderHeight = isMobile ? 40 : isTab ? 44 : isLGDesktop ? 48 : isXLDesktop ? 52 : 48;

  const panelHeaderPadding = isMobile ? 8 : isTab ? 10 : isLGDesktop ? 12 : isXLDesktop ? 14 : 10;

  const handleClose = () => {
    setSideBarMode(null);
  };

  return sideBarMode ? (
    isTab || isMobile ? (
      <Transition appear show={true} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={handleClose}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm" />
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
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-3xl bg-gradient-to-br from-purple-200 via-blue-100 to-indigo-200 shadow-2xl transition-all">
                <SideBarTabView
                  height={'100%'}
                  sideBarContainerWidth={'100%'}
                  panelHeight={height}
                  panelHeaderHeight={panelHeaderHeight}
                  panelHeaderPadding={panelHeaderPadding}
                  panelPadding={panelPadding}
                  handleClose={handleClose}
                  raisedHandsParticipants={raisedHandsParticipants}
                />
              </Dialog.Panel>
            </div>
          </Transition.Child>
        </Dialog>
      </Transition>
    ) : (
      <SideBarTabView
        height={paddedHeight}
        sideBarContainerWidth={sideBarContainerWidth}
        panelHeight={paddedHeight - panelHeaderHeight - panelHeaderPadding}
        panelHeaderHeight={panelHeaderHeight}
        panelHeaderPadding={panelHeaderPadding}
        panelPadding={panelPadding}
        handleClose={handleClose}
        raisedHandsParticipants={raisedHandsParticipants}
      />
    )
  ) : null;
}
