import { useNavigate } from 'react-router-dom';

export function LeaveScreen({ setIsMeetingLeft , participantId }) {
  const navigate = useNavigate();
  return (
    <div className="bg-gray-800 h-screen flex flex-col flex-1 items-center justify-center">
      <h1 className="text-white text-4xl">You left the meeting!</h1>
      <div className="mt-12">
        <button
          className="`w-full bg-purple-350 text-white px-16 py-3 rounded-lg text-sm"
          onClick={() => {
            navigate(`/${participantId.split(' ')[0]}/dashboard`);
          }}
        >
          Return to dashboard
        </button>
      </div>
    </div>
  );
}
