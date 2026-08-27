import React, { Component } from 'react';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isChunkError: false,
    };
  }

  static getDerivedStateFromError(error) {
    const errorMessage = error?.message || '';
    const isChunkError =
      errorMessage.includes('Failed to fetch dynamically imported module') ||
      errorMessage.includes('Loading chunk') ||
      errorMessage.includes('error loading dynamically imported module') ||
      errorMessage.includes('Importing a module script failed');

    return {
      hasError: true,
      error,
      isChunkError,
    };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      isChunkError: false,
    });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return typeof this.props.fallback === 'function'
          ? this.props.fallback({
              error: this.state.error,
              reset: this.handleReset,
              reload: this.handleReload,
            })
          : this.props.fallback;
      }

      const { isChunkError, error } = this.state;

      return (
        <div className="flex min-h-[70vh] w-full items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-md rounded-2xl border border-gray-200/80 bg-white p-6 sm:p-8 shadow-xl shadow-gray-200/50 dark:border-gray-800 dark:bg-gray-900 dark:shadow-none text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-600 ring-8 ring-amber-50/50 dark:bg-amber-950/40 dark:text-amber-400 dark:ring-amber-950/20">
              <AlertTriangle className="h-8 w-8" />
            </div>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl mb-2">
              {isChunkError ? 'New Update Available' : 'Something went wrong'}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              {isChunkError
                ? 'A newer version of the application is available or your network connection was interrupted. Please refresh the page to load the latest version.'
                : 'An unexpected error occurred while rendering this page. You can try reloading or returning to the homepage.'}
            </p>

            {error?.message && !isChunkError && (
              <div className="mb-6 rounded-lg bg-gray-50 p-3 text-left dark:bg-gray-800/60 border border-gray-200/50 dark:border-gray-700/50">
                <p className="text-xs font-mono text-gray-700 dark:text-gray-300 break-words line-clamp-3">
                  {error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2.5 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={this.handleReload}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-teal-700 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-teal-500/50 cursor-pointer"
              >
                <RefreshCw className="h-4 w-4" />
                Reload Page
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 active:scale-[0.98] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 cursor-pointer"
              >
                <Home className="h-4 w-4" />
                Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
