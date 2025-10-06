"use client";

import * as React from "react";
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import { Check, ChevronRight, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------- Context Menu Root ----------
const ContextMenu = ContextMenuPrimitive.Root;

// ---------- Context Menu Trigger ----------
const ContextMenuTrigger = ContextMenuPrimitive.Trigger;

// ---------- Context Menu Group ----------
const ContextMenuGroup = ContextMenuPrimitive.Group;

// ---------- Context Menu Portal ----------
const ContextMenuPortal = ContextMenuPrimitive.Portal;

// ---------- Context Menu Sub ----------
const ContextMenuSub = ContextMenuPrimitive.Sub;

// ---------- Context Menu Radio Group ----------
const ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup;

// ---------- Context Menu Sub Trigger ----------
const ContextMenuSubTrigger = React.forwardRef(
  ({ className, inset, children, ...props }, ref) => (
    <ContextMenuPrimitive.SubTrigger
      ref={ref}
      data-slot="context-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "flex cursor-default select-none items-center gap-2.5",
        "rounded-md px-3 py-2 text-sm outline-none",
        "transition-colors duration-150",
        "motion-reduce:transition-none",
        // Default state
        "text-neutral-700 dark:text-neutral-300",
        // Focus/Hover state
        "focus:bg-primary-100 dark:focus:bg-primary-900/30",
        "focus:text-primary-900 dark:focus:text-primary-100",
        "data-[state=open]:bg-primary-100 dark:data-[state=open]:bg-primary-900/30",
        "data-[state=open]:text-primary-900 dark:data-[state=open]:text-primary-100",
        // Icon styling
        "[&_svg]:pointer-events-none [&_svg]:shrink-0",
        "[&_svg:not([class*='size-'])]:h-4 [&_svg:not([class*='size-'])]:w-4",
        data-inset && "pl-8",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRight className="ml-auto h-4 w-4" />
    </ContextMenuPrimitive.SubTrigger>
  )
);
ContextMenuSubTrigger.displayName = ContextMenuPrimitive.SubTrigger.displayName;

// ---------- Context Menu Sub Content ----------
const ContextMenuSubContent = React.forwardRef(
  ({ className, ...props }, ref) => (
    <ContextMenuPrimitive.SubContent
      ref={ref}
      data-slot="context-menu-sub-content"
      className={cn(
        "z-50 min-w-[12rem] overflow-hidden rounded-xl border p-1.5",
        "bg-white/98 backdrop-blur-xl border-neutral-200 shadow-xl",
        "dark:bg-neutral-900/98 dark:border-neutral-800",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[side=bottom]:slide-in-from-top-2",
        "data-[side=left]:slide-in-from-right-2",
        "data-[side=right]:slide-in-from-left-2",
        "data-[side=top]:slide-in-from-bottom-2",
        "origin-(--radix-context-menu-content-transform-origin)",
        "motion-reduce:animate-none",
        className
      )}
      {...props}
    />
  )
);
ContextMenuSubContent.displayName = ContextMenuPrimitive.SubContent.displayName;

// ---------- Context Menu Content ----------
const ContextMenuContent = React.forwardRef(
  ({ className, ...props }, ref) => (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Content
        ref={ref}
        data-slot="context-menu-content"
        className={cn(
          "z-50 min-w-[12rem] max-h-[var(--radix-context-menu-content-available-height)]",
          "overflow-hidden rounded-xl border p-1.5",
          "bg-white/98 backdrop-blur-xl border-neutral-200 shadow-xl",
          "dark:bg-neutral-900/98 dark:border-neutral-800",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[side=bottom]:slide-in-from-top-2",
          "data-[side=left]:slide-in-from-right-2",
          "data-[side=right]:slide-in-from-left-2",
          "data-[side=top]:slide-in-from-bottom-2",
          "origin-(--radix-context-menu-content-transform-origin)",
          "motion-reduce:animate-none",
          className
        )}
        {...props}
      />
    </ContextMenuPrimitive.Portal>
  )
);
ContextMenuContent.displayName = ContextMenuPrimitive.Content.displayName;

// ---------- Context Menu Item ----------
const ContextMenuItem = React.forwardRef(
  ({ className, inset, variant = "default", icon, shortcut, ...props }, ref) => (
    <ContextMenuPrimitive.Item
      ref={ref}
      data-slot="context-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "relative flex cursor-pointer select-none items-center gap-2.5",
        "rounded-md px-3 py-2 text-sm outline-none",
        "transition-colors duration-150",
        "motion-reduce:transition-none",
        // Default variant
        variant === "default" && [
          "text-neutral-700 dark:text-neutral-300",
          "focus:bg-primary-100 dark:focus:bg-primary-900/30",
          "focus:text-primary-900 dark:focus:text-primary-100",
        ],
        // Destructive variant
        variant === "destructive" && [
          "text-red-600 dark:text-red-400",
          "focus:bg-red-100 dark:focus:bg-red-900/30",
          "focus:text-red-700 dark:focus:text-red-300",
          "[&_svg]:text-red-600 dark:[&_svg]:text-red-400",
        ],
        // Success variant
        variant === "success" && [
          "text-green-600 dark:text-green-400",
          "focus:bg-green-100 dark:focus:bg-green-900/30",
          "focus:text-green-700 dark:focus:text-green-300",
        ],
        // Disabled state
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        // Icon styling
        "[&_svg]:pointer-events-none [&_svg]:shrink-0",
        "[&_svg:not([class*='size-'])]:h-4 [&_svg:not([class*='size-'])]:w-4",
        "[&_svg:not([class*='text-'])]:text-neutral-600 dark:[&_svg:not([class*='text-'])]:text-neutral-400",
        inset && "pl-8",
        className
      )}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="flex-1">{props.children}</span>
      {shortcut && <ContextMenuShortcut>{shortcut}</ContextMenuShortcut>}
    </ContextMenuPrimitive.Item>
  )
);
ContextMenuItem.displayName = ContextMenuPrimitive.Item.displayName;

