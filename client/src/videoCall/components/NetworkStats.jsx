import { getNetworkStats } from '@videosdk.live/react-sdk';
import { useEffect, useState } from 'react';
import useIsMobile from '../hooks/useIsMobile';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Download, Upload, RefreshCw, Loader2, WifiOff, AlertCircle, Activity } from 'lucide-react';

const NetworkStats = ({}) => {
  const [error, setError] = useState('no-error-loading');
  const [uploadSpeed, setUploadSpeed] = useState(null);
  const [downloadSpeed, setDownloadSpeed] = useState(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    getNetworkStatistics();
  }, []);

  const getNetworkStatistics = async () => {
    setError('no-error-loading');
    try {
      const options = { timeoutDuration: 45000 };
      const networkStats = await getNetworkStats(options);
      if (networkStats) {
        setError('no-error');
      }
      setDownloadSpeed(networkStats['downloadSpeed']);
      setUploadSpeed(networkStats['uploadSpeed']);
    } catch (ex) {
      if (ex === 'Not able to get NetworkStats due to no Network') {
        setError('no-wifi');
      }
      if (ex === 'Not able to get NetworkStats due to timeout') {
        setError('timeout');
      }
      console.log('Error in networkStats: ', ex);
    }
  };

  const handleOnClick = () => {
    getNetworkStatistics();
  };

  return (
    <TooltipProvider>
      <div className="inline-flex items-center rounded-xl border border-neutral-200 bg-white/95 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 dark:border-neutral-700 dark:bg-neutral-900/95">
        {error === 'no-error-loading' && (
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30">
              <Loader2 className="h-4 w-4 animate-spin text-primary-600 dark:text-primary-400" />
            </div>
            <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Checking network...
            </span>
          </div>
        )}

        {error === 'no-error' && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={`flex items-center gap-2 px-3 py-2 border-r border-neutral-200 dark:border-neutral-700 transition-colors hover:bg-primary-50/50 dark:hover:bg-primary-900/10 ${
                    !isMobile && 'min-w-[7rem]'
                  }`}
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 shadow-md">
                    <Download className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-bold text-neutral-900 dark:text-white">
                      {downloadSpeed}
                    </span>
                    <span className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400">
                      Mbps
                    </span>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-primary-900 text-white dark:bg-primary-700">
                <p className="text-xs font-medium">Download Speed</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={`flex items-center gap-2 px-3 py-2 border-r border-neutral-200 dark:border-neutral-700 transition-colors hover:bg-primary-50/50 dark:hover:bg-primary-900/10 ${
                    !isMobile && 'min-w-[7rem]'
                  }`}
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 shadow-md">
                    <Upload className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-bold text-neutral-900 dark:text-white">
                      {uploadSpeed}
                    </span>
                    <span className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400">
                      Mbps
                    </span>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-primary-900 text-white dark:bg-primary-700">
                <p className="text-xs font-medium">Upload Speed</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleOnClick}
                  className="flex items-center justify-center px-3 py-2 transition-all duration-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-r-xl group"
                  aria-label="Refresh network stats"
                >
                  <RefreshCw className="h-4 w-4 text-neutral-600 group-hover:text-primary-600 dark:text-neutral-400 dark:group-hover:text-primary-400 transition-all group-hover:rotate-180 duration-500" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-primary-900 text-white dark:bg-primary-700">
                <p className="text-xs font-medium">Refresh Stats</p>
              </TooltipContent>
            </Tooltip>
          </>
        )}

        {error === 'no-wifi' && (
          <>
            <div className="flex items-center gap-2 px-3 py-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
                <WifiOff className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <span className="text-xs font-semibold text-red-700 dark:text-red-400">
                {isMobile ? 'Offline' : "You're offline!"}
              </span>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleOnClick}
                  className="flex items-center justify-center px-3 py-2 border-l border-neutral-200 dark:border-neutral-700 transition-all duration-300 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-r-xl group"
                  aria-label="Retry network check"
                >
                  <RefreshCw className="h-4 w-4 text-neutral-600 group-hover:text-red-600 dark:text-neutral-400 dark:group-hover:text-red-400 transition-all group-hover:rotate-180 duration-500" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-red-600 text-white">
                <p className="text-xs font-medium">Retry Connection</p>
              </TooltipContent>
            </Tooltip>
          </>
        )}

        {error === 'timeout' && (
          <>
            <div className="flex items-center gap-2 px-3 py-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <span className="text-xs font-semibold text-red-700 dark:text-red-400">
                {isMobile ? 'Error' : 'Request timeout'}
              </span>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleOnClick}
                  className="flex items-center justify-center px-3 py-2 border-l border-neutral-200 dark:border-neutral-700 transition-all duration-300 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-r-xl group"
                  aria-label="Retry network check"
                >
                  <RefreshCw className="h-4 w-4 text-neutral-600 group-hover:text-red-600 dark:text-neutral-400 dark:group-hover:text-red-400 transition-all group-hover:rotate-180 duration-500" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-red-600 text-white">
                <p className="text-xs font-medium">Try Again</p>
              </TooltipContent>
            </Tooltip>
          </>
        )}
      </div>
    </TooltipProvider>
  );
};

export default NetworkStats;
