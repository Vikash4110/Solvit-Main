"use client";

import * as React from "react";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------- Collapsible Root ----------
const Collapsible = React.forwardRef(({ className, ...props }, ref) => (
  <CollapsiblePrimitive.Root
    ref={ref}
    data-slot="collapsible"
    className={cn("w-full", className)}
    {...props}
  />
));
Collapsible.displayName = "Collapsible";

// ---------- Collapsible Trigger ----------
const CollapsibleTrigger = React.forwardRef(
  ({ className, children, showIcon = true, iconClassName, variant = "default", ...props }, ref) => {
    const variantClasses = {
      default: `
        px-4 py-3 rounded-lg
        text-sm font-semibold text-primary-800 dark:text-primary-200
        hover:bg-neutral-50 dark:hover:bg-neutral-900/50
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2
        transition-colors duration-200
        motion-reduce:transition-none
      `,
      ghost: `
        px-2 py-2 rounded-md
        text-sm font-medium text-neutral-700 dark:text-neutral-300
        hover:bg-neutral-100 dark:hover:bg-neutral-800
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2
        transition-colors duration-200
        motion-reduce:transition-none
      `,
      outline: `
        px-4 py-3 rounded-lg border-2 border-neutral-200 dark:border-neutral-800
        text-sm font-semibold text-primary-800 dark:text-primary-200
        hover:border-primary-300 dark:hover:border-primary-700
        hover:bg-primary-50/50 dark:hover:bg-primary-950/30
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2
        transition-all duration-200
        motion-reduce:transition-none
      `,
      elevated: `
        px-4 py-3 rounded-xl
        bg-gradient-to-br from-white to-neutral-50/90
        dark:from-neutral-900 dark:to-neutral-800/90
        border border-neutral-200/60 dark:border-neutral-800/60
        shadow-sm hover:shadow-md
        text-sm font-semibold text-primary-800 dark:text-primary-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2
        transition-all duration-200
        motion-reduce:transition-none
      `,
    };

    return (
      <CollapsiblePrimitive.CollapsibleTrigger
        ref={ref}
        data-slot="collapsible-trigger"
        className={cn(
          "group flex w-full items-center justify-between",
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {children}
        {showIcon && (
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-neutral-600 dark:text-neutral-400",
              "transition-transform duration-300 ease-out",
              "group-data-[state=open]:rotate-180",
              "motion-reduce:transition-none",
              iconClassName
            )}
            aria-hidden="true"
          />
        )}
      </CollapsiblePrimitive.CollapsibleTrigger>
    );
  }
);
CollapsibleTrigger.displayName = "CollapsibleTrigger";

// ---------- Collapsible Content ----------
const CollapsibleContent = React.forwardRef(
  ({ className, children, variant = "default", ...props }, ref) => {
    const variantClasses = {
      default: "px-4 py-3",
      ghost: "px-2 py-2",
      padded: "px-4 py-4 sm:px-6 sm:py-5",
    };

    return (
      <CollapsiblePrimitive.CollapsibleContent
        ref={ref}
        data-slot="collapsible-content"
        className={cn(
          "overflow-hidden",
          "data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down",
          "motion-reduce:data-[state=closed]:animate-none motion-reduce:data-[state=open]:animate-none",
          "text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed",
          className
        )}
        {...props}
      >
        <div className={variantClasses[variant]}>{children}</div>
      </CollapsiblePrimitive.CollapsibleContent>
    );
  }
);
CollapsibleContent.displayName = "CollapsibleContent";

// ---------- Collapsible Card ----------
function CollapsibleCard({
  className,
  variant = "default",
  title,
  description,
  badge,
  children,
  defaultOpen,
  ...props
}) {
  const variantClasses = {
    default: `
      bg-white/95 backdrop-blur-md border border-neutral-200
      rounded-xl shadow-sm
      dark:bg-neutral-900/95 dark:border-neutral-800
    `,
    glass: `
      bg-white/20 backdrop-blur-xl border border-white/30
      rounded-2xl shadow-lg
      dark:bg-neutral-900/20 dark:border-neutral-800/30
    `,
    elevated: `
      bg-gradient-to-br from-white to-neutral-50/90
      backdrop-blur-lg border border-neutral-200/60
      rounded-xl shadow-md
      dark:from-neutral-900 dark:to-neutral-800/90
      dark:border-neutral-800/60
    `,
    bordered: `
      bg-white border-2 border-neutral-200
      rounded-lg
      dark:bg-neutral-900 dark:border-neutral-800
    `,
  };

  return (
    <Collapsible
      defaultOpen={defaultOpen}
      className={cn("overflow-hidden", variantClasses[variant], className)}
      {...props}
    >
      <CollapsibleTrigger
        variant="ghost"
        className="w-full px-4 py-3 sm:px-5 sm:py-4"
      >
        <div className="flex items-center gap-3 flex-1 text-left">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-sm sm:text-base font-semibold text-primary-800 dark:text-primary-200">
                {title}
              </span>
              {badge && (
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                  {badge}
                </span>
              )}
            </div>
            {description && (
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                {description}
              </p>
            )}
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent variant="padded">{children}</CollapsibleContent>
    </Collapsible>
  );
}

// ---------- Collapsible Group ----------
function CollapsibleGroup({ className, children, type = "single", ...props }) {
  return (
    <div
      className={cn("space-y-2", className)}
      role="region"
      aria-label="Collapsible group"
      {...props}
    >
      {children}
    </div>
  );
}

// ---------- Collapsible List Item ----------
function CollapsibleListItem({
  className,
  title,
  icon,
  badge,
  children,
  variant = "default",
  ...props
}) {
  return (
    <Collapsible className={cn("border-b border-neutral-200 dark:border-neutral-800 last:border-b-0", className)} {...props}>
      <CollapsibleTrigger variant="ghost" className="w-full">
        <div className="flex items-center gap-3 flex-1">
          {icon && (
            <div className="flex-shrink-0 text-primary-600 dark:text-primary-400">
              {icon}
            </div>
          )}
          <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200 flex-1 text-left">
            {title}
          </span>
          {badge && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
              {badge}
            </span>
          )}
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent variant={variant}>{children}</CollapsibleContent>
    </Collapsible>
  );
}

export {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
  CollapsibleCard,
  CollapsibleGroup,
  CollapsibleListItem,
};
