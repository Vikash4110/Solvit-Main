import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";

// ---------- Checkbox Variants ----------
const checkboxVariants = cva(
  "peer shrink-0 rounded-md border shadow-sm transition-all duration-200 outline-none disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none",
  {
    variants: {
      variant: {
        default: `
          border-neutral-300 bg-white
          hover:border-neutral-400
          data-[state=checked]:bg-primary-700 data-[state=checked]:border-primary-700
          data-[state=checked]:text-white
          data-[state=indeterminate]:bg-primary-700 data-[state=indeterminate]:border-primary-700
          data-[state=indeterminate]:text-white
          focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/50
          aria-invalid:border-red-500 aria-invalid:ring-2 aria-invalid:ring-red-500/20
          dark:border-neutral-700 dark:bg-neutral-900
          dark:hover:border-neutral-600
          dark:data-[state=checked]:bg-primary-600 dark:data-[state=checked]:border-primary-600
          dark:data-[state=indeterminate]:bg-primary-600 dark:data-[state=indeterminate]:border-primary-600
          dark:focus-visible:border-primary-500
          dark:aria-invalid:border-red-500
        `,
        success: `
          border-neutral-300 bg-white
          hover:border-neutral-400
          data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600
          data-[state=checked]:text-white
          data-[state=indeterminate]:bg-green-600 data-[state=indeterminate]:border-green-600
          data-[state=indeterminate]:text-white
          focus-visible:border-green-500 focus-visible:ring-2 focus-visible:ring-green-500/50
          dark:border-neutral-700 dark:bg-neutral-900
          dark:hover:border-neutral-600
          dark:data-[state=checked]:bg-green-500 dark:data-[state=checked]:border-green-500
          dark:data-[state=indeterminate]:bg-green-500 dark:data-[state=indeterminate]:border-green-500
        `,
        destructive: `
          border-neutral-300 bg-white
          hover:border-neutral-400
          data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600
          data-[state=checked]:text-white
          data-[state=indeterminate]:bg-red-600 data-[state=indeterminate]:border-red-600
          data-[state=indeterminate]:text-white
          focus-visible:border-red-500 focus-visible:ring-2 focus-visible:ring-red-500/50
          dark:border-neutral-700 dark:bg-neutral-900
          dark:hover:border-neutral-600
          dark:data-[state=checked]:bg-red-500 dark:data-[state=checked]:border-red-500
          dark:data-[state=indeterminate]:bg-red-500 dark:data-[state=indeterminate]:border-red-500
        `,
        coral: `
          border-neutral-300 bg-white
          hover:border-neutral-400
          data-[state=checked]:bg-coral-600 data-[state=checked]:border-coral-600
          data-[state=checked]:text-white
          data-[state=indeterminate]:bg-coral-600 data-[state=indeterminate]:border-coral-600
          data-[state=indeterminate]:text-white
          focus-visible:border-coral-500 focus-visible:ring-2 focus-visible:ring-coral-500/50
          dark:border-neutral-700 dark:bg-neutral-900
          dark:hover:border-neutral-600
          dark:data-[state=checked]:bg-coral-500 dark:data-[state=checked]:border-coral-500
          dark:data-[state=indeterminate]:bg-coral-500 dark:data-[state=indeterminate]:border-coral-500
        `,
      },
      size: {
        sm: "h-4 w-4 [&_svg]:h-3 [&_svg]:w-3",
        default: "h-5 w-5 [&_svg]:h-4 [&_svg]:w-4",
        lg: "h-6 w-6 [&_svg]:h-5 [&_svg]:w-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// ---------- Checkbox Component ----------
const Checkbox = React.forwardRef(
  ({ className, variant, size, indeterminate, ...props }, ref) => {
    const checkboxRef = React.useRef(null);

    React.useImperativeHandle(ref, () => checkboxRef.current);

    React.useEffect(() => {
      if (checkboxRef.current) {
        checkboxRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    return (
      <CheckboxPrimitive.Root
        ref={checkboxRef}
        data-slot="checkbox"
        className={cn(checkboxVariants({ variant, size }), className)}
        {...props}
      >
        <CheckboxPrimitive.Indicator
          data-slot="checkbox-indicator"
          className={cn(
            "flex items-center justify-center text-current",
            "transition-transform duration-200",
            "data-[state=checked]:scale-100 data-[state=unchecked]:scale-0",
            "motion-reduce:transition-none"
          )}
        >
          {indeterminate ? (
            <Minus className="h-full w-full" strokeWidth={3} />
          ) : (
            <Check className="h-full w-full" strokeWidth={3} />
          )}
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
    );
  }
);
Checkbox.displayName = "Checkbox";

// ---------- Checkbox with Label ----------
const CheckboxWithLabel = React.forwardRef(
  (
    {
      className,
      label,
      description,
      variant,
      size,
      labelClassName,
      descriptionClassName,
      containerClassName,
      ...props
    },
    ref
  ) => {
    const id = React.useId();
    const checkboxId = props.id || id;

    return (
      <div className={cn("flex items-start gap-3", containerClassName)}>
        <Checkbox
          ref={ref}
          id={checkboxId}
          variant={variant}
          size={size}
          className={cn("mt-0.5", className)}
          {...props}
        />
        <div className="flex flex-col gap-1">
          <label
            htmlFor={checkboxId}
            className={cn(
              "text-sm font-medium leading-tight cursor-pointer",
              "text-neutral-800 dark:text-neutral-200",
              "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
              labelClassName
            )}
          >
            {label}
          </label>
          {description && (
            <p
              className={cn(
                "text-xs text-neutral-600 dark:text-neutral-400",
                "leading-relaxed",
                descriptionClassName
              )}
            >
              {description}
            </p>
          )}
        </div>
      </div>
    );
  }
);
CheckboxWithLabel.displayName = "CheckboxWithLabel";

// ---------- Checkbox Group ----------
function CheckboxGroup({ className, children, ...props }) {
  return (
    <div
      role="group"
      className={cn("flex flex-col gap-3", className)}
      {...props}
    >
      {children}
    </div>
  );
}

// ---------- Checkbox Card ----------
const CheckboxCard = React.forwardRef(
  (
    {
      className,
      label,
      description,
      icon,
      variant,
      size,
      checked,
      ...props
    },
    ref
  ) => {
    const id = React.useId();
    const checkboxId = props.id || id;

    return (
      <label
        htmlFor={checkboxId}
        className={cn(
          "relative flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer",
          "transition-all duration-200",
          "motion-reduce:transition-none",
          checked
            ? "bg-primary-50 border-primary-700 dark:bg-primary-950/30 dark:border-primary-600"
            : "bg-white border-neutral-200 hover:border-neutral-300 dark:bg-neutral-900 dark:border-neutral-800 dark:hover:border-neutral-700",
          "focus-within:ring-2 focus-within:ring-primary-500/50",
          "has-[:disabled]:opacity-50 has-[:disabled]:cursor-not-allowed",
          className
        )}
      >
        <Checkbox
          ref={ref}
          id={checkboxId}
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
CheckboxCard.displayName = "CheckboxCard";

// ---------- Checkbox List Item ----------
const CheckboxListItem = React.forwardRef(
  (
    {
      className,
      label,
      badge,
      variant,
      size,
      checked,
      ...props
    },
    ref
  ) => {
    const id = React.useId();
    const checkboxId = props.id || id;

    return (
      <label
        htmlFor={checkboxId}
        className={cn(
          "flex items-center gap-3 p-3 rounded-lg cursor-pointer",
          "transition-colors duration-200",
          "motion-reduce:transition-none",
          "hover:bg-neutral-50 dark:hover:bg-neutral-900/50",
          "has-[:disabled]:opacity-50 has-[:disabled]:cursor-not-allowed",
          className
        )}
      >
        <Checkbox
          ref={ref}
          id={checkboxId}
          variant={variant}
          size={size}
          checked={checked}
          {...props}
        />
        <span className="flex-1 text-sm font-medium text-neutral-800 dark:text-neutral-200">
          {label}
        </span>
        {badge && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
            {badge}
          </span>
        )}
      </label>
    );
  }
);
CheckboxListItem.displayName = "CheckboxListItem";

export {
  Checkbox,
  CheckboxWithLabel,
  CheckboxGroup,
  CheckboxCard,
  CheckboxListItem,
};
