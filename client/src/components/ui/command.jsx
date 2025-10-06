"use client";

import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";
import { Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ---------- Command Root ----------
const Command = React.forwardRef(
  ({ className, variant = "default", ...props }, ref) => {
    const variantClasses = {
      default: `
        bg-white text-neutral-900
        dark:bg-neutral-900 dark:text-neutral-100
      `,
      glass: `
        bg-white/95 backdrop-blur-xl text-neutral-900
        dark:bg-neutral-900/95 dark:text-neutral-100
      `,
      elevated: `
        bg-gradient-to-br from-white to-neutral-50/90 text-neutral-900
        dark:from-neutral-900 dark:to-neutral-800/90 dark:text-neutral-100
      `,
    };

    return (
      <CommandPrimitive
        ref={ref}
        data-slot="command"
        className={cn(
          "flex h-full w-full flex-col overflow-hidden rounded-xl",
          variantClasses[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Command.displayName = CommandPrimitive.displayName;

// ---------- Command Dialog ----------
function CommandDialog({
  title = "Command Menu",
  description = "Type a command or search...",
  children,
  className,
  showCloseButton = true,
  variant = "default",
  size = "default",
  ...props
}) {
  return (
    <Dialog {...props}>
      <DialogHeader className="sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent
        className={cn("overflow-hidden p-0 shadow-2xl", className)}
        showCloseButton={showCloseButton}
        size={size}
      >
        <Command
          variant={variant}
          className={cn(
            "[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2",
            "[&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold",
            "[&_[cmdk-group-heading]]:text-neutral-600 dark:[&_[cmdk-group-heading]]:text-neutral-400",
            "[&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider",
            "[&_[cmdk-group]]:px-2",
            "[&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0",
            "[&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5",
            "[&_[cmdk-input]]:h-12",
            "[&_[cmdk-item]]:px-3 [&_[cmdk-item]]:py-3",
            "[&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5"
          )}
        >
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Command Input ----------
const CommandInput = React.forwardRef(
  ({ className, isLoading, ...props }, ref) => (
    <div
      data-slot="command-input-wrapper"
      className={cn(
        "flex h-12 items-center gap-3 border-b border-neutral-200 dark:border-neutral-800 px-4",
        "bg-neutral-50/50 dark:bg-neutral-900/50"
      )}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-neutral-500 dark:text-neutral-400" />
      ) : (
        <Search className="h-4 w-4 shrink-0 text-neutral-500 dark:text-neutral-400" />
      )}
      <CommandPrimitive.Input
        ref={ref}
        data-slot="command-input"
        className={cn(
          "flex h-11 w-full bg-transparent py-3 text-sm outline-none",
          "placeholder:text-neutral-500 dark:placeholder:text-neutral-400",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "text-neutral-900 dark:text-neutral-100",
          className
        )}
        {...props}
      />
    </div>
  )
);
CommandInput.displayName = CommandPrimitive.Input.displayName;

// ---------- Command List ----------
const CommandList = React.forwardRef(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    data-slot="command-list"
    className={cn(
      "max-h-[300px] overflow-y-auto overflow-x-hidden scroll-py-2",
      "scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700",
      "scrollbar-track-transparent",
      className
    )}
    {...props}
  />
));
CommandList.displayName = CommandPrimitive.List.displayName;

// ---------- Command Empty ----------
const CommandEmpty = React.forwardRef(({ className, children, ...props }, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    data-slot="command-empty"
    className={cn(
      "py-8 text-center text-sm",
      "text-neutral-600 dark:text-neutral-400",
      className
    )}
    {...props}
  >
    {children || (
      <div className="flex flex-col items-center gap-2">
        <div className="h-10 w-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
          <Search className="h-5 w-5 text-neutral-400 dark:text-neutral-600" />
        </div>
        <p>No results found.</p>
      </div>
    )}
  </CommandPrimitive.Empty>
));
CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

// ---------- Command Group ----------
const CommandGroup = React.forwardRef(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    data-slot="command-group"
    className={cn(
      "overflow-hidden p-2 text-neutral-900 dark:text-neutral-100",
      "[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2",
      "[&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold",
      "[&_[cmdk-group-heading]]:text-neutral-600 dark:[&_[cmdk-group-heading]]:text-neutral-400",
      "[&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider",
      className
    )}
    {...props}
  />
));
CommandGroup.displayName = CommandPrimitive.Group.displayName;

// ---------- Command Separator ----------
const CommandSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    data-slot="command-separator"
    className={cn(
      "h-px bg-neutral-200 dark:bg-neutral-800 -mx-1 my-1",
      className
    )}
    {...props}
  />
));
CommandSeparator.displayName = CommandPrimitive.Separator.displayName;

// ---------- Command Item ----------
const CommandItem = React.forwardRef(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    data-slot="command-item"
    className={cn(
      "relative flex cursor-pointer select-none items-center gap-3",
      "rounded-lg px-3 py-2.5 text-sm outline-none",
      "transition-colors duration-150",
      "motion-reduce:transition-none",
      // Default state
      "text-neutral-700 dark:text-neutral-300",
      // Hover/Selected state
      "data-[selected=true]:bg-primary-100 dark:data-[selected=true]:bg-primary-900/30",
      "data-[selected=true]:text-primary-900 dark:data-[selected=true]:text-primary-100",
      // Disabled state
      "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
      // Icon styling
      "[&_svg]:pointer-events-none [&_svg]:shrink-0",
      "[&_svg:not([class*='size-'])]:h-4 [&_svg:not([class*='size-'])]:w-4",
      "[&_svg:not([class*='text-'])]:text-neutral-600 dark:[&_svg:not([class*='text-'])]:text-neutral-400",
      "data-[selected=true]:[&_svg:not([class*='text-'])]:text-primary-700 dark:data-[selected=true]:[&_svg:not([class*='text-'])]:text-primary-300",
      className
    )}
    {...props}
  />
));
CommandItem.displayName = CommandPrimitive.Item.displayName;

// ---------- Command Shortcut ----------
const CommandShortcut = React.forwardRef(({ className, ...props }, ref) => (
  <span
    ref={ref}
    data-slot="command-shortcut"
    className={cn(
      "ml-auto text-xs font-medium tracking-wide",
      "text-neutral-500 dark:text-neutral-500",
      "flex items-center gap-1",
      className
    )}
    {...props}
  />
));
CommandShortcut.displayName = "CommandShortcut";

// ---------- Command Loading ----------
function CommandLoading({ className, children, ...props }) {
  return (
    <div
      data-slot="command-loading"
      className={cn(
        "flex items-center justify-center py-8",
        "text-sm text-neutral-600 dark:text-neutral-400",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>{children || "Loading..."}</span>
      </div>
    </div>
  );
}

// ---------- Command Item with Icon ----------
function CommandItemWithIcon({
  icon,
  label,
  description,
  shortcut,
  badge,
  className,
  ...props
}) {
  return (
    <CommandItem className={cn("justify-between", className)} {...props}>
      <div className="flex items-center gap-3 flex-1 min-w-0">
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
        {shortcut && <CommandShortcut>{shortcut}</CommandShortcut>}
      </div>
    </CommandItem>
  );
}

// ---------- Keyboard Key Display ----------
function CommandKey({ children, className, ...props }) {
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
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
  CommandLoading,
  CommandItemWithIcon,
  CommandKey,
};
