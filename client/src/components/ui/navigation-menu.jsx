"use client";

import * as React from "react";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { cva } from "class-variance-authority";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------- Navigation Menu Root ----------
const NavigationMenu = React.forwardRef(
  (
    {
      className,
      children,
      viewport = true,
      variant = "default",
      ...props
    },
    ref
  ) => {
    const variantClasses = {
      default: "",
      glass: "bg-white/20 backdrop-blur-xl border border-white/30 rounded-xl p-1.5 dark:bg-neutral-900/20 dark:border-neutral-800/30",
      elevated: "bg-gradient-to-br from-white to-neutral-50/90 backdrop-blur-lg border border-neutral-200/60 rounded-xl shadow-md p-1.5 dark:from-neutral-900 dark:to-neutral-800/90 dark:border-neutral-800/60",
    };

    return (
      <NavigationMenuPrimitive.Root
        ref={ref}
        data-slot="navigation-menu"
        data-viewport={viewport}
        className={cn(
          "group/navigation-menu relative flex max-w-max flex-1 items-center justify-center",
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {children}
        {viewport && <NavigationMenuViewport />}
      </NavigationMenuPrimitive.Root>
    );
  }
);
NavigationMenu.displayName = NavigationMenuPrimitive.Root.displayName;

// ---------- Navigation Menu List ----------
const NavigationMenuList = React.forwardRef(
  ({ className, ...props }, ref) => (
    <NavigationMenuPrimitive.List
      ref={ref}
      data-slot="navigation-menu-list"
      className={cn(
        "group flex flex-1 list-none items-center justify-center gap-1",
        className
      )}
      {...props}
    />
  )
);
NavigationMenuList.displayName = NavigationMenuPrimitive.List.displayName;

// ---------- Navigation Menu Item ----------
const NavigationMenuItem = React.forwardRef(
  ({ className, ...props }, ref) => (
    <NavigationMenuPrimitive.Item
      ref={ref}
      data-slot="navigation-menu-item"
      className={cn("relative", className)}
      {...props}
    />
  )
);
NavigationMenuItem.displayName = NavigationMenuPrimitive.Item.displayName;

// ---------- Navigation Menu Trigger Style ----------
const navigationMenuTriggerStyle = cva(
  "group inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold outline-none transition-all duration-200 motion-reduce:transition-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: `
          text-neutral-700 dark:text-neutral-300
          hover:bg-neutral-100 dark:hover:bg-neutral-800
          hover:text-primary-800 dark:hover:text-primary-200
          focus-visible:bg-primary-100 dark:focus-visible:bg-primary-900/30
          focus-visible:text-primary-900 dark:focus-visible:text-primary-100
          focus-visible:ring-2 focus-visible:ring-primary-500/30
          data-[state=open]:bg-primary-100 dark:data-[state=open]:bg-primary-900/30
          data-[state=open]:text-primary-900 dark:data-[state=open]:text-primary-100
        `,
        ghost: `
          text-neutral-600 dark:text-neutral-400
          hover:text-primary-700 dark:hover:text-primary-400
          focus-visible:ring-2 focus-visible:ring-primary-500/30
          data-[state=open]:text-primary-700 dark:data-[state=open]:text-primary-400
        `,
        subtle: `
          text-neutral-700 dark:text-neutral-300
          hover:bg-primary-50 dark:hover:bg-primary-950/30
          hover:text-primary-800 dark:hover:text-primary-200
          focus-visible:ring-2 focus-visible:ring-primary-500/30
          data-[state=open]:bg-primary-100 dark:data-[state=open]:bg-primary-900/30
          data-[state=open]:text-primary-900 dark:data-[state=open]:text-primary-100
        `,
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

// ---------- Navigation Menu Trigger ----------
const NavigationMenuTrigger = React.forwardRef(
  ({ className, children, variant, ...props }, ref) => (
    <NavigationMenuPrimitive.Trigger
      ref={ref}
      data-slot="navigation-menu-trigger"
      className={cn(navigationMenuTriggerStyle({ variant }), "group", className)}
      {...props}
    >
      {children}
      <ChevronDown
        className={cn(
          "relative ml-1.5 h-3.5 w-3.5 transition-transform duration-300",
          "group-data-[state=open]:rotate-180",
          "motion-reduce:transition-none"
        )}
        aria-hidden="true"
      />
    </NavigationMenuPrimitive.Trigger>
  )
);
NavigationMenuTrigger.displayName = NavigationMenuPrimitive.Trigger.displayName;

// ---------- Navigation Menu Content ----------
const NavigationMenuContent = React.forwardRef(
  ({ className, ...props }, ref) => (
    <NavigationMenuPrimitive.Content
      ref={ref}
      data-slot="navigation-menu-content"
      className={cn(
        "top-0 left-0 w-full p-3 md:absolute md:w-auto",
        "data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out",
        "data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out",
        "data-[motion=from-end]:slide-in-from-right-52",
        "data-[motion=from-start]:slide-in-from-left-52",
        "data-[motion=to-end]:slide-out-to-right-52",
        "data-[motion=to-start]:slide-out-to-left-52",
        "motion-reduce:animate-none",
        // Without viewport
        "group-data-[viewport=false]/navigation-menu:top-full",
        "group-data-[viewport=false]/navigation-menu:mt-2",
        "group-data-[viewport=false]/navigation-menu:overflow-hidden",
        "group-data-[viewport=false]/navigation-menu:rounded-xl",
        "group-data-[viewport=false]/navigation-menu:border",
        "group-data-[viewport=false]/navigation-menu:border-neutral-200",
        "group-data-[viewport=false]/navigation-menu:dark:border-neutral-800",
        "group-data-[viewport=false]/navigation-menu:bg-white/98",
        "group-data-[viewport=false]/navigation-menu:dark:bg-neutral-900/98",
        "group-data-[viewport=false]/navigation-menu:backdrop-blur-xl",
        "group-data-[viewport=false]/navigation-menu:shadow-xl",
        "group-data-[viewport=false]/navigation-menu:duration-200",
        "group-data-[viewport=false]/navigation-menu:data-[state=open]:animate-in",
        "group-data-[viewport=false]/navigation-menu:data-[state=closed]:animate-out",
        "group-data-[viewport=false]/navigation-menu:data-[state=closed]:zoom-out-95",
        "group-data-[viewport=false]/navigation-menu:data-[state=open]:zoom-in-95",
        "group-data-[viewport=false]/navigation-menu:data-[state=open]:fade-in-0",
        "group-data-[viewport=false]/navigation-menu:data-[state=closed]:fade-out-0",
        // Focus handling
        "**:data-[slot=navigation-menu-link]:focus:ring-0",
        "**:data-[slot=navigation-menu-link]:focus:outline-none",
        className
      )}
      {...props}
    />
  )
);
NavigationMenuContent.displayName = NavigationMenuPrimitive.Content.displayName;

// ---------- Navigation Menu Viewport ----------
const NavigationMenuViewport = React.forwardRef(
  ({ className, ...props }, ref) => (
    <div className="absolute top-full left-0 isolate z-50 flex justify-center">
      <NavigationMenuPrimitive.Viewport
        ref={ref}
        data-slot="navigation-menu-viewport"
        className={cn(
          "origin-top-center relative mt-2",
          "h-[var(--radix-navigation-menu-viewport-height)]",
          "w-full overflow-hidden rounded-xl border shadow-xl",
          "bg-white/98 backdrop-blur-xl border-neutral-200",
          "dark:bg-neutral-900/98 dark:border-neutral-800",
          "md:w-[var(--radix-navigation-menu-viewport-width)]",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
          "motion-reduce:animate-none",
          className
        )}
        {...props}
      />
    </div>
  )
);
NavigationMenuViewport.displayName = NavigationMenuPrimitive.Viewport.displayName;

// ---------- Navigation Menu Link ----------
const NavigationMenuLink = React.forwardRef(
  ({ className, children, icon, description, ...props }, ref) => (
    <NavigationMenuPrimitive.Link
      ref={ref}
      data-slot="navigation-menu-link"
      className={cn(
        "flex flex-col gap-1.5 rounded-lg p-3 text-sm transition-all duration-200 outline-none",
        "motion-reduce:transition-none",
        "hover:bg-primary-50 dark:hover:bg-primary-950/30",
        "hover:text-primary-900 dark:hover:text-primary-100",
        "focus-visible:bg-primary-100 dark:focus-visible:bg-primary-900/30",
        "focus-visible:text-primary-900 dark:focus-visible:text-primary-100",
        "focus-visible:ring-2 focus-visible:ring-primary-500/30",
        "data-[active=true]:bg-primary-100 dark:data-[active=true]:bg-primary-900/30",
        "data-[active=true]:text-primary-900 dark:data-[active=true]:text-primary-100",
        "[&_svg:not([class*='text-'])]:text-neutral-600 dark:[&_svg:not([class*='text-'])]:text-neutral-400",
        "[&_svg:not([class*='size-'])]:h-5 [&_svg:not([class*='size-'])]:w-5",
        className
      )}
      {...props}
    >
      {icon && <div className="flex-shrink-0 text-primary-600 dark:text-primary-400">{icon}</div>}
      <div className="flex flex-col gap-1">
        <div className="font-semibold leading-tight text-neutral-800 dark:text-neutral-200">
          {children}
        </div>
        {description && (
          <p className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
            {description}
          </p>
        )}
      </div>
    </NavigationMenuPrimitive.Link>
  )
);
NavigationMenuLink.displayName = NavigationMenuPrimitive.Link.displayName;

// ---------- Navigation Menu Indicator ----------
const NavigationMenuIndicator = React.forwardRef(
  ({ className, ...props }, ref) => (
    <NavigationMenuPrimitive.Indicator
      ref={ref}
      data-slot="navigation-menu-indicator"
      className={cn(
        "top-full z-[1] flex h-2 items-end justify-center overflow-hidden",
        "data-[state=visible]:animate-in data-[state=hidden]:animate-out",
        "data-[state=hidden]:fade-out data-[state=visible]:fade-in",
        "motion-reduce:animate-none",
        className
      )}
      {...props}
    >
      <div className="relative top-[60%] h-2.5 w-2.5 rotate-45 rounded-tl-sm bg-white dark:bg-neutral-900 border-l border-t border-neutral-200 dark:border-neutral-800 shadow-md" />
    </NavigationMenuPrimitive.Indicator>
  )
);
NavigationMenuIndicator.displayName = NavigationMenuPrimitive.Indicator.displayName;

// ---------- Navigation Menu Simple Link ----------
const NavigationMenuSimpleLink = React.forwardRef(
  ({ className, children, variant = "default", ...props }, ref) => (
    <NavigationMenuPrimitive.Link
      ref={ref}
      className={cn(navigationMenuTriggerStyle({ variant }), className)}
      {...props}
    >
      {children}
    </NavigationMenuPrimitive.Link>
  )
);
NavigationMenuSimpleLink.displayName = "NavigationMenuSimpleLink";

// ---------- Navigation Menu Grid ----------
const NavigationMenuGrid = React.forwardRef(
  ({ className, columns = 2, ...props }, ref) => {
    const columnClasses = {
      1: "grid-cols-1",
      2: "grid-cols-1 md:grid-cols-2",
      3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
      4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    };

    return (
      <div
        ref={ref}
        className={cn("grid gap-2", columnClasses[columns], className)}
        {...props}
      />
    );
  }
);
NavigationMenuGrid.displayName = "NavigationMenuGrid";

// ---------- Navigation Menu Section ----------
const NavigationMenuSection = React.forwardRef(
  ({ className, title, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("space-y-2", className)}
      {...props}
    >
      {title && (
        <h4 className="px-3 text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
          {title}
        </h4>
      )}
      {children}
    </div>
  )
);
NavigationMenuSection.displayName = "NavigationMenuSection";

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
  NavigationMenuSimpleLink,
  NavigationMenuGrid,
  NavigationMenuSection,
  navigationMenuTriggerStyle,
};
