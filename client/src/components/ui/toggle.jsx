"use client";

import * as React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva } from "class-variance-authority";
import { Loader2, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------- Toggle Variants ----------
const toggleVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all duration-200 outline-none disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:h-4 [&_svg:not([class*='size-'])]:w-4 [&_svg]:shrink-0 whitespace-nowrap",
  {
    variants: {
      variant: {
        default: `
          text-neutral-700 dark:text-neutral-300
          hover:bg-neutral-100 dark:hover:bg-neutral-800
          data-[state=on]:bg-primary-700 dark:data-[state=on]:bg-primary-600
          data-[state=on]:text-white
          focus-visible:ring-2 focus-visible:ring-primary-500/30
        `,
        outline: `
          border border-neutral-300 dark:border-neutral-700
          text-neutral-700 dark:text-neutral-300
          hover:bg-neutral-50 dark:hover:bg-neutral-800
          data-[state=on]:bg-primary-100 dark:data-[state=on]:bg-primary-900/30
          data-[state=on]:border-primary-700 dark:data-[state=on]:border-primary-600
          data-[state=on]:text-primary-900 dark:data-[state=on]:text-primary-100
          focus-visible:ring-2 focus-visible:ring-primary-500/30
        `,
        solid: `
          bg-neutral-100 dark:bg-neutral-800
          text-neutral-700 dark:text-neutral-300
          hover:bg-neutral-200 dark:hover:bg-neutral-700
          data-[state=on]:bg-primary-700 dark:data-[state=on]:bg-primary-600
          data-[state=on]:text-white
          focus-visible:ring-2 focus-visible:ring-primary-500/30
        `,
        ghost: `
          text-neutral-700 dark:text-neutral-300
          hover:bg-neutral-100 dark:hover:bg-neutral-800
          data-[state=on]:text-primary-700 dark:data-[state=on]:text-primary-400
          data-[state=on]:font-semibold
          focus-visible:ring-2 focus-visible:ring-primary-500/30
        `,
        destructive: `
          text-neutral-700 dark:text-neutral-300
          hover:bg-red-50 dark:hover:bg-red-950/30
          data-[state=on]:bg-red-600 dark:data-[state=on]:bg-red-500
          data-[state=on]:text-white
          focus-visible:ring-2 focus-visible:ring-red-500/30
        `,
      },
      size: {
        sm: "h-8 px-2.5 min-w-8 text-xs",
        default: "h-9 px-3 min-w-9 text-sm",
        lg: "h-11 px-4 min-w-11 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// ---------- Toggle Component ----------
const Toggle = React.forwardRef(
  (
    {
      className,
      variant,
      size,
      icon,
      pressedIcon,
      showStateIcon = false,
      isLoading = false,
      ...props
    },
    ref
  ) => {
    const isPressedValue = props.pressed ?? props.defaultPressed ?? false;

    return (
      <TogglePrimitive.Root
        ref={ref}
        data-slot="toggle"
        disabled={isLoading || props.disabled}
        className={cn(toggleVariants({ variant, size }), className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : showStateIcon ? (
          <>
            <span className="data-[state=off]:hidden">
              <Check className="h-4 w-4" strokeWidth={2.5} />
            </span>
            <span className="data-[state=on]:hidden">
              <X className="h-4 w-4" />
            </span>
          </>
        ) : icon || pressedIcon ? (
          <>
            {pressedIcon && (
              <span className="data-[state=off]:hidden">{pressedIcon}</span>
            )}
            {icon && (
              <span className={cn(pressedIcon && "data-[state=on]:hidden")}>
                {icon}
              </span>
            )}
          </>
        ) : null}
        {props.children}
      </TogglePrimitive.Root>
    );
  }
);
Toggle.displayName = TogglePrimitive.Root.displayName;

// ---------- Toggle Label ----------
const ToggleLabel = React.forwardRef(
  ({ className, required, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "text-sm font-semibold text-neutral-800 dark:text-neutral-200",
        "mb-2 block",
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
ToggleLabel.displayName = "ToggleLabel";

// ---------- Toggle Description ----------
const ToggleDescription = React.forwardRef(
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
ToggleDescription.displayName = "ToggleDescription";

// ---------- Toggle With Label ----------
const ToggleWithLabel = React.forwardRef(
  (
    {
      label,
      description,
      labelPosition = "left",
      className,
      containerClassName,
      required,
      ...props
    },
    ref
  ) => {
    const id = React.useId();
    const toggleId = props.id || id;

    const toggleElement = <Toggle ref={ref} id={toggleId} {...props} />;

    return (
      <div
        className={cn(
          "flex items-start gap-3",
          labelPosition === "right" && "flex-row-reverse justify-end",
          containerClassName
        )}
      >
        {toggleElement}
        <div className="flex flex-col gap-1 flex-1">
          <ToggleLabel htmlFor={toggleId} required={required}>
            {label}
          </ToggleLabel>
          {description && (
            <ToggleDescription>{description}</ToggleDescription>
          )}
        </div>
      </div>
    );
  }
);
ToggleWithLabel.displayName = "ToggleWithLabel";

// ---------- Toggle Card ----------
const ToggleCard = React.forwardRef(
  (
    {
      label,
      description,
      icon,
      badge,
      className,
      pressed,
      ...props
    },
    ref
  ) => {
    const id = React.useId();
    const toggleId = props.id || id;

    return (
      <label
        htmlFor={toggleId}
        className={cn(
          "relative flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer",
          "transition-all duration-200",
          "motion-reduce:transition-none",
          pressed
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
        <Toggle
          ref={ref}
          id={toggleId}
          pressed={pressed}
          className="mt-0.5"
          {...props}
        />
      </label>
    );
  }
);
ToggleCard.displayName = "ToggleCard";

// ---------- Toggle Container ----------
const ToggleContainer = React.forwardRef(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("space-y-2 w-full", className)}
      {...props}
    />
  )
);
ToggleContainer.displayName = "ToggleContainer";

// ---------- Toggle List ----------
const ToggleList = React.forwardRef(
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
ToggleList.displayName = "ToggleList";

// ---------- Toggle Section ----------
const ToggleSection = React.forwardRef(
  ({ className, title, description, children, ...props }, ref) => (
    <div ref={ref} className={cn("space-y-3", className)} {...props}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h4 className="text-base font-semibold text-primary-800 dark:text-primary-200">
              {title}
            </h4>
          )}
          {description && (
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      )}
      <ToggleList>{children}</ToggleList>
    </div>
  )
);
ToggleSection.displayName = "ToggleSection";

export {
  Toggle,
  ToggleLabel,
  ToggleDescription,
  ToggleWithLabel,
  ToggleCard,
  ToggleContainer,
  ToggleList,
  ToggleSection,
  toggleVariants,
};
