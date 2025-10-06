"use client";

import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------- Drawer Root ----------
const Drawer = ({ shouldScaleBackground = true, ...props }) => (
  <DrawerPrimitive.Root
    shouldScaleBackground={shouldScaleBackground}
    data-slot="drawer"
    {...props}
  />
);
Drawer.displayName = "Drawer";

// ---------- Drawer Trigger ----------
const DrawerTrigger = DrawerPrimitive.Trigger;

// ---------- Drawer Portal ----------
const DrawerPortal = DrawerPrimitive.Portal;

// ---------- Drawer Close ----------
const DrawerClose = DrawerPrimitive.Close;

// ---------- Drawer Overlay ----------
const DrawerOverlay = React.forwardRef(({ className, ...props }, ref) => (
  <DrawerPrimitive.Overlay
    ref={ref}
    data-slot="drawer-overlay"
    className={cn(
      "fixed inset-0 z-50 bg-black/60",
      "backdrop-blur-sm",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      "motion-reduce:transition-none",
      "dark:bg-black/80",
      className
    )}
    {...props}
  />
));
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName;

// ---------- Drawer Content ----------
const DrawerContent = React.forwardRef(
  (
    {
      className,
      children,
      variant = "default",
      showHandle = true,
      showCloseButton = true,
      ...props
    },
    ref
  ) => {
    const variantClasses = {
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
    };

    return (
      <DrawerPortal>
        <DrawerOverlay />
        <DrawerPrimitive.Content
          ref={ref}
          data-slot="drawer-content"
          className={cn(
            "group/drawer-content fixed z-50 flex flex-col",
            "motion-reduce:transition-none",
            // Bottom drawer (default)
            "data-[vaul-drawer-direction=bottom]:inset-x-0",
            "data-[vaul-drawer-direction=bottom]:bottom-0",
            "data-[vaul-drawer-direction=bottom]:mt-24",
            "data-[vaul-drawer-direction=bottom]:max-h-[85vh]",
            "data-[vaul-drawer-direction=bottom]:rounded-t-2xl",
            "data-[vaul-drawer-direction=bottom]:border-t",
            // Top drawer
            "data-[vaul-drawer-direction=top]:inset-x-0",
            "data-[vaul-drawer-direction=top]:top-0",
            "data-[vaul-drawer-direction=top]:mb-24",
            "data-[vaul-drawer-direction=top]:max-h-[85vh]",
            "data-[vaul-drawer-direction=top]:rounded-b-2xl",
            "data-[vaul-drawer-direction=top]:border-b",
            // Right drawer
            "data-[vaul-drawer-direction=right]:inset-y-0",
            "data-[vaul-drawer-direction=right]:right-0",
            "data-[vaul-drawer-direction=right]:h-full",
            "data-[vaul-drawer-direction=right]:w-full",
            "data-[vaul-drawer-direction=right]:max-w-sm",
            "data-[vaul-drawer-direction=right]:border-l",
            "data-[vaul-drawer-direction=right]:sm:max-w-md",
            // Left drawer
            "data-[vaul-drawer-direction=left]:inset-y-0",
            "data-[vaul-drawer-direction=left]:left-0",
            "data-[vaul-drawer-direction=left]:h-full",
            "data-[vaul-drawer-direction=left]:w-full",
            "data-[vaul-drawer-direction=left]:max-w-sm",
            "data-[vaul-drawer-direction=left]:border-r",
            "data-[vaul-drawer-direction=left]:sm:max-w-md",
            variantClasses[variant],
            className
          )}
          {...props}
        >
          {/* Handle for bottom/top drawers */}
          {showHandle && (
            <div
              className={cn(
                "mx-auto h-1.5 w-12 shrink-0 rounded-full",
                "bg-neutral-300 dark:bg-neutral-700",
                "hidden",
                "group-data-[vaul-drawer-direction=bottom]/drawer-content:block",
                "group-data-[vaul-drawer-direction=bottom]/drawer-content:mt-4",
                "group-data-[vaul-drawer-direction=top]/drawer-content:block",
                "group-data-[vaul-drawer-direction=top]/drawer-content:mb-4"
              )}
            />
          )}

          {children}

          {/* Close button for side drawers */}
          {showCloseButton && (
            <DrawerClose
              className={cn(
                "absolute top-4 rounded-full p-2",
                "text-neutral-500 hover:text-neutral-700",
                "dark:text-neutral-400 dark:hover:text-neutral-200",
                "hover:bg-neutral-100 dark:hover:bg-neutral-800",
                "transition-colors duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
                "hidden",
                "group-data-[vaul-drawer-direction=right]/drawer-content:block",
                "group-data-[vaul-drawer-direction=right]/drawer-content:left-4",
                "group-data-[vaul-drawer-direction=left]/drawer-content:block",
                "group-data-[vaul-drawer-direction=left]/drawer-content:right-4"
              )}
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </DrawerClose>
          )}
        </DrawerPrimitive.Content>
      </DrawerPortal>
    );
  }
);
DrawerContent.displayName = "DrawerContent";

