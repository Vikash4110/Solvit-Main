import * as React from "react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ---------- Toaster Component ----------
const Toaster = ({ ...props }) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: cn(
            "group toast",
            "bg-white dark:bg-neutral-900",
            "border border-neutral-200 dark:border-neutral-800",
            "shadow-lg rounded-xl",
            "backdrop-blur-xl",
            "text-neutral-950 dark:text-neutral-50"
          ),
          title:
            "text-sm font-semibold text-neutral-900 dark:text-neutral-100",
          description: "text-xs text-neutral-600 dark:text-neutral-400",
          actionButton: cn(
            "bg-primary-700 text-white",
            "hover:bg-primary-800",
            "dark:bg-primary-600 dark:hover:bg-primary-700",
            "rounded-lg px-3 py-1.5 text-sm font-medium",
            "transition-colors duration-200"
          ),
          cancelButton: cn(
            "bg-neutral-100 text-neutral-900",
            "hover:bg-neutral-200",
            "dark:bg-neutral-800 dark:text-neutral-100",
            "dark:hover:bg-neutral-700",
            "rounded-lg px-3 py-1.5 text-sm font-medium",
            "transition-colors duration-200"
          ),
          closeButton: cn(
            "bg-neutral-100 text-neutral-600",
            "hover:bg-neutral-200 hover:text-neutral-900",
            "dark:bg-neutral-800 dark:text-neutral-400",
            "dark:hover:bg-neutral-700 dark:hover:text-neutral-100",
            "rounded-lg border-0",
            "transition-colors duration-200"
          ),
          error:
            "border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20",
          success:
            "border-green-200 dark:border-green-900/50 bg-green-50/50 dark:bg-green-950/20",
          warning:
            "border-yellow-200 dark:border-yellow-900/50 bg-yellow-50/50 dark:bg-yellow-950/20",
          info:
            "border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20",
          loading:
            "border-primary-200 dark:border-primary-900/50 bg-primary-50/50 dark:bg-primary-950/20",
        },
      }}
      {...props}
    />
  );
};

// ---------- Toast Variants ----------
const toastVariants = {
  default: (message, options) => {
    return toast(message, {
      icon: (
        <Info className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
      ),
      ...options,
    });
  },

  success: (message, options) => {
    return toast.success(message, {
      icon: (
        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500" />
      ),
      ...options,
    });
  },

  error: (message, options) => {
    return toast.error(message, {
      icon: <XCircle className="h-5 w-5 text-red-600 dark:text-red-500" />,
      ...options,
    });
  },

  warning: (message, options) => {
    return toast.warning(message, {
      icon: (
        <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
      ),
      ...options,
    });
  },

  info: (message, options) => {
    return toast.info(message, {
      icon: <Info className="h-5 w-5 text-blue-600 dark:text-blue-500" />,
      ...options,
    });
  },

  loading: (message, options) => {
    return toast.loading(message, {
      icon: (
        <Loader2 className="h-5 w-5 text-primary-600 dark:text-primary-500 animate-spin" />
      ),
      ...options,
    });
  },

  promise: (promise, messages, options) => {
    return toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
      ...options,
    });
  },

  custom: (component, options) => {
    return toast.custom(component, options);
  },
};

// ---------- Toast with Action ----------
const toastWithAction = (message, actionLabel, actionFn, options) => {
  return toast(message, {
    action: {
      label: actionLabel,
      onClick: actionFn,
    },
    ...options,
  });
};

// ---------- Toast with Cancel ----------
const toastWithCancel = (message, options) => {
  return toast(message, {
    cancel: {
      label: "Cancel",
      onClick: () => {},
    },
    ...options,
  });
};

// ---------- Custom Toast Components ----------
function ToastSuccess({ title, description, action }) {
  return (
    <div className="flex items-start gap-3 p-4">
      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500 flex-shrink-0 mt-0.5" />
      <div className="flex-1 space-y-1">
        <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          {title}
        </p>
        {description && (
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className={cn(
            "px-3 py-1.5 text-sm font-medium rounded-lg",
            "bg-green-100 text-green-700",
            "hover:bg-green-200",
            "dark:bg-green-900/30 dark:text-green-300",
            "dark:hover:bg-green-900/50",
            "transition-colors duration-200"
          )}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

function ToastError({ title, description, action }) {
  return (
    <div className="flex items-start gap-3 p-4">
      <XCircle className="h-5 w-5 text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" />
      <div className="flex-1 space-y-1">
        <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          {title}
        </p>
        {description && (
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className={cn(
            "px-3 py-1.5 text-sm font-medium rounded-lg",
            "bg-red-100 text-red-700",
            "hover:bg-red-200",
            "dark:bg-red-900/30 dark:text-red-300",
            "dark:hover:bg-red-900/50",
            "transition-colors duration-200"
          )}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

function ToastWithProgress({ title, progress, description }) {
  return (
    <div className="flex items-start gap-3 p-4">
      <Loader2 className="h-5 w-5 text-primary-600 dark:text-primary-500 animate-spin flex-shrink-0 mt-0.5" />
      <div className="flex-1 space-y-2">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            {title}
          </p>
          {description && (
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              {description}
            </p>
          )}
        </div>
        <div className="space-y-1">
          <div className="h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-600 dark:bg-primary-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 tabular-nums">
            {progress}%
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------- Helper Functions ----------
const showToast = {
  default: toastVariants.default,
  success: toastVariants.success,
  error: toastVariants.error,
  warning: toastVariants.warning,
  info: toastVariants.info,
  loading: toastVariants.loading,
  promise: toastVariants.promise,
  custom: toastVariants.custom,
  withAction: toastWithAction,
  withCancel: toastWithCancel,

  // Dismiss functions
  dismiss: (toastId) => toast.dismiss(toastId),

  // Custom component toasts
  successWithAction: (props) => toast.custom(<ToastSuccess {...props} />),
  errorWithAction: (props) => toast.custom(<ToastError {...props} />),
  withProgress: (props) => toast.custom(<ToastWithProgress {...props} />),
};

export {
  Toaster,
  showToast,
  toast,
  toastVariants,
  ToastSuccess,
  ToastError,
  ToastWithProgress,
};
