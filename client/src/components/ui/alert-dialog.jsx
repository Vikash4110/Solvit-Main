"use client";

import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

// ---------- Root ----------
function AlertDialog(props) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />;
}

// ---------- Trigger ----------
function AlertDialogTrigger(props) {
  return (
    <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
  );
}

// ---------- Portal ----------
function AlertDialogPortal(props) {
  return (
    <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
  );
}

// ---------- Overlay ----------
const AlertDialogOverlay = React.forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    ref={ref}
    data-slot="alert-dialog-overlay"
    className={cn(
      "fixed inset-0 z-50 bg-black/60",
      "backdrop-blur-sm supports-[backdrop-filter]:bg-black/50",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      "motion-reduce:transition-none",
      "dark:bg-black/80",
      className
    )}
    {...props}
  />
));
AlertDialogOverlay.displayName = "AlertDialogOverlay";

// ---------- Content ----------
const AlertDialogContent = React.forwardRef(
  ({ className, size = "default", variant = "default", ...props }, ref) => {
    const sizeClasses = {
      sm: "max-w-sm",
      default: "max-w-lg",
      lg: "max-w-xl",
    };

    const variantClasses = {
      default: `
        bg-white border border-neutral-200
        shadow-xl
        dark:bg-neutral-900 dark:border-neutral-800
      `,
      glass: `
        bg-white/95 backdrop-blur-xl border border-white/60
        shadow-2xl
        dark:bg-neutral-900/95 dark:border-neutral-800/60
      `,
      destructive: `
        bg-white border-2 border-red-200
        shadow-xl
        dark:bg-neutral-900 dark:border-red-900/50
      `,
      warning: `
        bg-white border-2 border-yellow-200
        shadow-xl
        dark:bg-neutral-900 dark:border-yellow-900/50
      `,
    };

    return (
      <AlertDialogPortal>
        <AlertDialogOverlay />
        <AlertDialogPrimitive.Content
          ref={ref}
          data-slot="alert-dialog-content"
          className={cn(
            "fixed top-[50%] left-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4",
            "max-w-[calc(100%-2rem)] sm:max-w-[calc(100%-4rem)]",
            sizeClasses[size],
            "rounded-2xl p-5 sm:p-6",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "motion-reduce:data-[state=open]:zoom-in-100 motion-reduce:data-[state=closed]:zoom-out-100",
            "motion-reduce:transition-none",
            "duration-300",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
            variantClasses[variant],
            className
          )}
          {...props}
        />
      </AlertDialogPortal>
    );
  }
);
AlertDialogContent.displayName = "AlertDialogContent";

// ---------- Header ----------
function AlertDialogHeader({ className, ...props }) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn(
        "flex flex-col gap-2 text-center sm:text-left",
        className
      )}
      {...props}
    />
  );
}

// ---------- Body ----------
function AlertDialogBody({ className, ...props }) {
  return (
    <div
      data-slot="alert-dialog-body"
      className={cn(
        "text-sm sm:text-base text-neutral-700 dark:text-neutral-300",
        "leading-relaxed",
        className
      )}
      {...props}
    />
  );
}

// ---------- Footer ----------
function AlertDialogFooter({ className, ...props }) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3",
        "mt-2",
        className
      )}
      {...props}
    />
  );
}

// ---------- Title ----------
const AlertDialogTitle = React.forwardRef(({ className, variant, ...props }, ref) => {
  const variantClasses = {
    default: "text-primary-800 dark:text-primary-200",
    destructive: "text-red-700 dark:text-red-400",
    warning: "text-yellow-800 dark:text-yellow-400",
    success: "text-green-700 dark:text-green-400",
  };

  return (
    <AlertDialogPrimitive.Title
      ref={ref}
      data-slot="alert-dialog-title"
      className={cn(
        "text-base sm:text-lg font-semibold leading-tight",
        variantClasses[variant] || variantClasses.default,
        className
      )}
      {...props}
    />
  );
});
AlertDialogTitle.displayName = "AlertDialogTitle";

// ---------- Description ----------
const AlertDialogDescription = React.forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    data-slot="alert-dialog-description"
    className={cn(
      "text-xs sm:text-sm text-neutral-600 dark:text-neutral-400",
      "leading-relaxed",
      className
    )}
    {...props}
  />
));
AlertDialogDescription.displayName = "AlertDialogDescription";

// ---------- Action Button ----------
const AlertDialogAction = React.forwardRef(
  ({ className, variant = "default", size = "default", ...props }, ref) => (
    <AlertDialogPrimitive.Action
      ref={ref}
      data-slot="alert-dialog-action"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
);
AlertDialogAction.displayName = "AlertDialogAction";

// ---------- Cancel Button ----------
const AlertDialogCancel = React.forwardRef(
  ({ className, size = "default", ...props }, ref) => (
    <AlertDialogPrimitive.Cancel
      ref={ref}
      data-slot="alert-dialog-cancel"
      className={cn(
        buttonVariants({ variant: "outline", size }),
        "mt-0",
        className
      )}
      {...props}
    />
  )
);
AlertDialogCancel.displayName = "AlertDialogCancel";

// ---------- Exports ----------
export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
