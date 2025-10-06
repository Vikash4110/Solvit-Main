import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-xl border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*5)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-1 items-start [&>svg]:size-5 [&>svg]:translate-y-0.5 [&>svg]:shrink-0 transition-all duration-300 ease-out motion-reduce:transition-none sm:px-5 sm:py-4",
  {
    variants: {
      variant: {
        default: `
          bg-white/95 backdrop-blur-md border-neutral-200
          text-neutral-800 shadow-sm
          [&>svg]:text-primary-600
          dark:bg-neutral-900/95 dark:border-neutral-800
          dark:text-neutral-200 dark:[&>svg]:text-primary-400
        `,
        "default-lite": `
          bg-white border-neutral-200
          text-neutral-800
          [&>svg]:text-primary-600
          dark:bg-neutral-900 dark:border-neutral-800
          dark:text-neutral-200 dark:[&>svg]:text-primary-400
        `,
        destructive: `
          bg-red-50/95 backdrop-blur-md border-red-200
          text-red-800 shadow-sm
          [&>svg]:text-red-600
          *:data-[slot=alert-description]:text-red-700/90
          dark:bg-red-950/50 dark:border-red-900/50
          dark:text-red-200 dark:[&>svg]:text-red-400
          dark:*:data-[slot=alert-description]:text-red-300/90
        `,
        success: `
          bg-green-50/95 backdrop-blur-md border-green-200
          text-green-800 shadow-sm
          [&>svg]:text-green-600
          *:data-[slot=alert-description]:text-green-700/90
          dark:bg-green-950/50 dark:border-green-900/50
          dark:text-green-200 dark:[&>svg]:text-green-400
          dark:*:data-[slot=alert-description]:text-green-300/90
        `,
        warning: `
          bg-yellow-50/95 backdrop-blur-md border-yellow-200
          text-yellow-800 shadow-sm
          [&>svg]:text-yellow-600
          *:data-[slot=alert-description]:text-yellow-700/90
          dark:bg-yellow-950/50 dark:border-yellow-900/50
          dark:text-yellow-200 dark:[&>svg]:text-yellow-400
          dark:*:data-[slot=alert-description]:text-yellow-300/90
        `,
        info: `
          bg-blue-50/95 backdrop-blur-md border-blue-200
          text-blue-800 shadow-sm
          [&>svg]:text-blue-600
          *:data-[slot=alert-description]:text-blue-700/90
          dark:bg-blue-950/50 dark:border-blue-900/50
          dark:text-blue-200 dark:[&>svg]:text-blue-400
          dark:*:data-[slot=alert-description]:text-blue-300/90
        `,
        coral: `
          bg-coral-50/95 backdrop-blur-md border-coral-200
          text-coral-800 shadow-sm
          [&>svg]:text-coral-600
          *:data-[slot=alert-description]:text-coral-700/90
          dark:bg-coral-950/50 dark:border-coral-900/50
          dark:text-coral-200 dark:[&>svg]:text-coral-400
          dark:*:data-[slot=alert-description]:text-coral-300/90
        `,
        glass: `
          bg-white/20 backdrop-blur-xl border-white/40
          text-primary-800 shadow-lg
          [&>svg]:text-primary-600
          dark:bg-neutral-900/20 dark:border-neutral-800/40
          dark:text-primary-200 dark:[&>svg]:text-primary-400
        `,
        elevated: `
          bg-gradient-to-br from-white to-neutral-50/90
          backdrop-blur-lg border-neutral-200/60
          text-neutral-800 shadow-md
          [&>svg]:text-primary-600
          dark:from-neutral-900 dark:to-neutral-800/90
          dark:border-neutral-800/60
          dark:text-neutral-200 dark:[&>svg]:text-primary-400
        `,
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

// ---------- Alert Component ----------
const Alert = React.forwardRef(({ className, variant, dismissible, onDismiss, ...props }, ref) => {
  const [isVisible, setIsVisible] = React.useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  return (
    <div
      ref={ref}
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {props.children}
      {dismissible && (
        <button
          onClick={handleDismiss}
          className={cn(
            "absolute top-3 right-3 sm:top-4 sm:right-4",
            "rounded-md p-1 opacity-70 hover:opacity-100",
            "transition-opacity duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
            "motion-reduce:transition-none"
          )}
          aria-label="Dismiss alert"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
});
Alert.displayName = "Alert";

// ---------- Alert Title ----------
const AlertTitle = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="alert-title"
    className={cn(
      "col-start-2 min-h-5 font-semibold tracking-tight leading-tight",
      "text-sm sm:text-base",
      className
    )}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

// ---------- Alert Description ----------
const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="alert-description"
    className={cn(
      "col-start-2 grid justify-items-start gap-1.5",
      "text-xs sm:text-sm [&_p]:leading-relaxed",
      className
    )}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

// ---------- Alert Actions (Optional helper component) ----------
function AlertActions({ className, ...props }) {
  return (
    <div
      data-slot="alert-actions"
      className={cn(
        "col-start-2 flex items-center gap-2 mt-2",
        className
      )}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription, AlertActions };
