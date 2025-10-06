import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva } from "class-variance-authority";
import { Info, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------- Label Variants ----------
const labelVariants = cva(
  "leading-tight font-medium select-none transition-colors duration-200 motion-reduce:transition-none",
  {
    variants: {
      variant: {
        default: "text-neutral-800 dark:text-neutral-200",
        muted: "text-neutral-600 dark:text-neutral-400",
        primary: "text-primary-800 dark:text-primary-200",
        error: "text-red-700 dark:text-red-400",
        success: "text-green-700 dark:text-green-400",
        warning: "text-yellow-700 dark:text-yellow-400",
      },
      size: {
        sm: "text-xs",
        default: "text-sm",
        lg: "text-base",
      },
      weight: {
        normal: "font-normal",
        medium: "font-medium",
        semibold: "font-semibold",
        bold: "font-bold",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      weight: "semibold",
    },
  }
);

// ---------- Label Component ----------
const Label = React.forwardRef(
  (
    {
      className,
      variant,
      size,
      weight,
      required,
      optional,
      icon,
      tooltip,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <LabelPrimitive.Root
        ref={ref}
        data-slot="label"
        className={cn(
          "flex items-center gap-2",
          "group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50",
          "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
          labelVariants({ variant, size, weight }),
          className
        )}
        {...props}
      >
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <span className="flex items-center gap-1.5">
          {children}
          {required && (
            <span
              className="text-red-600 dark:text-red-400 ml-0.5"
              aria-label="required"
            >
              *
            </span>
          )}
          {optional && (
            <span className="text-xs font-normal text-neutral-500 dark:text-neutral-400 ml-0.5">
              (optional)
            </span>
          )}
          {tooltip && (
            <button
              type="button"
              className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors"
              aria-label="More information"
              title={tooltip}
            >
              <Info className="h-3.5 w-3.5" />
            </button>
          )}
        </span>
      </LabelPrimitive.Root>
    );
  }
);
Label.displayName = LabelPrimitive.Root.displayName;

// ---------- Label Group ----------
const LabelGroup = React.forwardRef(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col gap-1.5", className)}
      {...props}
    >
      {children}
    </div>
  )
);
LabelGroup.displayName = "LabelGroup";

// ---------- Label With Helper ----------
const LabelWithHelper = React.forwardRef(
  (
    {
      className,
      label,
      helper,
      error,
      success,
      required,
      optional,
      icon,
      tooltip,
      children,
      ...props
    },
    ref
  ) => {
    const variant = error ? "error" : success ? "success" : "default";

    return (
      <LabelGroup className={className} {...props}>
        <Label
          ref={ref}
          variant={variant}
          required={required}
          optional={optional}
          icon={icon}
          tooltip={tooltip}
        >
          {label || children}
        </Label>
        {helper && !error && !success && (
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {helper}
          </p>
        )}
        {error && (
          <p className="text-xs font-medium text-red-600 dark:text-red-400 flex items-start gap-1">
            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </p>
        )}
        {success && (
          <p className="text-xs font-medium text-green-600 dark:text-green-400 flex items-start gap-1">
            <span>✓</span>
            <span>{success}</span>
          </p>
        )}
      </LabelGroup>
    );
  }
);
LabelWithHelper.displayName = "LabelWithHelper";

// ---------- Label Badge ----------
function LabelBadge({ className, variant = "default", children, ...props }) {
  const variantClasses = {
    default: "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300",
    primary: "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300",
    success: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
    warning: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300",
    error: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

// ---------- Label Description ----------
const LabelDescription = React.forwardRef(
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
LabelDescription.displayName = "LabelDescription";

// ---------- Label Counter ----------
function LabelCounter({
  current,
  max,
  className,
  ...props
}) {
  const percentage = max ? (current / max) * 100 : 0;
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  return (
    <span
      className={cn(
        "text-xs font-medium tabular-nums",
        isAtLimit
          ? "text-red-600 dark:text-red-400"
          : isNearLimit
          ? "text-yellow-600 dark:text-yellow-400"
          : "text-neutral-500 dark:text-neutral-500",
        className
      )}
      {...props}
    >
      {current}
      {max && ` / ${max}`}
    </span>
  );
}

// ---------- Label With Counter ----------
const LabelWithCounter = React.forwardRef(
  (
    {
      className,
      label,
      current,
      max,
      required,
      optional,
      ...props
    },
    ref
  ) => (
    <div
      ref={ref}
      className={cn("flex items-center justify-between", className)}
      {...props}
    >
      <Label required={required} optional={optional}>
        {label}
      </Label>
      <LabelCounter current={current} max={max} />
    </div>
  )
);
LabelWithCounter.displayName = "LabelWithCounter";

// ---------- Label Header ----------
const LabelHeader = React.forwardRef(
  ({ className, title, subtitle, badge, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-start justify-between gap-2", className)}
      {...props}
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Label size="lg" weight="semibold">
            {title}
          </Label>
          {badge && <LabelBadge>{badge}</LabelBadge>}
        </div>
        {subtitle && (
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
);
LabelHeader.displayName = "LabelHeader";

// ---------- Label Inline ----------
const LabelInline = React.forwardRef(
  ({ className, label, children, align = "center", ...props }, ref) => {
    const alignClasses = {
      start: "items-start",
      center: "items-center",
      end: "items-end",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "flex gap-3",
          alignClasses[align],
          className
        )}
        {...props}
      >
        <Label className="shrink-0">{label}</Label>
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    );
  }
);
LabelInline.displayName = "LabelInline";

// ---------- Label Section ----------
const LabelSection = React.forwardRef(
  ({ className, title, description, required, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("space-y-3", className)}
      {...props}
    >
      <div className="space-y-1">
        <Label size="lg" weight="semibold" required={required}>
          {title}
        </Label>
        {description && (
          <LabelDescription>{description}</LabelDescription>
        )}
      </div>
      {children}
    </div>
  )
);
LabelSection.displayName = "LabelSection";

export {
  Label,
  LabelGroup,
  LabelWithHelper,
  LabelBadge,
  LabelDescription,
  LabelCounter,
  LabelWithCounter,
  LabelHeader,
  LabelInline,
  LabelSection,
  labelVariants,
};
