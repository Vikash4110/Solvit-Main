"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

// ---------- Progress Variants ----------
const progressVariants = cva(
  "relative w-full overflow-hidden rounded-full transition-all duration-300 motion-reduce:transition-none",
  {
    variants: {
      variant: {
        default: "bg-primary-200 dark:bg-primary-900/30",
        success: "bg-green-200 dark:bg-green-900/30",
        warning: "bg-yellow-200 dark:bg-yellow-900/30",
        destructive: "bg-red-200 dark:bg-red-900/30",
        info: "bg-blue-200 dark:bg-blue-900/30",
        coral: "bg-coral-200 dark:bg-coral-900/30",
        neutral: "bg-neutral-200 dark:bg-neutral-800",
      },
      size: {
        sm: "h-1.5",
        default: "h-2.5",
        lg: "h-4",
        xl: "h-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const progressIndicatorVariants = cva(
  "h-full w-full flex-1 transition-all duration-500 ease-out motion-reduce:transition-none",
  {
    variants: {
      variant: {
        default: "bg-primary-700 dark:bg-primary-500",
        success: "bg-green-600 dark:bg-green-500",
        warning: "bg-yellow-600 dark:bg-yellow-500",
        destructive: "bg-red-600 dark:bg-red-500",
        info: "bg-blue-600 dark:bg-blue-500",
        coral: "bg-coral-600 dark:bg-coral-500",
        neutral: "bg-neutral-600 dark:bg-neutral-400",
      },
      animated: {
        true: "animate-progress-shimmer",
        false: "",
      },
      striped: {
        true: "bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:200%_100%]",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      animated: false,
      striped: false,
    },
  }
);

// ---------- Progress Component ----------
const Progress = React.forwardRef(
  (
    {
      className,
      value = 0,
      variant,
      size,
      animated = false,
      striped = false,
      showValue = false,
      label,
      ...props
    },
    ref
  ) => {
    const normalizedValue = Math.min(Math.max(value || 0, 0), 100);

    return (
      <div className="w-full space-y-2">
        {(label || showValue) && (
          <div className="flex items-center justify-between text-sm">
            {label && (
              <span className="font-medium text-neutral-700 dark:text-neutral-300">
                {label}
              </span>
            )}
            {showValue && (
              <span className="font-semibold text-neutral-800 dark:text-neutral-200 tabular-nums">
                {Math.round(normalizedValue)}%
              </span>
            )}
          </div>
        )}
        <ProgressPrimitive.Root
          ref={ref}
          data-slot="progress"
          className={cn(progressVariants({ variant, size }), className)}
          {...props}
        >
          <ProgressPrimitive.Indicator
            data-slot="progress-indicator"
            className={cn(
              progressIndicatorVariants({ variant, animated, striped })
            )}
            style={{ transform: `translateX(-${100 - normalizedValue}%)` }}
          />
        </ProgressPrimitive.Root>
      </div>
    );
  }
);
Progress.displayName = ProgressPrimitive.Root.displayName;

// ---------- Progress Circle ----------
const ProgressCircle = React.forwardRef(
  (
    {
      className,
      value = 0,
      variant = "default",
      size = "default",
      showValue = true,
      strokeWidth = 8,
      ...props
    },
    ref
  ) => {
    const normalizedValue = Math.min(Math.max(value || 0, 0), 100);

    const sizeClasses = {
      sm: { container: "h-16 w-16", text: "text-xs" },
      default: { container: "h-24 w-24", text: "text-base" },
      lg: { container: "h-32 w-32", text: "text-xl" },
      xl: { container: "h-40 w-40", text: "text-2xl" },
    };

    const variantColors = {
      default: {
        bg: "stroke-primary-200 dark:stroke-primary-900/30",
        fg: "stroke-primary-700 dark:stroke-primary-500",
      },
      success: {
        bg: "stroke-green-200 dark:stroke-green-900/30",
        fg: "stroke-green-600 dark:stroke-green-500",
      },
      warning: {
        bg: "stroke-yellow-200 dark:stroke-yellow-900/30",
        fg: "stroke-yellow-600 dark:stroke-yellow-500",
      },
      destructive: {
        bg: "stroke-red-200 dark:stroke-red-900/30",
        fg: "stroke-red-600 dark:stroke-red-500",
      },
      info: {
        bg: "stroke-blue-200 dark:stroke-blue-900/30",
        fg: "stroke-blue-600 dark:stroke-blue-500",
      },
      coral: {
        bg: "stroke-coral-200 dark:stroke-coral-900/30",
        fg: "stroke-coral-600 dark:stroke-coral-500",
      },
    };

    const radius = 50 - strokeWidth / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (normalizedValue / 100) * circumference;

    return (
      <div
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center",
          sizeClasses[size].container,
          className
        )}
        {...props}
      >
        <svg className="h-full w-full -rotate-90 transform">
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            className={variantColors[variant].bg}
          />
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={cn(
              variantColors[variant].fg,
              "transition-all duration-500 ease-out",
              "motion-reduce:transition-none"
            )}
          />
        </svg>
        {showValue && (
          <span
            className={cn(
              "absolute font-bold text-neutral-800 dark:text-neutral-200 tabular-nums",
              sizeClasses[size].text
            )}
          >
            {Math.round(normalizedValue)}%
          </span>
        )}
      </div>
    );
  }
);
ProgressCircle.displayName = "ProgressCircle";

// ---------- Progress Multi ----------
function ProgressMulti({
  segments = [],
  size = "default",
  showLegend = true,
  className,
  ...props
}) {
  const total = segments.reduce((sum, seg) => sum + seg.value, 0);

  return (
    <div className={cn("w-full space-y-3", className)} {...props}>
      <ProgressPrimitive.Root
        data-slot="progress"
        className={cn(progressVariants({ variant: "neutral", size }))}
      >
        <div className="flex h-full w-full">
          {segments.map((segment, index) => {
            const percentage = (segment.value / total) * 100;
            return (
              <div
                key={index}
                style={{ width: `${percentage}%` }}
                className={cn(
                  "h-full transition-all duration-500 ease-out",
                  "motion-reduce:transition-none",
                  segment.className
                )}
                title={`${segment.label}: ${Math.round(percentage)}%`}
              />
            );
          })}
        </div>
      </ProgressPrimitive.Root>

      {showLegend && (
        <div className="flex flex-wrap gap-3">
          {segments.map((segment, index) => {
            const percentage = (segment.value / total) * 100;
            return (
              <div key={index} className="flex items-center gap-2">
                <div
                  className={cn("h-3 w-3 rounded-sm", segment.className)}
                />
                <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  {segment.label}:{" "}
                  <span className="font-semibold">
                    {Math.round(percentage)}%
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------- Progress Steps ----------
function ProgressSteps({
  currentStep,
  totalSteps,
  variant = "default",
  className,
  ...props
}) {
  const percentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className={cn("w-full space-y-3", className)} {...props}>
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isComplete = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <React.Fragment key={stepNumber}>
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full",
                  "text-xs font-semibold transition-all duration-300",
                  "motion-reduce:transition-none",
                  isComplete && [
                    "bg-primary-700 text-white",
                    "dark:bg-primary-600",
                  ],
                  isCurrent && [
                    "bg-primary-700 text-white ring-4 ring-primary-200",
                    "dark:bg-primary-600 dark:ring-primary-900/30",
                  ],
                  !isComplete && !isCurrent && [
                    "bg-neutral-200 text-neutral-600",
                    "dark:bg-neutral-800 dark:text-neutral-400",
                  ]
                )}
              >
                {isComplete ? "✓" : stepNumber}
              </div>
              {index < totalSteps - 1 && (
                <div className="flex-1 h-0.5 mx-2 bg-neutral-200 dark:bg-neutral-800">
                  <div
                    className={cn(
                      "h-full bg-primary-700 dark:bg-primary-600",
                      "transition-all duration-500 ease-out",
                      "motion-reduce:transition-none"
                    )}
                    style={{
                      width: `${
                        stepNumber < currentStep
                          ? 100
                          : stepNumber === currentStep
                          ? 0
                          : 0
                      }%`,
                    }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
      <div className="text-center text-sm font-medium text-neutral-700 dark:text-neutral-300">
        Step {currentStep} of {totalSteps}
      </div>
    </div>
  );
}

// ---------- Progress Card ----------
const ProgressCard = React.forwardRef(
  (
    {
      className,
      title,
      description,
      value,
      variant = "default",
      icon,
      showValue = true,
      ...props
    },
    ref
  ) => (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border border-neutral-200 dark:border-neutral-800",
        "bg-white/95 backdrop-blur-md dark:bg-neutral-900/95",
        "p-4 sm:p-5 space-y-3",
        className
      )}
      {...props}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            {icon && (
              <div className="flex-shrink-0 text-primary-600 dark:text-primary-400">
                {icon}
              </div>
            )}
            <h4 className="font-semibold text-neutral-800 dark:text-neutral-200">
              {title}
            </h4>
          </div>
          {description && (
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              {description}
            </p>
          )}
        </div>
        {showValue && (
          <div className="text-2xl font-bold text-primary-800 dark:text-primary-200 tabular-nums">
            {Math.round(value)}%
          </div>
        )}
      </div>
      <Progress value={value} variant={variant} size="lg" />
    </div>
  )
);
ProgressCard.displayName = "ProgressCard";

export {
  Progress,
  ProgressCircle,
  ProgressMulti,
  ProgressSteps,
  ProgressCard,
  progressVariants,
};
