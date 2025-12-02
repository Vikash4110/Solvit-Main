"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

// ---------- Sheet Root ----------
const Sheet = SheetPrimitive.Root;

// ---------- Sheet Trigger ----------
const SheetTrigger = SheetPrimitive.Trigger;

// ---------- Sheet Close ----------
const SheetClose = SheetPrimitive.Close;

// ---------- Sheet Portal ----------
const SheetPortal = SheetPrimitive.Portal;

// ---------- Sheet Overlay ----------
const SheetOverlay = React.forwardRef(
  ({ className, ...props }, ref) => (
    <SheetPrimitive.Overlay
      ref={ref}
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "motion-reduce:transition-none",
        "dark:bg-black/80",
        className
      )}
      {...props}
    />
  )
);
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

// ---------- Sheet Content Variants ----------
const sheetContentVariants = cva(
  "fixed z-50 flex flex-col shadow-2xl transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 motion-reduce:transition-none",
  {
    variants: {
      side: {
        top: `
          inset-x-0 top-0 border-b
          data-[state=closed]:slide-out-to-top
          data-[state=open]:slide-in-from-top
        `,
        bottom: `
          inset-x-0 bottom-0 border-t
          data-[state=closed]:slide-out-to-bottom
          data-[state=open]:slide-in-from-bottom
        `,
        left: `
          inset-y-0 left-0 h-full border-r
          data-[state=closed]:slide-out-to-left
          data-[state=open]:slide-in-from-left
        `,
        right: `
          inset-y-0 right-0 h-full border-l
          data-[state=closed]:slide-out-to-right
          data-[state=open]:slide-in-from-right
        `,
      },
      variant: {
        default: `
          bg-white border-neutral-200
          dark:bg-neutral-900 dark:border-neutral-800
        `,
        glass: `
          bg-white/95 backdrop-blur-xl border-white/60
          dark:bg-neutral-900/95 dark:border-neutral-800/60
        `,
        elevated: `
          bg-gradient-to-br from-white to-neutral-50/90
          border-neutral-200/60
          dark:from-neutral-900 dark:to-neutral-800/90
          dark:border-neutral-800/60
        `,
      },
      size: {
        sm: "",
        default: "",
        lg: "",
        xl: "",
        full: "",
      },
    },
    compoundVariants: [
      // Side (left/right) sizes
      {
        side: ["left", "right"],
        size: "sm",
        className: "w-3/4 max-w-xs",
      },
      {
        side: ["left", "right"],
        size: "default",
        className: "w-3/4 max-w-sm",
      },
      {
        side: ["left", "right"],
        size: "lg",
        className: "w-3/4 max-w-md",
      },
      {
        side: ["left", "right"],
        size: "xl",
        className: "w-3/4 max-w-lg",
      },
      {
        side: ["left", "right"],
        size: "full",
        className: "w-full",
      },
      // Top/Bottom sizes
      {
        side: ["top", "bottom"],
        size: "sm",
        className: "max-h-[30vh]",
      },
      {
        side: ["top", "bottom"],
        size: "default",
        className: "max-h-[50vh]",
      },
      {
        side: ["top", "bottom"],
        size: "lg",
        className: "max-h-[70vh]",
      },
      {
        side: ["top", "bottom"],
        size: "xl",
        className: "max-h-[85vh]",
      },
      {
        side: ["top", "bottom"],
        size: "full",
        className: "h-full",
      },
    ],
    defaultVariants: {
      side: "right",
      variant: "default",
      size: "default",
    },
  }
);

// ---------- Sheet Content ----------
const SheetContent = React.forwardRef(
  (
    {
      side = "right",
      variant = "default",
      size = "default",
      className,
      children,
      showCloseButton = true,
      ...props
    },
    ref
  ) => (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        ref={ref}
        data-slot="sheet-content"
        className={cn(
          sheetContentVariants({ side, variant, size }),
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <SheetPrimitive.Close
            className={cn(
              "absolute rounded-full p-2",
              "text-neutral-500 hover:text-neutral-700",
              "dark:text-neutral-400 dark:hover:text-neutral-200",
              "hover:bg-neutral-100 dark:hover:bg-neutral-800",
              "transition-colors duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
              "disabled:pointer-events-none disabled:opacity-50",
              (side === "top" || side === "bottom") && "top-4 right-4",
              side === "left" && "top-4 right-4",
              side === "right" && "top-4 right-4"
            )}
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Content>
    </SheetPortal>
  )
);
SheetContent.displayName = SheetPrimitive.Content.displayName;

// ---------- Sheet Header ----------
const SheetHeader = React.forwardRef(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="sheet-header"
      className={cn(
        "flex flex-col gap-2 p-4 sm:p-6",
        "border-b border-neutral-200 dark:border-neutral-800",
        className
      )}
      {...props}
    />
  )
);
SheetHeader.displayName = "SheetHeader";

// ---------- Sheet Body ----------
const SheetBody = React.forwardRef(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="sheet-body"
      className={cn(
        "flex-1 overflow-y-auto p-4 sm:p-6",
        "text-sm text-neutral-700 dark:text-neutral-300",
        "leading-relaxed",
        className
      )}
      {...props}
    />
  )
);
SheetBody.displayName = "SheetBody";

