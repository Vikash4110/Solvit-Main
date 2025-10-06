import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Circle, Check } from "lucide-react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

// ---------- Radio Group Root ----------
const RadioGroup = React.forwardRef(
  ({ className, orientation = "vertical", ...props }, ref) => {
    const orientationClasses = {
      vertical: "grid gap-3",
      horizontal: "flex flex-wrap gap-3",
    };

    return (
      <RadioGroupPrimitive.Root
        ref={ref}
        data-slot="radio-group"
        className={cn(orientationClasses[orientation], className)}
        {...props}
      />
    );
  }
);
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

// ---------- Radio Group Item Variants ----------
const radioGroupItemVariants = cva(
  "aspect-square shrink-0 rounded-full border shadow-sm transition-all duration-200 outline-none disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none",
  {
    variants: {
      variant: {
        default: `
          border-neutral-300 bg-white
          hover:border-neutral-400
          data-[state=checked]:border-primary-700 data-[state=checked]:bg-primary-700
          focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/30
          aria-invalid:border-red-500 aria-invalid:ring-2 aria-invalid:ring-red-500/30
          dark:border-neutral-700 dark:bg-neutral-900
          dark:hover:border-neutral-600
          dark:data-[state=checked]:border-primary-600 dark:data-[state=checked]:bg-primary-600
          dark:focus-visible:border-primary-500
        `,
        filled: `
          border-neutral-300 bg-neutral-50
          hover:border-neutral-400 hover:bg-neutral-100
          data-[state=checked]:border-primary-700 data-[state=checked]:bg-primary-700
          focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/30
          dark:border-neutral-700 dark:bg-neutral-800
          dark:hover:border-neutral-600 dark:hover:bg-neutral-700
          dark:data-[state=checked]:border-primary-600 dark:data-[state=checked]:bg-primary-600
        `,
        outlined: `
          border-2 border-neutral-300 bg-white
          hover:border-neutral-400
          data-[state=checked]:border-primary-700 data-[state=checked]:bg-primary-700
          focus-visible:border-primary-700 focus-visible:ring-2 focus-visible:ring-primary-500/30
          dark:border-neutral-700 dark:bg-neutral-900
          dark:hover:border-neutral-600
          dark:data-[state=checked]:border-primary-600 dark:data-[state=checked]:bg-primary-600
        `,
      },
      size: {
        sm: "h-4 w-4 [&_svg]:h-2 [&_svg]:w-2",
        default: "h-5 w-5 [&_svg]:h-2.5 [&_svg]:w-2.5",
        lg: "h-6 w-6 [&_svg]:h-3 [&_svg]:w-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// ---------- Radio Group Item ----------
const RadioGroupItem = React.forwardRef(
  ({ className, variant, size, ...props }, ref) => (
    <RadioGroupPrimitive.Item
      ref={ref}
      data-slot="radio-group-item"
      className={cn(radioGroupItemVariants({ variant, size }), className)}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="relative flex items-center justify-center"
      >
        <Circle className="fill-white dark:fill-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
);
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

// ---------- Radio Group With Label ----------
const RadioGroupWithLabel = React.forwardRef(
  (
    {
      className,
      label,
      description,
      value,
      variant,
      size,
      disabled,
      ...props
    },
    ref
  ) => {
    const id = React.useId();
    const itemId = props.id || id;

    return (
      <div className={cn("flex items-start gap-3", className)} {...props}>
        <RadioGroupItem
          ref={ref}
          id={itemId}
          value={value}
          variant={variant}
          size={size}
          disabled={disabled}
          className="mt-0.5"
        />
        <div className="flex flex-col gap-1 flex-1">
          <label
            htmlFor={itemId}
            className={cn(
              "text-sm font-medium leading-tight cursor-pointer",
              "text-neutral-800 dark:text-neutral-200",
              "peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
            )}
          >
            {label}
          </label>
          {description && (
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>
    );
  }
);
RadioGroupWithLabel.displayName = "RadioGroupWithLabel";

// ---------- Radio Group Card ----------
const RadioGroupCard = React.forwardRef(
  (
    {
      className,
      label,
      description,
      value,
      icon,
      badge,
      variant,
      size,
      checked,
      ...props
    },
    ref
  ) => {
    const id = React.useId();
    const itemId = props.id || id;

    return (
      <label
        htmlFor={itemId}
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
        <RadioGroupItem
          ref={ref}
          id={itemId}
          value={value}
          variant={variant}
          size={size}
          checked={checked}
          className="mt-0.5"
          {...props}
        />
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
      </label>
    );
  }
);
RadioGroupCard.displayName = "RadioGroupCard";

// ---------- Radio Group Button ----------
const RadioGroupButton = React.forwardRef(
  (
    {
      className,
      label,
      value,
      icon,
      checked,
      ...props
    },
    ref
  ) => {
    const id = React.useId();
    const itemId = props.id || id;

    return (
      <label
        htmlFor={itemId}
        className={cn(
          "inline-flex items-center justify-center gap-2 px-4 py-2",
          "rounded-lg border-2 cursor-pointer",
          "text-sm font-medium",
          "transition-all duration-200",
          "motion-reduce:transition-none",
          checked
            ? "bg-primary-700 border-primary-700 text-white dark:bg-primary-600 dark:border-primary-600"
            : "bg-white border-neutral-300 text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:bg-neutral-800",
          "focus-within:ring-2 focus-within:ring-primary-500/30",
          "has-[:disabled]:opacity-50 has-[:disabled]:cursor-not-allowed",
          className
        )}
      >
        <RadioGroupItem
          ref={ref}
          id={itemId}
          value={value}
          checked={checked}
          className="sr-only"
          {...props}
        />
        {icon && <span className="flex-shrink-0">{icon}</span>}
        {label}
      </label>
    );
  }
);
RadioGroupButton.displayName = "RadioGroupButton";

// ---------- Radio Group Label ----------
const RadioGroupLabel = React.forwardRef(
  ({ className, required, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "text-sm font-semibold text-neutral-800 dark:text-neutral-200",
        "mb-3 block",
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
RadioGroupLabel.displayName = "RadioGroupLabel";

// ---------- Radio Group Description ----------
const RadioGroupDescription = React.forwardRef(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(
        "text-xs text-neutral-600 dark:text-neutral-400",
        "mb-3 leading-relaxed",
        className
      )}
      {...props}
    />
  )
);
RadioGroupDescription.displayName = "RadioGroupDescription";

// ---------- Radio Group Error ----------
const RadioGroupError = React.forwardRef(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(
        "text-xs font-medium text-red-600 dark:text-red-400",
        "mt-2 flex items-center gap-1",
        className
      )}
      role="alert"
      {...props}
    />
  )
);
RadioGroupError.displayName = "RadioGroupError";

// ---------- Radio Group Container ----------
const RadioGroupContainer = React.forwardRef(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("space-y-3 w-full", className)}
      {...props}
    />
  )
);
RadioGroupContainer.displayName = "RadioGroupContainer";

// ---------- Radio Group Section ----------
const RadioGroupSection = React.forwardRef(
  ({ className, title, description, children, required, error, ...props }, ref) => (
    <RadioGroupContainer ref={ref} className={className} {...props}>
      {title && <RadioGroupLabel required={required}>{title}</RadioGroupLabel>}
      {description && <RadioGroupDescription>{description}</RadioGroupDescription>}
      {children}
      {error && <RadioGroupError>{error}</RadioGroupError>}
    </RadioGroupContainer>
  )
);
RadioGroupSection.displayName = "RadioGroupSection";

export {
  RadioGroup,
  RadioGroupItem,
  RadioGroupWithLabel,
  RadioGroupCard,
  RadioGroupButton,
  RadioGroupLabel,
  RadioGroupDescription,
  RadioGroupError,
  RadioGroupContainer,
  RadioGroupSection,
  radioGroupItemVariants,
};