// ---------- Context Menu Checkbox Item ----------
const ContextMenuCheckboxItem = React.forwardRef(
  ({ className, children, checked, ...props }, ref) => (
    <ContextMenuPrimitive.CheckboxItem
      ref={ref}
      data-slot="context-menu-checkbox-item"
      className={cn(
        "relative flex cursor-pointer select-none items-center gap-2.5",
        "rounded-md py-2 pl-8 pr-3 text-sm outline-none",
        "transition-colors duration-150",
        "motion-reduce:transition-none",
        "text-neutral-700 dark:text-neutral-300",
        "focus:bg-primary-100 dark:focus:bg-primary-900/30",
        "focus:text-primary-900 dark:focus:text-primary-100",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0",
        "[&_svg:not([class*='size-'])]:h-4 [&_svg:not([class*='size-'])]:w-4",
        className
      )}
      checked={checked}
      {...props}
    >
      <span className="absolute left-2.5 flex h-4 w-4 items-center justify-center">
        <ContextMenuPrimitive.ItemIndicator>
          <Check className="h-4 w-4 text-primary-700 dark:text-primary-400" strokeWidth={2.5} />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.CheckboxItem>
  )
);
ContextMenuCheckboxItem.displayName = ContextMenuPrimitive.CheckboxItem.displayName;

// ---------- Context Menu Radio Item ----------
const ContextMenuRadioItem = React.forwardRef(
  ({ className, children, ...props }, ref) => (
    <ContextMenuPrimitive.RadioItem
      ref={ref}
      data-slot="context-menu-radio-item"
      className={cn(
        "relative flex cursor-pointer select-none items-center gap-2.5",
        "rounded-md py-2 pl-8 pr-3 text-sm outline-none",
        "transition-colors duration-150",
        "motion-reduce:transition-none",
        "text-neutral-700 dark:text-neutral-300",
        "focus:bg-primary-100 dark:focus:bg-primary-900/30",
        "focus:text-primary-900 dark:focus:text-primary-100",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0",
        "[&_svg:not([class*='size-'])]:h-4 [&_svg:not([class*='size-'])]:w-4",
        className
      )}
      {...props}
    >
      <span className="absolute left-2.5 flex h-4 w-4 items-center justify-center">
        <ContextMenuPrimitive.ItemIndicator>
          <Circle className="h-2.5 w-2.5 fill-primary-700 dark:fill-primary-400" />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.RadioItem>
  )
);
ContextMenuRadioItem.displayName = ContextMenuPrimitive.RadioItem.displayName;

// ---------- Context Menu Label ----------
const ContextMenuLabel = React.forwardRef(
  ({ className, inset, ...props }, ref) => (
    <ContextMenuPrimitive.Label
      ref={ref}
      data-slot="context-menu-label"
      data-inset={inset}
      className={cn(
        "px-3 py-2 text-xs font-semibold uppercase tracking-wider",
        "text-neutral-600 dark:text-neutral-400",
        inset && "pl-8",
        className
      )}
      {...props}
    />
  )
);
ContextMenuLabel.displayName = ContextMenuPrimitive.Label.displayName;

// ---------- Context Menu Separator ----------
const ContextMenuSeparator = React.forwardRef(
  ({ className, ...props }, ref) => (
    <ContextMenuPrimitive.Separator
      ref={ref}
      data-slot="context-menu-separator"
      className={cn(
        "h-px bg-neutral-200 dark:bg-neutral-800 -mx-1 my-1.5",
        className
      )}
      {...props}
    />
  )
);
ContextMenuSeparator.displayName = ContextMenuPrimitive.Separator.displayName;

// ---------- Context Menu Shortcut ----------
const ContextMenuShortcut = React.forwardRef(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      data-slot="context-menu-shortcut"
      className={cn(
        "ml-auto text-xs font-medium tracking-wide",
        "text-neutral-500 dark:text-neutral-500",
        className
      )}
      {...props}
    />
  )
);
ContextMenuShortcut.displayName = "ContextMenuShortcut";

// ---------- Context Menu Description ----------
function ContextMenuDescription({ className, ...props }) {
  return (
    <div
      className={cn(
        "px-3 py-2 text-xs text-neutral-600 dark:text-neutral-400",
        "leading-relaxed",
        className
      )}
      {...props}
    />
  );
}

// ---------- Keyboard Key Display ----------
function ContextMenuKey({ children, className, ...props }) {
  return (
    <kbd
      className={cn(
        "pointer-events-none inline-flex h-5 select-none items-center gap-1",
        "rounded border border-neutral-200 dark:border-neutral-700",
        "bg-neutral-100 dark:bg-neutral-800",
        "px-1.5 font-mono text-[10px] font-medium",
        "text-neutral-600 dark:text-neutral-400",
        className
      )}
      {...props}
    >
      {children}
    </kbd>
  );
}

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
  ContextMenuDescription,
  ContextMenuKey,
};
