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
  handleClose,
}) => {
  const { participants } = useMeeting();
  const { sideBarMode } = useMeetingAppContext();

  return (
    <div
      className="bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-800 flex flex-col overflow-hidden my-auto"
      style={{
        height: typeof height === 'number' ? `${height}px` : height,
        width: typeof sideBarContainerWidth === 'number' ? `${sideBarContainerWidth}px` : sideBarContainerWidth,
        maxHeight: '100%',
      }}
    >
      {sideBarMode && (
        <div className="flex items-center justify-between px-4 py-3 bg-neutral-800/70 backdrop-blur-md border-b border-neutral-800 shrink-0">
          <p className="text-sm font-bold text-white select-none">
            {sideBarMode === 'PARTICIPANTS'
              ? `Participants (${new Map(participants).size})`
              : sideBarMode.charAt(0).toUpperCase() + sideBarMode.slice(1).toLowerCase()}
          </p>
          <button
            className="text-neutral-400 hover:text-white hover:bg-neutral-700/60 rounded-lg p-1.5 transition-all duration-200"
            onClick={handleClose}
            aria-label="Close sidebar"
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-neutral-900">
        {sideBarMode === 'PARTICIPANTS' ? (
          <ParticipantPanel />
        ) : sideBarMode === 'CHAT' ? (
          <ChatPanel />
        ) : null}
      </div>
    </div>
  );
};

export function SidebarConatiner({ height, sideBarContainerWidth }) {
  const { sideBarMode, setSideBarMode } = useMeetingAppContext();
  const isMobile = useIsMobile();
  const isTab = useIsTab();

  const handleClose = () => {
    setSideBarMode(null);
  };

  const desktopHeight = height - 16;

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
            <div className="fixed inset-0 flex items-center justify-center p-3 sm:p-4">
              <Dialog.Panel className="w-full max-w-md h-[80vh] transform overflow-hidden rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl transition-all">
                <SideBarTabView
                  height="100%"
                  sideBarContainerWidth="100%"
                  handleClose={handleClose}
                />
              </Dialog.Panel>
            </div>
          </Transition.Child>
        </Dialog>
      </Transition>
    ) : (
      <SideBarTabView
        height={desktopHeight}
        sideBarContainerWidth={sideBarContainerWidth}
        handleClose={handleClose}
      />
    )
  ) : null;
}
