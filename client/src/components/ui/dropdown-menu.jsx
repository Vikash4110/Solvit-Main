"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Check, ChevronRight, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------- Dropdown Menu Root ----------
const DropdownMenu = DropdownMenuPrimitive.Root;

// ---------- Dropdown Menu Trigger ----------
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

// ---------- Dropdown Menu Portal ----------
const DropdownMenuPortal = DropdownMenuPrimitive.Portal;

// ---------- Dropdown Menu Group ----------
const DropdownMenuGroup = DropdownMenuPrimitive.Group;

// ---------- Dropdown Menu Sub ----------
const DropdownMenuSub = DropdownMenuPrimitive.Sub;

// ---------- Dropdown Menu Radio Group ----------
const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

// ---------- Dropdown Menu Content ----------
const DropdownMenuContent = React.forwardRef(
  ({ className, sideOffset = 4, variant = "default", ...props }, ref) => {
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
        backdrop-blur-lg border-neutral-200/60 shadow-xl
        dark:from-neutral-900 dark:to-neutral-800/90
        dark:border-neutral-800/60
      `,
    };

    return (
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          ref={ref}
          data-slot="dropdown-menu-content"
          sideOffset={sideOffset}
          className={cn(
            "z-50 min-w-[12rem] max-h-[var(--radix-dropdown-menu-content-available-height)]",
            "overflow-hidden rounded-xl border p-1.5",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[side=bottom]:slide-in-from-top-2",
            "data-[side=left]:slide-in-from-right-2",
            "data-[side=right]:slide-in-from-left-2",
            "data-[side=top]:slide-in-from-bottom-2",
            "origin-(--radix-dropdown-menu-content-transform-origin)",
            "motion-reduce:animate-none",
            variantClasses[variant],
            className
          )}
          {...props}
        />
      </DropdownMenuPrimitive.Portal>
    );
  }
);
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

// ---------- Dropdown Menu Item ----------
const DropdownMenuItem = React.forwardRef(
  ({ className, inset, variant = "default", icon, shortcut, ...props }, ref) => (
    <DropdownMenuPrimitive.Item
      ref={ref}
      data-slot="dropdown-menu-item"
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
      {shortcut && <DropdownMenuShortcut>{shortcut}</DropdownMenuShortcut>}
    </DropdownMenuPrimitive.Item>
  )
);
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

// ---------- Dropdown Menu Checkbox Item ----------
const DropdownMenuCheckboxItem = React.forwardRef(
  ({ className, children, checked, ...props }, ref) => (
    <DropdownMenuPrimitive.CheckboxItem
      ref={ref}
      data-slot="dropdown-menu-checkbox-item"
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
        <DropdownMenuPrimitive.ItemIndicator>
          <Check className="h-4 w-4 text-primary-700 dark:text-primary-400" strokeWidth={2.5} />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  )
);
DropdownMenuCheckboxItem.displayName = DropdownMenuPrimitive.CheckboxItem.displayName;

// ---------- Dropdown Menu Radio Item ----------
const DropdownMenuRadioItem = React.forwardRef(
  ({ className, children, ...props }, ref) => (
    <DropdownMenuPrimitive.RadioItem
      ref={ref}
      data-slot="dropdown-menu-radio-item"
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
        <DropdownMenuPrimitive.ItemIndicator>
          <Circle className="h-2.5 w-2.5 fill-primary-700 dark:fill-primary-400" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  )
);
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;

// ---------- Dropdown Menu Label ----------
const DropdownMenuLabel = React.forwardRef(
  ({ className, inset, ...props }, ref) => (
    <DropdownMenuPrimitive.Label
      ref={ref}
      data-slot="dropdown-menu-label"
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
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;

// ---------- Dropdown Menu Separator ----------
const DropdownMenuSeparator = React.forwardRef(
  ({ className, ...props }, ref) => (
    <DropdownMenuPrimitive.Separator
      ref={ref}
      data-slot="dropdown-menu-separator"
      className={cn(
        "h-px bg-neutral-200 dark:bg-neutral-800 -mx-1 my-1.5",
        className
      )}
      {...props}
    />
  )
);
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

// ---------- Dropdown Menu Shortcut ----------
const DropdownMenuShortcut = React.forwardRef(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      data-slot="dropdown-menu-shortcut"
      className={cn(
        "ml-auto text-xs font-medium tracking-wide",
        "text-neutral-500 dark:text-neutral-500",
        className
      )}
      {...props}
    />
  )
);
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";

// ---------- Dropdown Menu Sub Trigger ----------
const DropdownMenuSubTrigger = React.forwardRef(
  ({ className, inset, children, ...props }, ref) => (
    <DropdownMenuPrimitive.SubTrigger
      ref={ref}
      data-slot="dropdown-menu-sub-trigger"
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
    </DropdownMenuPrimitive.SubTrigger>
  )
);
DropdownMenuSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName;

// ---------- Dropdown Menu Sub Content ----------
const DropdownMenuSubContent = React.forwardRef(
  ({ className, ...props }, ref) => (
    <DropdownMenuPrimitive.SubContent
      ref={ref}
      data-slot="dropdown-menu-sub-content"
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
        "origin-(--radix-dropdown-menu-content-transform-origin)",
        "motion-reduce:animate-none",
        className
      )}
      {...props}
    />
  )
);
DropdownMenuSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName;

// ---------- Dropdown Menu Description ----------
function DropdownMenuDescription({ className, ...props }) {
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
function DropdownMenuKey({ children, className, ...props }) {
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

// ---------- Dropdown Menu Item with Icon ----------
function DropdownMenuItemWithIcon({
  icon,
  label,
  description,
  shortcut,
  badge,
  variant = "default",
  className,
  ...props
}) {
  return (
    <DropdownMenuItem variant={variant} className={cn("justify-between", className)} {...props}>
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        {icon && <div className="flex-shrink-0">{icon}</div>}
        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
          <span className="font-medium">{label}</span>
          {description && (
            <span className="text-xs text-neutral-600 dark:text-neutral-400 truncate">
              {description}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {badge && (
          <span className="px-2 py-0.5 text-xs rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium">
            {badge}
          </span>
        )}
        {shortcut && <DropdownMenuShortcut>{shortcut}</DropdownMenuShortcut>}
      </div>
    </DropdownMenuItem>
  );
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuDescription,
  DropdownMenuKey,
  DropdownMenuItemWithIcon,
};
