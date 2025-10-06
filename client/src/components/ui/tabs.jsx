"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

// ---------- Tabs Root ----------
const Tabs = React.forwardRef(
  ({ className, orientation = "horizontal", ...props }, ref) => (
    <TabsPrimitive.Root
      ref={ref}
      data-slot="tabs"
      orientation={orientation}
      className={cn(
        "flex",
        orientation === "horizontal" ? "flex-col gap-4" : "flex-row gap-4",
        className
      )}
      {...props}
    />
  )
);
Tabs.displayName = TabsPrimitive.Root.displayName;

// ---------- Tabs List Variants ----------
const tabsListVariants = cva(
  "inline-flex items-center justify-center transition-colors duration-200 motion-reduce:transition-none",
  {
    variants: {
      variant: {
        default: `
          bg-neutral-100 dark:bg-neutral-800
          rounded-lg p-1 gap-1
        `,
        underline: `
          bg-transparent border-b border-neutral-200 dark:border-neutral-800
          gap-4 px-0
        `,
        pills: `
          bg-transparent gap-2
        `,
        bordered: `
          bg-white dark:bg-neutral-900
          border border-neutral-200 dark:border-neutral-800
          rounded-lg p-1 gap-1
        `,
      },
      orientation: {
        horizontal: "flex-row w-fit",
        vertical: "flex-col h-fit",
      },
    },
    defaultVariants: {
      variant: "default",
      orientation: "horizontal",
    },
  }
);

// ---------- Tabs List ----------
const TabsList = React.forwardRef(
  ({ className, variant, orientation, ...props }, ref) => (
    <TabsPrimitive.List
      ref={ref}
      data-slot="tabs-list"
      className={cn(tabsListVariants({ variant, orientation }), className)}
      {...props}
    />
  )
);
TabsList.displayName = TabsPrimitive.List.displayName;

