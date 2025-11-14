import { useMeeting } from '@videosdk.live/react-sdk';
import React, { Fragment } from 'react';
import useIsMobile from '../../hooks/useIsMobile';
import useIsTab from '../../hooks/useIsTab';
import { X } from 'lucide-react';
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
      className="bg-neutral-900 rounded-xl shadow-2xl border border-neutral-800 overflow-hidden"
      style={{
        height,
        width: sideBarContainerWidth,
        padding: panelPadding,
      }}
    >
      <div
        className="bg-neutral-900 rounded-xl flex flex-col h-full border border-neutral-800"
        style={{
          height: height,
          overflow: 'hidden',
        }}
      >
        {sideBarMode && (
          <div
            className="flex items-center justify-between px-5 bg-neutral-800/50 backdrop-blur-sm"
            style={{
              height: panelHeaderHeight - 1,
              paddingTop: panelHeaderPadding / 2,
              paddingBottom: panelHeaderPadding / 2,
              borderBottom: '1px solid #404040',
            }}
          >
            <p className="text-base font-bold text-white select-none">
              {sideBarMode === 'PARTICIPANTS'
                ? `Participants (${new Map(participants).size})`
                : sideBarMode.charAt(0).toUpperCase() + sideBarMode.slice(1).toLowerCase() || ''}
            </p>
            <button
              className="text-neutral-400 hover:text-white hover:bg-neutral-700 rounded-lg p-1.5 transition-all duration-200"
              onClick={handleClose}
              aria-label="Close sidebar"
              type="button"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto bg-neutral-900" style={{ height: panelHeight }}>
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
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl transition-all">
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
