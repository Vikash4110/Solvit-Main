import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------- Root ----------
function Dialog(props) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

// ---------- Trigger ----------
function DialogTrigger(props) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

// ---------- Portal ----------
function DialogPortal({ className, children, ...props }) {
  return (
    <DialogPrimitive.Portal data-slot="dialog-portal" {...props}>
      <div className={cn("fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6", className)}>
        {children}
      </div>
    </DialogPrimitive.Portal>
  );
}

// ---------- Close ----------
function DialogClose(props) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

// ---------- Overlay ----------
const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    data-slot="dialog-overlay"
    className={cn(
      "fixed inset-0 z-50 bg-black/50",
      "backdrop-blur-sm supports-[backdrop-filter]:bg-black/40",
      "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      "motion-reduce:transition-none",
      "dark:bg-black/70",
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

// ---------- Content ----------
const DialogContent = React.forwardRef(
  ({ className, children, showCloseButton = true, size = "default", ...props }, ref) => {
    const sizeClasses = {
      sm: "max-w-sm",
      default: "max-w-lg",
      lg: "max-w-2xl",
      xl: "max-w-4xl",
      full: "max-w-[95vw] max-h-[95vh]",
    };

    return (
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          ref={ref}
          data-slot="dialog-content"
          className={cn(
            "fixed top-[50%] left-[50%] z-50 w-full translate-x-[-50%] translate-y-[-50%] gap-4",
            sizeClasses[size],
            "bg-white border border-neutral-200 rounded-2xl shadow-xl overflow-hidden",
            "max-h-[90vh] overflow-y-auto",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "motion-reduce:transition-none motion-reduce:data-[state=open]:zoom-in-100 motion-reduce:data-[state=closed]:zoom-out-100",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
            "dark:bg-neutral-900 dark:border-neutral-800",
            className
          )}
          {...props}
        >
          {children}

          {showCloseButton && (
            <DialogPrimitive.Close
              data-slot="dialog-close"
              className={cn(
                "absolute top-3 right-3 sm:top-4 sm:right-4 rounded-full p-2 w-9 h-9 sm:w-10 sm:h-10",
                "bg-white/90 border border-neutral-200 shadow-md hover:shadow-lg",
                "text-neutral-500 hover:text-neutral-700",
                "hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary-500/20",
                "motion-reduce:hover:scale-100 motion-reduce:active:scale-100",
                "disabled:pointer-events-none disabled:opacity-50",
                "dark:bg-neutral-800/90 dark:border-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200",
                "transition-all duration-200"
              )}
              aria-label="Close"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          )}
        </DialogPrimitive.Content>
      </DialogPortal>
    );
  }
);
DialogContent.displayName = DialogPrimitive.Content.displayName;

// ---------- Header ----------
function DialogHeader({ className, ...props }) {
  return (
    <div
      data-slot="dialog-header"
      className={cn(
        "flex flex-col gap-1.5 text-center sm:text-left px-4 pt-4 sm:px-6 sm:pt-6",
        className
      )}
      {...props}
    />
  );
}

// ---------- Footer ----------
function DialogFooter({ className, ...props }) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end px-4 pb-4 sm:px-6 sm:pb-6 pt-4",
        className
      )}
      {...props}
    />
  );
}

// ---------- Title ----------
const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    data-slot="dialog-title"
    className={cn(
      "text-base sm:text-lg font-semibold leading-none text-neutral-900 dark:text-neutral-100",
      className
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

// ---------- Description ----------
const DialogDescription = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    data-slot="dialog-description"
    className={cn(
      "text-xs sm:text-sm text-neutral-600 dark:text-neutral-400",
      className
    )}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

// ---------- Body ----------
function DialogBody({ className, ...props }) {
  return (
    <div
      data-slot="dialog-body"
      className={cn("px-4 sm:px-6 py-4 text-sm text-neutral-700 dark:text-neutral-300", className)}
      {...props}
    />
  );
}

// ---------- Export ----------
export {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogClose,
};
