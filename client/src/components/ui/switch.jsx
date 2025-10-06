"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cva } from "class-variance-authority";
import { Check, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------- Switch Variants ----------
const switchVariants = cva(
  "peer inline-flex shrink-0 items-center rounded-full border-2 border-transparent shadow-sm transition-all duration-200 outline-none motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: `
          data-[state=unchecked]:bg-neutral-200
          data-[state=checked]:bg-primary-700
          dark:data-[state=unchecked]:bg-neutral-800
          dark:data-[state=checked]:bg-primary-600
          focus-visible:ring-2 focus-visible:ring-primary-500/30
        `,
        primary: `
          data-[state=unchecked]:bg-neutral-200
          data-[state=checked]:bg-primary-700
          dark:data-[state=unchecked]:bg-neutral-800
          dark:data-[state=checked]:bg-primary-600
          focus-visible:ring-2 focus-visible:ring-primary-500/30
        `,
        success: `
          data-[state=unchecked]:bg-neutral-200
          data-[state=checked]:bg-green-600
          dark:data-[state=unchecked]:bg-neutral-800
          dark:data-[state=checked]:bg-green-500
          focus-visible:ring-2 focus-visible:ring-green-500/30
        `,
        destructive: `
          data-[state=unchecked]:bg-neutral-200
          data-[state=checked]:bg-red-600
          dark:data-[state=unchecked]:bg-neutral-800
          dark:data-[state=checked]:bg-red-500
          focus-visible:ring-2 focus-visible:ring-red-500/30
        `,
        warning: `
          data-[state=unchecked]:bg-neutral-200
          data-[state=checked]:bg-yellow-600
          dark:data-[state=unchecked]:bg-neutral-800
          dark:data-[state=checked]:bg-yellow-500
          focus-visible:ring-2 focus-visible:ring-yellow-500/30
        `,
      },
      size: {
        sm: "h-5 w-9",
        default: "h-6 w-11",
        lg: "h-7 w-14",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const switchThumbVariants = cva(
  "pointer-events-none block rounded-full bg-white shadow-md ring-0 transition-transform duration-200 motion-reduce:transition-none",
  {
    variants: {
      size: {
        sm: "h-4 w-4 data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0",
        default: "h-5 w-5 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0",
        lg: "h-6 w-6 data-[state=checked]:translate-x-7 data-[state=unchecked]:translate-x-0",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

// ---------- Switch Component ----------
const Switch = React.forwardRef(
  (
    {
      className,
      variant = "default",
      size = "default",
      showIcons = false,
      isLoading = false,
      ...props
    },
    ref
  ) => {
    const iconSize = {
      sm: "h-2.5 w-2.5",
      default: "h-3 w-3",
      lg: "h-3.5 w-3.5",
    }[size];

    return (
      <SwitchPrimitive.Root
        ref={ref}
        data-slot="switch"
        disabled={isLoading || props.disabled}
        className={cn(switchVariants({ variant, size }), className)}
        {...props}
      >
        <SwitchPrimitive.Thumb
          data-slot="switch-thumb"
          className={cn(
            switchThumbVariants({ size }),
            "flex items-center justify-center"
          )}
        >
          {isLoading ? (
            <Loader2 className={cn(iconSize, "animate-spin text-neutral-600")} />
          ) : showIcons ? (
            <span className="data-[state=checked]:block data-[state=unchecked]:hidden">
              <Check className={cn(iconSize, "text-primary-700 dark:text-primary-600")} strokeWidth={3} />
            </span>
          ) : null}
        </SwitchPrimitive.Thumb>
      </SwitchPrimitive.Root>
    );
  }
);
Switch.displayName = SwitchPrimitive.Root.displayName;

// ---------- Switch Label ----------
const SwitchLabel = React.forwardRef(
  ({ className, required, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "text-sm font-medium leading-tight cursor-pointer",
        "text-neutral-800 dark:text-neutral-200",
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    >
      {props.children}
      {required && (
        <span className="ml-1 text-red-600 dark:text-red-400" aria-label="required">
          *
        </span>
      )}
    </label>
  )
);
SwitchLabel.displayName = "SwitchLabel";

// ---------- Switch Description ----------
const SwitchDescription = React.forwardRef(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(
        "text-xs text-neutral-600 dark:text-neutral-400",
        "leading-relaxed",
        className
      )}
      {...props}
    />
  )
);
SwitchDescription.displayName = "SwitchDescription";

// ---------- Switch With Label ----------
const SwitchWithLabel = React.forwardRef(
  (
    {
      label,
      description,
      labelPosition = "right",
      className,
      containerClassName,
      required,
      ...props
    },
    ref
  ) => {
    const id = React.useId();
    const switchId = props.id || id;

    const switchElement = <Switch ref={ref} id={switchId} {...props} />;

    return (
      <div
        className={cn(
          "flex items-start gap-3",
          labelPosition === "left" && "flex-row-reverse justify-end",
          containerClassName
        )}
      >
        {switchElement}
        <div className="flex flex-col gap-1 flex-1">
          <SwitchLabel htmlFor={switchId} required={required}>
            {label}
          </SwitchLabel>
          {description && (
            <SwitchDescription>{description}</SwitchDescription>
          )}
        </div>
      </div>
    );
  }
);
SwitchWithLabel.displayName = "SwitchWithLabel";

// ---------- Switch Card ----------
const SwitchCard = React.forwardRef(
  (
    {
      label,
      description,
      icon,
      badge,
      className,
      checked,
      ...props
    },
    ref
  ) => {
    const id = React.useId();
    const switchId = props.id || id;

    return (
      <label
        htmlFor={switchId}
        className={cn(
          "relative flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer",
          "transition-all duration-200",
          "motion-reduce:transition-none",
          checked
            ? "bg-primary-50 border-primary-700 dark:bg-primary-950/30 dark:border-primary-600"
            : "bg-white border-neutral-200 hover:border-neutral-300 dark:bg-neutral-900 dark:border-neutral-800 dark:hover:border-neutral-700",
          "focus-within:ring-2 focus-within:ring-primary-500/30",
          "has-[:disabled]:opacity-50 has-[:disabled]:cursor-not-allowed",
          className
        )}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {icon && (
              <div className="flex-shrink-0 text-primary-700 dark:text-primary-400">
                {icon}
              </div>
            )}
            <div className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
              {label}
            </div>
            {badge && (
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                {badge}
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {description}
            </p>
          )}
        </div>
        <Switch
          ref={ref}
          id={switchId}
          checked={checked}
          className="mt-0.5"
          {...props}
        />
      </label>
    );
  }
);
SwitchCard.displayName = "SwitchCard";

// ---------- Switch Group ----------
const SwitchGroup = React.forwardRef(
  ({ className, title, description, children, ...props }, ref) => (
    <div ref={ref} className={cn("space-y-4", className)} {...props}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h3 className="text-base font-semibold text-primary-800 dark:text-primary-200">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      )}
      <div className="space-y-3">{children}</div>
    </div>
  )
);
SwitchGroup.displayName = "SwitchGroup";

// ---------- Switch List ----------
const SwitchList = React.forwardRef(
  ({ className, children, spacing = "default", ...props }, ref) => {
    const spacingClasses = {
      none: "space-y-0",
      sm: "space-y-1",
      default: "space-y-2",
      lg: "space-y-3",
      xl: "space-y-4",
    };

    return (
      <div
        ref={ref}
        className={cn(spacingClasses[spacing], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
SwitchList.displayName = "SwitchList";

// ---------- Switch Container ----------
const SwitchContainer = React.forwardRef(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("space-y-2 w-full", className)}
      {...props}
    />
  )
);
SwitchContainer.displayName = "SwitchContainer";

// ---------- Switch With Icons ----------
const SwitchWithIcons = React.forwardRef(
  (
    {
      className,
      checkedIcon = <Check className="h-3 w-3" />,
      uncheckedIcon = <X className="h-3 w-3" />,
      variant = "default",
      size = "default",
      ...props
    },
    ref
  ) => (
    <SwitchPrimitive.Root
      ref={ref}
      data-slot="switch"
      className={cn(switchVariants({ variant, size }), className)}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          switchThumbVariants({ size }),
          "flex items-center justify-center"
        )}
      >
        <span className="data-[state=checked]:hidden text-neutral-600 dark:text-neutral-400">
          {uncheckedIcon}
        </span>
        <span className="data-[state=unchecked]:hidden text-white">
          {checkedIcon}
        </span>
      </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Root>
  )
);
SwitchWithIcons.displayName = "SwitchWithIcons";

export {
  Switch,
  SwitchLabel,
  SwitchDescription,
  SwitchWithLabel,
  SwitchCard,
  SwitchGroup,
  SwitchList,
  SwitchContainer,
  SwitchWithIcons,
  switchVariants,
  switchThumbVariants,
};
