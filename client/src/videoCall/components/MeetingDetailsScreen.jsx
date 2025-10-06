export function MeetingDetailsScreen({ sessionData, handleOnClickJoin, handleClickGoBack }) {
  return (
    <div className={`flex flex-1 flex-col justify-center w-full md:p-[6px] sm:p-1 p-1.5 `}>
      <div className="w-full md:mt-0 mt-4 flex flex-col">
        <div className="flex items-center justify-center flex-col w-full ">
          <button
            className="w-full bg-gray-650 text-white px-2 py-3 rounded-xl mt-5"
            onClick={handleOnClickJoin}
          >
            Join a meeting
          </button>

          <button
            className="w-full bg-purple-350 text-white px-2 py-3 rounded-xl"
            onClick={handleClickGoBack}
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
