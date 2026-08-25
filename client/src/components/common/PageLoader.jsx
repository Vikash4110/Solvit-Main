import React from 'react';

const PageLoader = () => {
  return (
    <div className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-3">
      <div className="relative flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-4 border-teal-100 animate-spin border-t-teal-600"></div>
        <div className="absolute h-6 w-6 rounded-full border-2 border-teal-50 animate-ping"></div>
      </div>
      <p className="text-sm font-medium text-gray-500 animate-pulse">Loading...</p>
    </div>
  );
};

export default PageLoader;
