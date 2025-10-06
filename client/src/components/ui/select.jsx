"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp, Loader2, AlertCircle } from "lucide-react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

// ---------- Select Root ----------
const Select = SelectPrimitive.Root;

// ---------- Select Group ----------
const SelectGroup = SelectPrimitive.Group;

// ---------- Select Value ----------
const SelectValue = SelectPrimitive.Value;

// ---------- Select Trigger Variants ----------
const selectTriggerVariants = cva(
  "flex w-full items-center justify-between gap-2 rounded-lg border text-sm transition-all duration-200 outline-none disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: `
          border-neutral-300 bg-white
          hover:border-neutral-400
          focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30
          data-[placeholder]:text-neutral-500
          aria-invalid:border-red-500 aria-invalid:ring-2 aria-invalid:ring-red-500/30
          dark:border-neutral-700 dark:bg-neutral-900
          dark:hover:border-neutral-600
          dark:focus:border-primary-500
          dark:data-[placeholder]:text-neutral-500
        `,
        filled: `
          border-transparent bg-neutral-100
          hover:bg-neutral-200
          focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30 focus:bg-white
          data-[placeholder]:text-neutral-500
          dark:bg-neutral-800
          dark:hover:bg-neutral-700
          dark:focus:bg-neutral-900
        `,
        outlined: `
          border-2 border-neutral-300 bg-white
          hover:border-neutral-400
          focus:border-primary-700 focus:ring-2 focus:ring-primary-500/30
          data-[placeholder]:text-neutral-500
          dark:border-neutral-700 dark:bg-neutral-900
          dark:hover:border-neutral-600
          dark:focus:border-primary-500
        `,
      },
      size: {
        sm: "h-9 px-3 py-1.5 text-sm [&_svg:not([class*='size-'])]:h-4 [&_svg:not([class*='size-'])]:w-4",
        default: "h-10 px-4 py-2 [&_svg:not([class*='size-'])]:h-4 [&_svg:not([class*='size-'])]:w-4",
        lg: "h-12 px-5 py-3 text-base [&_svg:not([class*='size-'])]:h-5 [&_svg:not([class*='size-'])]:w-5",
      },
      state: {
        default: "",
        error: "border-red-500 focus:border-red-500 focus:ring-red-500/30",
        success: "border-green-500 focus:border-green-500 focus:ring-green-500/30",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      state: "default",
    },
  }
);

// ---------- Select Trigger ----------
const SelectTrigger = React.forwardRef(
  (
    {
      className,
      children,
      variant,
      size,
      state,
      isLoading,
      leftIcon,
      ...props
    },
    ref
  ) => (
    <SelectPrimitive.Trigger
      ref={ref}
      data-slot="select-trigger"
      className={cn(
        selectTriggerVariants({ variant, size, state }),
        leftIcon && "pl-10",
        className
      )}
      {...props}
    >
      {leftIcon && (
        <span className="absolute left-3 text-neutral-600 dark:text-neutral-400">
          {leftIcon}
        </span>
      )}
      <div className="flex-1 text-left truncate">
        {children}
      </div>
      <SelectPrimitive.Icon asChild>
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-neutral-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-neutral-500" />
        )}
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
);
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

// ---------- Select Content ----------
const SelectContent = React.forwardRef(
  (
    {
      className,
      children,
      position = "popper",
      variant = "default",
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
      solid: `
        bg-white border-neutral-200 shadow-lg
        dark:bg-neutral-900 dark:border-neutral-800
      `,
    };

    return (
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          ref={ref}
          data-slot="select-content"
          className={cn(
            "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-xl border",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[side=bottom]:slide-in-from-top-2",
            "data-[side=left]:slide-in-from-right-2",
            "data-[side=right]:slide-in-from-left-2",
            "data-[side=top]:slide-in-from-bottom-2",
            "origin-(--radix-select-content-transform-origin)",
            "motion-reduce:animate-none",
            position === "popper" && [
              "data-[side=bottom]:translate-y-1",
              "data-[side=left]:-translate-x-1",
              "data-[side=right]:translate-x-1",
              "data-[side=top]:-translate-y-1",
            ],
            variantClasses[variant],
            className
          )}
          position={position}
          {...props}
        >
          <SelectScrollUpButton />
          <SelectPrimitive.Viewport
            className={cn(
              "p-1.5",
              position === "popper" &&
                "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
            )}
          >
            {children}
          </SelectPrimitive.Viewport>
          <SelectScrollDownButton />
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    );
  }
);
SelectContent.displayName = SelectPrimitive.Content.displayName;

// ---------- Select Label ----------
const SelectLabel = React.forwardRef(
  ({ className, ...props }, ref) => (
    <SelectPrimitive.Label
      ref={ref}
      data-slot="select-label"
      className={cn(
        "px-3 py-2 text-xs font-semibold uppercase tracking-wider",
        "text-neutral-600 dark:text-neutral-400",
        className
      )}
      {...props}
    />
  )
);
SelectLabel.displayName = SelectPrimitive.Label.displayName;

// ---------- Select Item ----------
const SelectItem = React.forwardRef(
  ({ className, children, icon, ...props }, ref) => (
    <SelectPrimitive.Item
      ref={ref}
      data-slot="select-item"
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center gap-2.5",
        "rounded-md py-2 pl-3 pr-8 text-sm outline-none",
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
      {icon && (
        <span className="flex-shrink-0 text-neutral-600 dark:text-neutral-400">
          {icon}
        </span>
      )}
      <SelectPrimitive.ItemText className="flex-1">
        {children}
      </SelectPrimitive.ItemText>
      <span className="absolute right-2.5 flex h-4 w-4 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="h-4 w-4 text-primary-700 dark:text-primary-400" strokeWidth={2.5} />
        </SelectPrimitive.ItemIndicator>
      </span>
    </SelectPrimitive.Item>
  )
);
SelectItem.displayName = SelectPrimitive.Item.displayName;

// ---------- Select Separator ----------
const SelectSeparator = React.forwardRef(
  ({ className, ...props }, ref) => (
    <SelectPrimitive.Separator
      ref={ref}
      data-slot="select-separator"
      className={cn(
        "h-px bg-neutral-200 dark:bg-neutral-800 -mx-1 my-1.5",
        className
      )}
      {...props}
    />
  )
);
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

// ---------- Select Scroll Up Button ----------
const SelectScrollUpButton = React.forwardRef(
  ({ className, ...props }, ref) => (
    <SelectPrimitive.ScrollUpButton
      ref={ref}
      data-slot="select-scroll-up-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        "text-neutral-600 dark:text-neutral-400",
        className
      )}
      {...props}
    >
      <ChevronUp className="h-4 w-4" />
    </SelectPrimitive.ScrollUpButton>
  )
);
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

// ---------- Select Scroll Down Button ----------
const SelectScrollDownButton = React.forwardRef(
  ({ className, ...props }, ref) => (
    <SelectPrimitive.ScrollDownButton
      ref={ref}
      data-slot="select-scroll-down-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        "text-neutral-600 dark:text-neutral-400",
        className
      )}
      {...props}
    >
      <ChevronDown className="h-4 w-4" />
    </SelectPrimitive.ScrollDownButton>
  )
);
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;

// ---------- Select Label (Form) ----------
const SelectFormLabel = React.forwardRef(
  ({ className, required, optional, children, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "text-sm font-semibold text-neutral-800 dark:text-neutral-200",
        "mb-2 block",
        className
      )}
      {...props}
    >
      {children}
      {required && (
        <span className="ml-1 text-red-600 dark:text-red-400" aria-label="required">
          *
        </span>
      )}
      {optional && (
        <span className="ml-1.5 text-xs font-normal text-neutral-500 dark:text-neutral-400">
          (optional)
        </span>
      )}
    </label>
  )
);
SelectFormLabel.displayName = "SelectFormLabel";

// ---------- Select Description ----------
const SelectDescription = React.forwardRef(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(
        "text-xs text-neutral-600 dark:text-neutral-400",
        "mt-1.5 leading-relaxed",
        className
      )}
      {...props}
    />
  )
);
SelectDescription.displayName = "SelectDescription";

// ---------- Select Error ----------
const SelectError = React.forwardRef(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(
        "text-xs font-medium text-red-600 dark:text-red-400",
        "mt-1.5 flex items-start gap-1",
        className
      )}
      role="alert"
      {...props}
    >
      <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
      <span>{props.children}</span>
    </p>
  )
);
SelectError.displayName = "SelectError";

// ---------- Select Container ----------
const SelectContainer = React.forwardRef(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("space-y-2 w-full", className)}
      {...props}
    />
  )
);
SelectContainer.displayName = "SelectContainer";

// ---------- Select With Label ----------
const SelectWithLabel = React.forwardRef(
  (
    {
      label,
      description,
      error,
      required,
      optional,
      className,
      containerClassName,
      children,
      ...props
    },
    ref
  ) => (
    <SelectContainer className={containerClassName}>
      {label && (
        <SelectFormLabel required={required} optional={optional}>
          {label}
        </SelectFormLabel>
      )}
      <Select {...props}>
        {children}
      </Select>
      {description && !error && (
        <SelectDescription>{description}</SelectDescription>
      )}
      {error && <SelectError>{error}</SelectError>}
    </SelectContainer>
  )
);
SelectWithLabel.displayName = "SelectWithLabel";

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
  SelectFormLabel,
  SelectDescription,
  SelectError,
  SelectContainer,
  SelectWithLabel,
  selectTriggerVariants,
};