// ---------- Drawer Header ----------
const DrawerHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="drawer-header"
    className={cn(
      "flex flex-col gap-2 p-4 sm:p-6",
      "group-data-[vaul-drawer-direction=bottom]/drawer-content:text-center",
      "group-data-[vaul-drawer-direction=top]/drawer-content:text-center",
      "group-data-[vaul-drawer-direction=right]/drawer-content:pt-16",
      "group-data-[vaul-drawer-direction=left]/drawer-content:pt-16",
      className
    )}
    {...props}
  />
));
DrawerHeader.displayName = "DrawerHeader";

// ---------- Drawer Body ----------
const DrawerBody = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="drawer-body"
    className={cn(
      "flex-1 overflow-y-auto p-4 sm:p-6",
      "text-sm text-neutral-700 dark:text-neutral-300",
      "leading-relaxed",
      className
    )}
    {...props}
  />
));
DrawerBody.displayName = "DrawerBody";

// ---------- Drawer Footer ----------
const DrawerFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="drawer-footer"
    className={cn(
      "mt-auto flex flex-col-reverse gap-2 p-4 sm:p-6",
      "sm:flex-row sm:justify-end sm:gap-3",
      "border-t border-neutral-200 dark:border-neutral-800",
      className
    )}
    {...props}
  />
));
DrawerFooter.displayName = "DrawerFooter";

// ---------- Drawer Title ----------
const DrawerTitle = React.forwardRef(({ className, ...props }, ref) => (
  <DrawerPrimitive.Title
    ref={ref}
    data-slot="drawer-title"
    className={cn(
      "text-lg sm:text-xl font-semibold leading-tight",
      "text-primary-800 dark:text-primary-200",
      className
    )}
    {...props}
  />
));
DrawerTitle.displayName = DrawerPrimitive.Title.displayName;

// ---------- Drawer Description ----------
const DrawerDescription = React.forwardRef(({ className, ...props }, ref) => (
  <DrawerPrimitive.Description
    ref={ref}
    data-slot="drawer-description"
    className={cn(
      "text-xs sm:text-sm text-neutral-600 dark:text-neutral-400",
      "leading-relaxed",
      className
    )}
    {...props}
  />
));
DrawerDescription.displayName = DrawerPrimitive.Description.displayName;

// ---------- Drawer Nested ----------
const DrawerNestedRoot = React.forwardRef(
  ({ shouldScaleBackground = false, ...props }, ref) => (
    <DrawerPrimitive.NestedRoot
      ref={ref}
      shouldScaleBackground={shouldScaleBackground}
      {...props}
    />
  )
);
DrawerNestedRoot.displayName = "DrawerNestedRoot";

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  DrawerNestedRoot,
};