// ---------- Tabs Trigger Variants ----------
const tabsTriggerVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 outline-none disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:h-4 [&_svg:not([class*='size-'])]:w-4",
  {
    variants: {
      variant: {
        default: `
          rounded-md px-3 py-1.5
          text-neutral-600 dark:text-neutral-400
          hover:text-neutral-900 dark:hover:text-neutral-100
          data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900
          data-[state=active]:text-primary-900 dark:data-[state=active]:text-primary-100
          data-[state=active]:shadow-sm
          focus-visible:ring-2 focus-visible:ring-primary-500/30
        `,
        underline: `
          px-3 py-2 border-b-2 border-transparent
          text-neutral-600 dark:text-neutral-400
          hover:text-neutral-900 dark:hover:text-neutral-100
          hover:border-neutral-300 dark:hover:border-neutral-700
          data-[state=active]:border-primary-700 dark:data-[state=active]:border-primary-500
          data-[state=active]:text-primary-900 dark:data-[state=active]:text-primary-100
          data-[state=active]:font-semibold
          focus-visible:ring-2 focus-visible:ring-primary-500/30
        `,
        pills: `
          rounded-full px-4 py-2
          text-neutral-600 dark:text-neutral-400
          hover:bg-neutral-100 dark:hover:bg-neutral-800
          hover:text-neutral-900 dark:hover:text-neutral-100
          data-[state=active]:bg-primary-700 dark:data-[state=active]:bg-primary-600
          data-[state=active]:text-white
          data-[state=active]:shadow-md
          focus-visible:ring-2 focus-visible:ring-primary-500/30
        `,
        bordered: `
          rounded-md px-3 py-1.5
          text-neutral-600 dark:text-neutral-400
          hover:text-neutral-900 dark:hover:text-neutral-100
          data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-950
          data-[state=active]:border data-[state=active]:border-neutral-200 dark:data-[state=active]:border-neutral-800
          data-[state=active]:text-primary-900 dark:data-[state=active]:text-primary-100
          data-[state=active]:shadow-sm
          focus-visible:ring-2 focus-visible:ring-primary-500/30
        `,
      },
      size: {
        sm: "text-xs px-2.5 py-1",
        default: "text-sm px-3 py-1.5",
        lg: "text-base px-4 py-2",
      },
    },
    compoundVariants: [
      {
        variant: "pills",
        size: "sm",
        className: "px-3 py-1",
      },
      {
        variant: "pills",
        size: "lg",
        className: "px-5 py-2.5",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// ---------- Tabs Trigger ----------
const TabsTrigger = React.forwardRef(
  ({ className, variant, size, icon, badge, ...props }, ref) => (
    <TabsPrimitive.Trigger
      ref={ref}
      data-slot="tabs-trigger"
      className={cn(tabsTriggerVariants({ variant, size }), className)}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="flex-1">{props.children}</span>
      {badge && (
        <span className="ml-1.5 inline-flex items-center justify-center min-w-5 h-5 px-1.5 text-xs font-medium rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 data-[state=active]:bg-primary-200 dark:data-[state=active]:bg-primary-800">
          {badge}
        </span>
      )}
    </TabsPrimitive.Trigger>
  )
);
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

// ---------- Tabs Content ----------
const TabsContent = React.forwardRef(
  ({ className, ...props }, ref) => (
    <TabsPrimitive.Content
      ref={ref}
      data-slot="tabs-content"
      className={cn(
        "flex-1 outline-none",
        "focus-visible:ring-2 focus-visible:ring-primary-500/30 focus-visible:rounded-lg",
        className
      )}
      {...props}
    />
  )
);
TabsContent.displayName = TabsPrimitive.Content.displayName;

// ---------- Tabs Card ----------
const TabsCard = React.forwardRef(
  ({ className, variant = "default", children, ...props }, ref) => {
    const variantClasses = {
      default: `
        rounded-xl border border-neutral-200 dark:border-neutral-800
        bg-white dark:bg-neutral-900 shadow-sm overflow-hidden
      `,
      glass: `
        rounded-xl border border-white/60 dark:border-neutral-800/60
        bg-white/95 backdrop-blur-xl dark:bg-neutral-900/95
        shadow-lg overflow-hidden
      `,
      elevated: `
        rounded-xl border border-neutral-200/60 dark:border-neutral-800/60
        bg-gradient-to-br from-white to-neutral-50/90
        dark:from-neutral-900 dark:to-neutral-800/90
        shadow-md overflow-hidden
      `,
    };

    return (
      <div
        ref={ref}
        className={cn(variantClasses[variant], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TabsCard.displayName = "TabsCard";

// ---------- Tabs Header ----------
const TabsHeader = React.forwardRef(
  ({ className, title, description, actions, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-between gap-4 px-6 py-4",
        "border-b border-neutral-200 dark:border-neutral-800",
        className
      )}
      {...props}
    >
      <div className="space-y-1">
        {title && (
          <h3 className="text-base font-semibold text-primary-800 dark:text-primary-200">
            {title}
          </h3>
        )}
        {description && (
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
);
TabsHeader.displayName = "TabsHeader";

// ---------- Tabs Body ----------
const TabsBody = React.forwardRef(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("p-6", className)}
      {...props}
    />
  )
);
TabsBody.displayName = "TabsBody";

// ---------- Tabs Footer ----------
const TabsFooter = React.forwardRef(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-end gap-3 px-6 py-4",
        "border-t border-neutral-200 dark:border-neutral-800",
        className
      )}
      {...props}
    />
  )
);
TabsFooter.displayName = "TabsFooter";

// ---------- Tabs With Count ----------
const TabsWithCount = React.forwardRef(
  ({ className, items = [], variant, size, ...props }, ref) => (
    <Tabs ref={ref} className={className} {...props}>
      <TabsList variant={variant}>
        {items.map((item) => (
          <TabsTrigger
            key={item.value}
            value={item.value}
            variant={variant}
            size={size}
            icon={item.icon}
            badge={item.count}
          >
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {items.map((item) => (
        <TabsContent key={item.value} value={item.value}>
          {item.content}
        </TabsContent>
      ))}
    </Tabs>
  )
);
TabsWithCount.displayName = "TabsWithCount";

// ---------- Tabs Vertical ----------
const TabsVertical = React.forwardRef(
  ({ className, children, ...props }, ref) => (
    <Tabs
      ref={ref}
      orientation="vertical"
      className={cn("flex-row", className)}
      {...props}
    >
      {children}
    </Tabs>
  )
);
TabsVertical.displayName = "TabsVertical";

// ---------- Tabs Container ----------
const TabsContainer = React.forwardRef(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("w-full space-y-4", className)}
      {...props}
    />
  )
);
TabsContainer.displayName = "TabsContainer";

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  TabsCard,
  TabsHeader,
  TabsBody,
  TabsFooter,
  TabsWithCount,
  TabsVertical,
  TabsContainer,
  tabsListVariants,
  tabsTriggerVariants,
};
