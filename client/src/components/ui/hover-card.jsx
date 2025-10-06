"use client";

import * as React from "react";
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import { cn } from "@/lib/utils";

// ---------- Hover Card Root ----------
const HoverCard = HoverCardPrimitive.Root;

// ---------- Hover Card Trigger ----------
const HoverCardTrigger = HoverCardPrimitive.Trigger;

// ---------- Hover Card Content ----------
const HoverCardContent = React.forwardRef(
  (
    {
      className,
      align = "center",
      sideOffset = 8,
      variant = "default",
      width = "default",
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
      sm: "w-48",
      default: "w-64 sm:w-72",
      lg: "w-80 sm:w-96",
      xl: "w-96 sm:w-[28rem]",
      auto: "w-auto",
    };

    return (
      <HoverCardPrimitive.Portal>
        <HoverCardPrimitive.Content
          ref={ref}
          data-slot="hover-card-content"
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
            "origin-(--radix-hover-card-content-transform-origin)",
            "motion-reduce:animate-none",
            variantClasses[variant],
            widthClasses[width],
            className
          )}
          {...props}
        />
      </HoverCardPrimitive.Portal>
    );
  }
);
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName;

// ---------- Hover Card Header ----------
const HoverCardHeader = React.forwardRef(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="hover-card-header"
      className={cn("flex flex-col gap-1.5 mb-3", className)}
      {...props}
    >
      {children}
    </div>
  )
);
HoverCardHeader.displayName = "HoverCardHeader";

// ---------- Hover Card Title ----------
const HoverCardTitle = React.forwardRef(
  ({ className, ...props }, ref) => (
    <h4
      ref={ref}
      data-slot="hover-card-title"
      className={cn(
        "text-base font-semibold leading-tight",
        "text-primary-800 dark:text-primary-200",
        className
      )}
      {...props}
    />
  )
);
HoverCardTitle.displayName = "HoverCardTitle";

// ---------- Hover Card Description ----------
const HoverCardDescription = React.forwardRef(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      data-slot="hover-card-description"
      className={cn(
        "text-xs text-neutral-600 dark:text-neutral-400",
        "leading-relaxed",
        className
      )}
      {...props}
    />
  )
);
HoverCardDescription.displayName = "HoverCardDescription";

// ---------- Hover Card Body ----------
const HoverCardBody = React.forwardRef(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="hover-card-body"
      className={cn(
        "text-sm text-neutral-700 dark:text-neutral-300",
        "leading-relaxed space-y-2",
        className
      )}
      {...props}
    />
  )
);
HoverCardBody.displayName = "HoverCardBody";

// ---------- Hover Card Footer ----------
const HoverCardFooter = React.forwardRef(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="hover-card-footer"
      className={cn(
        "flex items-center gap-2 mt-3 pt-3",
        "border-t border-neutral-200 dark:border-neutral-800",
        className
      )}
      {...props}
    />
  )
);
HoverCardFooter.displayName = "HoverCardFooter";

// ---------- Hover Card Avatar ----------
const HoverCardAvatar = React.forwardRef(
  ({ className, src, alt, fallback, size = "default", ...props }, ref) => {
    const [imageError, setImageError] = React.useState(false);

    const sizeClasses = {
      sm: "h-10 w-10 text-xs",
      default: "h-12 w-12 text-sm",
      lg: "h-16 w-16 text-base",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex items-center justify-center rounded-full overflow-hidden shrink-0",
          "bg-primary-100 dark:bg-primary-900/30",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {!imageError && src ? (
          <img
            src={src}
            alt={alt || ""}
            className="h-full w-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <span className="font-semibold text-primary-700 dark:text-primary-300">
            {fallback}
          </span>
        )}
      </div>
    );
  }
);
HoverCardAvatar.displayName = "HoverCardAvatar";

// ---------- Hover Card Stat ----------
function HoverCardStat({ label, value, className, ...props }) {
  return (
    <div
      className={cn("flex flex-col gap-0.5", className)}
      {...props}
    >
      <span className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">
        {label}
      </span>
      <span className="text-sm font-semibold text-primary-800 dark:text-primary-200">
        {value}
      </span>
    </div>
  );
}

// ---------- Hover Card Stats ----------
const HoverCardStats = React.forwardRef(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="hover-card-stats"
      className={cn(
        "flex items-center gap-4 py-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
HoverCardStats.displayName = "HoverCardStats";

// ---------- Hover Card Badge ----------
function HoverCardBadge({ className, variant = "default", ...props }) {
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

// ---------- Hover Card Link ----------
const HoverCardLink = React.forwardRef(
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
HoverCardLink.displayName = "HoverCardLink";

// ---------- Hover Card Separator ----------
const HoverCardSeparator = React.forwardRef(
  ({ className, ...props }, ref) => (
    <hr
      ref={ref}
      data-slot="hover-card-separator"
      className={cn(
        "h-px bg-neutral-200 dark:bg-neutral-800 border-0 my-3",
        className
      )}
      {...props}
    />
  )
);
HoverCardSeparator.displayName = "HoverCardSeparator";

// ---------- Hover Card Arrow ----------
const HoverCardArrow = React.forwardRef(
  ({ className, ...props }, ref) => (
    <HoverCardPrimitive.Arrow
      ref={ref}
      className={cn(
        "fill-white dark:fill-neutral-900",
        className
      )}
      {...props}
    />
  )
);
HoverCardArrow.displayName = "HoverCardArrow";

export {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
  HoverCardHeader,
  HoverCardTitle,
  HoverCardDescription,
  HoverCardBody,
  HoverCardFooter,
  HoverCardAvatar,
  HoverCardStat,
  HoverCardStats,
  HoverCardBadge,
  HoverCardLink,
  HoverCardSeparator,
  HoverCardArrow,
};
