"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------- Popover Root ----------
const Popover = PopoverPrimitive.Root;

// ---------- Popover Trigger ----------
const PopoverTrigger = PopoverPrimitive.Trigger;

// ---------- Popover Anchor ----------
const PopoverAnchor = PopoverPrimitive.Anchor;

// ---------- Popover Close ----------
const PopoverClose = PopoverPrimitive.Close;

// ---------- Popover Content ----------
const PopoverContent = React.forwardRef(
  (
    {
      className,
      align = "center",
      sideOffset = 8,
      variant = "default",
      width = "default",
      showCloseButton = false,
      ...props
    },
    ref
  ) => {
    const variantClasses = {
      default: `
        bg-white/98 backdrop-blur-xl border-neutral-200 shadow-xl
        dark:bg-neutral-900/98 dark:border-neutral-800
      `,
      glass: `
        bg-white/90 backdrop-blur-2xl border-white/40 shadow-2xl
        dark:bg-neutral-900/90 dark:border-neutral-800/40
      `,
      elevated: `
        bg-gradient-to-br from-white to-neutral-50/90
        backdrop-blur-lg border-neutral-200/60 shadow-2xl
        dark:from-neutral-900 dark:to-neutral-800/90
        dark:border-neutral-800/60
      `,
      solid: `
        bg-white border-neutral-200 shadow-lg
        dark:bg-neutral-900 dark:border-neutral-800
      `,
    };

    const widthClasses = {
      sm: "w-56",
      default: "w-72 sm:w-80",
      lg: "w-80 sm:w-96",
      xl: "w-96 sm:w-[28rem]",
      auto: "w-auto",
      full: "w-[calc(100vw-2rem)] max-w-md",
    };

    return (
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          ref={ref}
          data-slot="popover-content"
          align={align}
          sideOffset={sideOffset}
          className={cn(
            "z-50 rounded-xl border p-4 outline-none",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[side=bottom]:slide-in-from-top-2",
            "data-[side=left]:slide-in-from-right-2",
            "data-[side=right]:slide-in-from-left-2",
            "data-[side=top]:slide-in-from-bottom-2",
            "origin-(--radix-popover-content-transform-origin)",
            "motion-reduce:animate-none",
            variantClasses[variant],
            widthClasses[width],
            className
          )}
          {...props}
        >
          {props.children}
          {showCloseButton && (
            <PopoverPrimitive.Close
              className={cn(
                "absolute top-3 right-3 rounded-full p-1.5",
                "text-neutral-500 hover:text-neutral-700",
                "dark:text-neutral-400 dark:hover:text-neutral-200",
                "hover:bg-neutral-100 dark:hover:bg-neutral-800",
                "transition-colors duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              )}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </PopoverPrimitive.Close>
          )}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    );
  }
);
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

// ---------- Popover Header ----------
const PopoverHeader = React.forwardRef(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="popover-header"
      className={cn("flex flex-col gap-1.5 mb-3", className)}
      {...props}
    >
      {children}
    </div>
  )
);
PopoverHeader.displayName = "PopoverHeader";

// ---------- Popover Title ----------
const PopoverTitle = React.forwardRef(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      data-slot="popover-title"
      className={cn(
        "text-base sm:text-lg font-semibold leading-tight",
        "text-primary-800 dark:text-primary-200",
        className
      )}
      {...props}
    />
  )
);
PopoverTitle.displayName = "PopoverTitle";

// ---------- Popover Description ----------
const PopoverDescription = React.forwardRef(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      data-slot="popover-description"
      className={cn(
        "text-xs sm:text-sm text-neutral-600 dark:text-neutral-400",
        "leading-relaxed",
        className
      )}
      {...props}
    />
  )
);
PopoverDescription.displayName = "PopoverDescription";

// ---------- Popover Body ----------
const PopoverBody = React.forwardRef(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="popover-body"
      className={cn(
        "text-sm text-neutral-700 dark:text-neutral-300",
        "leading-relaxed",
        className
      )}
      {...props}
    />
  )
);
PopoverBody.displayName = "PopoverBody";

// ---------- Popover Footer ----------
const PopoverFooter = React.forwardRef(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="popover-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3",
        "mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800",
        className
      )}
      {...props}
    />
  )
);
PopoverFooter.displayName = "PopoverFooter";

// ---------- Popover Separator ----------
const PopoverSeparator = React.forwardRef(
  ({ className, ...props }, ref) => (
    <hr
      ref={ref}
      data-slot="popover-separator"
      className={cn(
        "h-px bg-neutral-200 dark:bg-neutral-800 border-0 my-3",
        className
      )}
      {...props}
    />
  )
);
PopoverSeparator.displayName = "PopoverSeparator";

// ---------- Popover Arrow ----------
const PopoverArrow = React.forwardRef(
  ({ className, ...props }, ref) => (
    <PopoverPrimitive.Arrow
      ref={ref}
      className={cn(
        "fill-white dark:fill-neutral-900",
        className
      )}
      {...props}
    />
  )
);
PopoverArrow.displayName = "PopoverArrow";

// ---------- Popover List ----------
const PopoverList = React.forwardRef(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("space-y-1", className)}
      {...props}
    />
  )
);
PopoverList.displayName = "PopoverList";

// ---------- Popover List Item ----------
const PopoverListItem = React.forwardRef(
  ({ className, icon, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-start gap-3 rounded-lg p-2.5",
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
PopoverListItem.displayName = "PopoverListItem";

// ---------- Popover Label ----------
const PopoverLabel = React.forwardRef(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "text-xs font-semibold uppercase tracking-wider",
        "text-neutral-600 dark:text-neutral-400",
        "mb-2",
        className
      )}
      {...props}
    />
  )
);
PopoverLabel.displayName = "PopoverLabel";

// ---------- Popover Section ----------
const PopoverSection = React.forwardRef(
  ({ className, title, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("space-y-2", className)}
      {...props}
    >
      {title && <PopoverLabel>{title}</PopoverLabel>}
      {children}
    </div>
  )
);
PopoverSection.displayName = "PopoverSection";

// ---------- Popover Badge ----------
function PopoverBadge({ className, variant = "default", ...props }) {
  const variantClasses = {
    default: "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300",
    success: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
    warning: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300",
    destructive: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}

// ---------- Popover Link ----------
const PopoverLink = React.forwardRef(
  ({ className, ...props }, ref) => (
    <a
      ref={ref}
      className={cn(
        "text-sm font-medium text-primary-700 dark:text-primary-400",
        "hover:text-primary-800 dark:hover:text-primary-300",
        "hover:underline underline-offset-2",
        "transition-colors duration-200",
        "motion-reduce:transition-none",
        className
      )}
      {...props}
    />
  )
);
PopoverLink.displayName = "PopoverLink";

// ---------- Popover Empty State ----------
function PopoverEmptyState({ className, icon, message, ...props }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-8 text-center",
        className
      )}
      {...props}
    >
      {icon && (
        <div className="mb-3 text-neutral-400 dark:text-neutral-600">
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
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverAnchor,
  PopoverClose,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
  PopoverBody,
  PopoverFooter,
  PopoverSeparator,
  PopoverArrow,
  PopoverList,
  PopoverListItem,
  PopoverLabel,
  PopoverSection,
  PopoverBadge,
  PopoverLink,
  PopoverEmptyState,
};
