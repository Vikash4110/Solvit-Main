import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle2, RotateCcw } from 'lucide-react';

export function LeaveScreen({
  setIsMeetingLeft,
  participantId,
  leaveReason,
  setLeaveReason,
  sessionData,
}) {
  const navigate = useNavigate();
  const role = participantId?.startsWith('counselor') ? 'counselor' : 'client';

  const endTimeStr =
    sessionData?.booking?.slotId?.endTime ||
    sessionData?.booking?.endTime ||
    sessionData?.slotId?.endTime;

  const isSessionExpired =
    leaveReason === 'The scheduled session time has ended.' ||
    (endTimeStr && new Date(endTimeStr).getTime() <= Date.now());

  return (
    <div className="bg-gradient-to-br from-neutral-950 via-neutral-900 to-primary-950/40 min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md w-full p-8 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-2xl backdrop-blur-md space-y-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-primary-600/20 border border-primary-500/30 flex items-center justify-center text-primary-400">
          {isSessionExpired ? <Clock className="w-8 h-8" /> : <CheckCircle2 className="w-8 h-8" />}
        </div>
        <div className="space-y-2">
          <h1 className="text-white text-2xl sm:text-3xl font-bold tracking-tight">
            {isSessionExpired ? 'Session Ended' : 'You Left the Meeting'}
          </h1>
          <p className="text-neutral-400 text-sm">
            {isSessionExpired
              ? 'The scheduled session time has ended. Thank you for your time!'
              : 'You have left the meeting. You can rejoin at any time while the scheduled session is active.'}
          </p>
        </div>
        <div className="space-y-3 pt-2">
          {!isSessionExpired && (
            <button
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all active:scale-[0.99]"
              onClick={() => {
                if (typeof setLeaveReason === 'function') {
                  setLeaveReason(null);
                }
                setIsMeetingLeft(false);
              }}
            >
              <RotateCcw className="w-4 h-4" />
              Rejoin Session
            </button>
          )}
          <button
            className={`w-full font-semibold py-3 px-6 rounded-xl shadow-lg transition-all active:scale-[0.99] ${
              !isSessionExpired
                ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700'
                : 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white'
            }`}
            onClick={() => {
              navigate(`/${role}/dashboard`);
            }}
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