// ---------- Sheet Footer ----------
const SheetFooter = React.forwardRef(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="sheet-footer"
      className={cn(
        "mt-auto flex flex-col-reverse gap-2 p-4 sm:p-6",
        "sm:flex-row sm:justify-end sm:gap-3",
        "border-t border-neutral-200 dark:border-neutral-800",
        className
      )}
      {...props}
    />
  )
);
SheetFooter.displayName = "SheetFooter";

// ---------- Sheet Title ----------
const SheetTitle = React.forwardRef(
  ({ className, ...props }, ref) => (
    <SheetPrimitive.Title
      ref={ref}
      data-slot="sheet-title"
      className={cn(
        "text-lg sm:text-xl font-semibold leading-tight",
        "text-primary-800 dark:text-primary-200",
        className
      )}
      {...props}
    />
  )
);
SheetTitle.displayName = SheetPrimitive.Title.displayName;

// ---------- Sheet Description ----------
const SheetDescription = React.forwardRef(
  ({ className, ...props }, ref) => (
    <SheetPrimitive.Description
      ref={ref}
      data-slot="sheet-description"
      className={cn(
        "text-xs sm:text-sm text-neutral-600 dark:text-neutral-400",
        "leading-relaxed",
        className
      )}
      {...props}
    />
  )
);
SheetDescription.displayName = SheetPrimitive.Description.displayName;

// ---------- Sheet Section ----------
const SheetSection = React.forwardRef(
  ({ className, title, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("space-y-3", className)}
      {...props}
    >
      {title && (
        <h4 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
          {title}
        </h4>
      )}
      {children}
    </div>
  )
);
SheetSection.displayName = "SheetSection";

// ---------- Sheet Separator ----------
const SheetSeparator = React.forwardRef(
  ({ className, ...props }, ref) => (
    <hr
      ref={ref}
      className={cn(
        "h-px bg-neutral-200 dark:bg-neutral-800 border-0 my-4",
        className
      )}
      {...props}
    />
  )
);
SheetSeparator.displayName = "SheetSeparator";

// ---------- Sheet Scrollable ----------
const SheetScrollable = React.forwardRef(
  ({ className, children, maxHeight = "max-h-96", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "overflow-y-auto",
        maxHeight,
        "scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700",
        "scrollbar-track-transparent",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
SheetScrollable.displayName = "SheetScrollable";

// ---------- Sheet List ----------
const SheetList = React.forwardRef(
  ({ className, children, spacing = "default", ...props }, ref) => {
    const spacingClasses = {
      none: "space-y-0",
      sm: "space-y-1",
      default: "space-y-2",
      lg: "space-y-3",
      xl: "space-y-4",
    };

    return (
      <div
        ref={ref}
        className={cn(spacingClasses[spacing], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
SheetList.displayName = "SheetList";

// ---------- Sheet List Item ----------
const SheetListItem = React.forwardRef(
  ({ className, icon, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-start gap-3 rounded-lg p-3",
        "hover:bg-neutral-50 dark:hover:bg-neutral-900/50",
        "transition-colors duration-200",
        "cursor-pointer",
        className
      )}
      {...props}
    >
      {icon && (
        <div className="flex-shrink-0 text-primary-600 dark:text-primary-400 mt-0.5">
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
);
SheetListItem.displayName = "SheetListItem";

// ---------- Sheet Empty State ----------
function SheetEmptyState({ className, icon, message, ...props }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 text-center",
        className
      )}
      {...props}
    >
      {icon && (
        <div className="mb-4 text-neutral-400 dark:text-neutral-600">
          {icon}
        </div>
      )}
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        {message || "No items to display"}
      </p>
    </div>
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetBody,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetSection,
  SheetSeparator,
  SheetScrollable,
  SheetList,
  SheetListItem,
  SheetEmptyState,
  SheetPortal,
  SheetOverlay,
  sheetContentVariants,
};
