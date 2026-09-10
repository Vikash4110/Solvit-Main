import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle2 } from 'lucide-react';

export function LeaveScreen({ setIsMeetingLeft, participantId, leaveReason }) {
  const navigate = useNavigate();
  const role = participantId?.startsWith('counselor') ? 'counselor' : 'client';

  return (
    <div className="bg-gradient-to-br from-neutral-950 via-neutral-900 to-primary-950/40 min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md w-full p-8 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-2xl backdrop-blur-md space-y-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-primary-600/20 border border-primary-500/30 flex items-center justify-center text-primary-400">
          {leaveReason ? <Clock className="w-8 h-8" /> : <CheckCircle2 className="w-8 h-8" />}
        </div>
        <div className="space-y-2">
          <h1 className="text-white text-2xl sm:text-3xl font-bold tracking-tight">
            {leaveReason ? 'Session Ended' : 'You Left the Meeting'}
          </h1>
          <p className="text-neutral-400 text-sm">
            {leaveReason || 'Your video session has ended. Thank you for your time!'}
          </p>
        </div>
        <div className="pt-2">
          <button
            className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all active:scale-[0.99]"
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

