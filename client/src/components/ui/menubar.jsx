"use client";

import * as React from "react";
import * as MenubarPrimitive from "@radix-ui/react-menubar";
import { Check, ChevronRight, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------- Menubar Root ----------
const Menubar = React.forwardRef(
  ({ className, variant = "default", ...props }, ref) => {
    const variantClasses = {
      default: `
        bg-white/95 backdrop-blur-md border-neutral-200 shadow-sm
        dark:bg-neutral-900/95 dark:border-neutral-800
      `,
      glass: `
        bg-white/20 backdrop-blur-xl border-white/30 shadow-lg
        dark:bg-neutral-900/20 dark:border-neutral-800/30
      `,
      elevated: `
        bg-gradient-to-br from-white to-neutral-50/90
        backdrop-blur-lg border-neutral-200/60 shadow-md
        dark:from-neutral-900 dark:to-neutral-800/90
        dark:border-neutral-800/60
      `,
      minimal: `
        bg-transparent border-transparent
      `,
    };

    return (
      <MenubarPrimitive.Root
        ref={ref}
        data-slot="menubar"
        className={cn(
          "flex h-10 items-center gap-1 rounded-xl border p-1.5",
          variantClasses[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Menubar.displayName = MenubarPrimitive.Root.displayName;

// ---------- Menubar Menu ----------
const MenubarMenu = MenubarPrimitive.Menu;

// ---------- Menubar Group ----------
const MenubarGroup = MenubarPrimitive.Group;

// ---------- Menubar Portal ----------
const MenubarPortal = MenubarPrimitive.Portal;

// ---------- Menubar Radio Group ----------
const MenubarRadioGroup = MenubarPrimitive.RadioGroup;

// ---------- Menubar Sub ----------
const MenubarSub = MenubarPrimitive.Sub;

// ---------- Menubar Trigger ----------
const MenubarTrigger = React.forwardRef(
  ({ className, ...props }, ref) => (
    <MenubarPrimitive.Trigger
      ref={ref}
      data-slot="menubar-trigger"
      className={cn(
        "flex items-center rounded-lg px-3 py-1.5 text-sm font-medium outline-none select-none",
        "transition-colors duration-150",
        "motion-reduce:transition-none",
        "text-neutral-700 dark:text-neutral-300",
        "hover:bg-neutral-100 dark:hover:bg-neutral-800",
        "focus:bg-primary-100 dark:focus:bg-primary-900/30",
        "focus:text-primary-900 dark:focus:text-primary-100",
        "data-[state=open]:bg-primary-100 dark:data-[state=open]:bg-primary-900/30",
        "data-[state=open]:text-primary-900 dark:data-[state=open]:text-primary-100",
        className
      )}
      {...props}
    />
  )
);
MenubarTrigger.displayName = MenubarPrimitive.Trigger.displayName;

// ---------- Menubar Content ----------
const MenubarContent = React.forwardRef(
  (
    {
      className,
      align = "start",
      alignOffset = -4,
      sideOffset = 8,
      ...props
    },
    ref
  ) => (
    <MenubarPortal>
      <MenubarPrimitive.Content
        ref={ref}
        data-slot="menubar-content"
        align={align}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
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
          "origin-(--radix-menubar-content-transform-origin)",
          "motion-reduce:animate-none",
          className
        )}
        {...props}
      />
    </MenubarPortal>
  )
);
MenubarContent.displayName = MenubarPrimitive.Content.displayName;

// ---------- Menubar Item ----------
const MenubarItem = React.forwardRef(
  ({ className, inset, variant = "default", icon, shortcut, ...props }, ref) => (
    <MenubarPrimitive.Item
      ref={ref}
      data-slot="menubar-item"
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
      {shortcut && <MenubarShortcut>{shortcut}</MenubarShortcut>}
    </MenubarPrimitive.Item>
  )
);
MenubarItem.displayName = MenubarPrimitive.Item.displayName;

// ---------- Menubar Checkbox Item ----------
const MenubarCheckboxItem = React.forwardRef(
  ({ className, children, checked, ...props }, ref) => (
    <MenubarPrimitive.CheckboxItem
      ref={ref}
      data-slot="menubar-checkbox-item"
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
        <MenubarPrimitive.ItemIndicator>
          <Check className="h-4 w-4 text-primary-700 dark:text-primary-400" strokeWidth={2.5} />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.CheckboxItem>
  )
);
MenubarCheckboxItem.displayName = MenubarPrimitive.CheckboxItem.displayName;

// ---------- Menubar Radio Item ----------
const MenubarRadioItem = React.forwardRef(
  ({ className, children, ...props }, ref) => (
    <MenubarPrimitive.RadioItem
      ref={ref}
      data-slot="menubar-radio-item"
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
        <MenubarPrimitive.ItemIndicator>
          <Circle className="h-2.5 w-2.5 fill-primary-700 dark:fill-primary-400" />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.RadioItem>
  )
);
MenubarRadioItem.displayName = MenubarPrimitive.RadioItem.displayName;

// ---------- Menubar Label ----------
const MenubarLabel = React.forwardRef(
  ({ className, inset, ...props }, ref) => (
    <MenubarPrimitive.Label
      ref={ref}
      data-slot="menubar-label"
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
MenubarLabel.displayName = MenubarPrimitive.Label.displayName;

// ---------- Menubar Separator ----------
const MenubarSeparator = React.forwardRef(
  ({ className, ...props }, ref) => (
    <MenubarPrimitive.Separator
      ref={ref}
      data-slot="menubar-separator"
      className={cn(
        "h-px bg-neutral-200 dark:bg-neutral-800 -mx-1 my-1.5",
        className
      )}
      {...props}
    />
  )
);
MenubarSeparator.displayName = MenubarPrimitive.Separator.displayName;

// ---------- Menubar Shortcut ----------
const MenubarShortcut = React.forwardRef(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      data-slot="menubar-shortcut"
      className={cn(
        "ml-auto text-xs font-medium tracking-wide",
        "text-neutral-500 dark:text-neutral-500",
        className
      )}
      {...props}
    />
  )
);
MenubarShortcut.displayName = "MenubarShortcut";

// ---------- Menubar Sub Trigger ----------
const MenubarSubTrigger = React.forwardRef(
  ({ className, inset, children, ...props }, ref) => (
    <MenubarPrimitive.SubTrigger
      ref={ref}
      data-slot="menubar-sub-trigger"
      data-inset={inset}
      className={cn(
        "flex cursor-pointer select-none items-center gap-2.5",
        "rounded-md px-3 py-2 text-sm outline-none",
        "transition-colors duration-150",
        "motion-reduce:transition-none",
        "text-neutral-700 dark:text-neutral-300",
        "focus:bg-primary-100 dark:focus:bg-primary-900/30",
        "focus:text-primary-900 dark:focus:text-primary-100",
        "data-[state=open]:bg-primary-100 dark:data-[state=open]:bg-primary-900/30",
        "data-[state=open]:text-primary-900 dark:data-[state=open]:text-primary-100",
        inset && "pl-8",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRight className="ml-auto h-4 w-4" />
    </MenubarPrimitive.SubTrigger>
  )
);
MenubarSubTrigger.displayName = MenubarPrimitive.SubTrigger.displayName;

// ---------- Menubar Sub Content ----------
const MenubarSubContent = React.forwardRef(
  ({ className, ...props }, ref) => (
    <MenubarPrimitive.SubContent
      ref={ref}
      data-slot="menubar-sub-content"
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
        "origin-(--radix-menubar-content-transform-origin)",
        "motion-reduce:animate-none",
        className
      )}
      {...props}
    />
  )
);
MenubarSubContent.displayName = MenubarPrimitive.SubContent.displayName;

// ---------- Keyboard Key Display ----------
function MenubarKey({ children, className, ...props }) {
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
  Menubar,
  MenubarPortal,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarGroup,
  MenubarSeparator,
  MenubarLabel,
  MenubarItem,
  MenubarShortcut,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
  MenubarKey,
};
