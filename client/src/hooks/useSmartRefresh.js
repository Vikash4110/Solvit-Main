import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook that handles smart foreground-only data refreshing:
 * - Runs initial fetch on mount and when dependencies change.
 * - Listens to 'visibilitychange' and window 'focus' to re-fetch when user returns to the tab (throttled by staleTimeMs).
 * - Completely halts polling when the browser tab is hidden in the background to save server resources.
 * - Optional foreground-only interval for active viewing.
 * - Deterministically cleans up event listeners and timers on unmount.
 *
 * @param {Function} fetchFn - The async fetch function to call. Receives `isAutoRefresh: boolean`.
 * @param {Object} options
 * @param {boolean} [options.enabled=true] - Whether fetching is active.
 * @param {number|null} [options.intervalMs=null] - Foreground periodic interval in ms (default null / disabled).
 * @param {number} [options.staleTimeMs=30000] - Minimum elapsed time in ms before refetching on window focus.
 * @param {Array} [options.deps=[]] - Extra dependencies that trigger an immediate re-fetch.
 */
export function useSmartRefresh(
  fetchFn,
  {
    enabled = true,
    intervalMs = null,
    staleTimeMs = 30000,
    deps = [],
  } = {}
) {
  const lastFetchTimeRef = useRef(0);
  const fetchFnRef = useRef(fetchFn);

  useEffect(() => {
    fetchFnRef.current = fetchFn;
  }, [fetchFn]);

  const executeFetch = useCallback(
    async (isAutoRefresh = false) => {
      if (!enabled) return;
      try {
        lastFetchTimeRef.current = Date.now();
        await fetchFnRef.current(isAutoRefresh);
      } catch (err) {
        // Individual error handling handled inside caller fetchFn
      }
    },
    [enabled]
  );

  useEffect(() => {
    if (!enabled) return;

    // 1. Initial fetch on mount / dependencies change
    executeFetch(false);

    // 2. Focus & Visibility change handler (smart refetch on returning to tab)
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        const timeSinceLast = Date.now() - lastFetchTimeRef.current;
        if (timeSinceLast >= staleTimeMs) {
          executeFetch(true);
        }
      }
    };

    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);

    // 3. Foreground-only periodic interval (only fires if tab is currently visible)
    let intervalId = null;
    if (intervalMs && intervalMs > 0) {
      intervalId = setInterval(() => {
        if (document.visibilityState === 'visible') {
          executeFetch(true);
        }
      }, intervalMs);
    }

    // 4. Deterministic cleanup
    return () => {
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      if (intervalId) clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, intervalMs, staleTimeMs, executeFetch, ...deps]);
}

export default useSmartRefresh;
