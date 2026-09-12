import { useContext, createContext, useState, useCallback } from 'react';

export const MeetingAppContext = createContext();

export const useMeetingAppContext = () => useContext(MeetingAppContext);

export const MeetingAppProvider = ({ children }) => {
  const [selectedMic, setSelectedMic] = useState({ id: null, label: null });
  const [selectedWebcam, setSelectedWebcam] = useState({ id: null, label: null });
  const [selectedSpeaker, setSelectedSpeaker] = useState({ id: null, label: null });
  const [isCameraPermissionAllowed, setIsCameraPermissionAllowed] = useState(null);
  const [isMicrophonePermissionAllowed, setIsMicrophonePermissionAllowed] = useState(null);
  const [raisedHandsParticipants, setRaisedHandsParticipants] = useState([]);
  const [sideBarMode, setSideBarMode] = useState(null);
  const [pipMode, setPipMode] = useState(false);

  const participantRaisedHand = useCallback((participantId) => {
    if (!participantId) return;
    setRaisedHandsParticipants((prev) => {
      const exists = prev.some((p) => p.participantId === participantId);
      if (exists) {
        return prev.map((p) =>
          p.participantId === participantId ? { ...p, raisedHandOn: Date.now() } : p
        );
      }
      return [...prev, { participantId, raisedHandOn: Date.now() }];
    });
  }, []);

  const participantLoweredHand = useCallback((participantId) => {
    if (!participantId) return;
    setRaisedHandsParticipants((prev) => prev.filter((p) => p.participantId !== participantId));
  }, []);

  const useRaisedHandParticipants = () => {
    return { participantRaisedHand, participantLoweredHand };
  };

  return (
    <MeetingAppContext.Provider
      value={{
        // states
        raisedHandsParticipants,
        selectedMic,
        selectedWebcam,
        selectedSpeaker,
        sideBarMode,
        pipMode,
        isCameraPermissionAllowed,
        isMicrophonePermissionAllowed,

        // setters & actions
        participantRaisedHand,
        participantLoweredHand,
        setRaisedHandsParticipants,
        setSelectedMic,
        setSelectedWebcam,
        setSelectedSpeaker,
        setSideBarMode,
        setPipMode,
        useRaisedHandParticipants,
        setIsCameraPermissionAllowed,
        setIsMicrophonePermissionAllowed,
      }}
    >
      {children}
    </MeetingAppContext.Provider>
  );
};
