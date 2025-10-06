"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

// ---------- Slider Variants ----------
const sliderTrackVariants = cva(
  "relative grow overflow-hidden rounded-full transition-colors duration-200 motion-reduce:transition-none",
  {
    variants: {
      variant: {
        default: "bg-neutral-200 dark:bg-neutral-800",
        primary: "bg-primary-200 dark:bg-primary-900/30",
        success: "bg-green-200 dark:bg-green-900/30",
        warning: "bg-yellow-200 dark:bg-yellow-900/30",
        destructive: "bg-red-200 dark:bg-red-900/30",
      },
      size: {
        sm: "data-[orientation=horizontal]:h-1 data-[orientation=vertical]:w-1",
        default: "data-[orientation=horizontal]:h-1.5 data-[orientation=vertical]:w-1.5",
        lg: "data-[orientation=horizontal]:h-2 data-[orientation=vertical]:w-2",
        xl: "data-[orientation=horizontal]:h-3 data-[orientation=vertical]:w-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const sliderRangeVariants = cva(
  "absolute transition-colors duration-200 motion-reduce:transition-none",
  {
    variants: {
      variant: {
        default: "bg-primary-700 dark:bg-primary-600",
        primary: "bg-primary-700 dark:bg-primary-600",
        success: "bg-green-600 dark:bg-green-500",
        warning: "bg-yellow-600 dark:bg-yellow-500",
        destructive: "bg-red-600 dark:bg-red-500",
        gradient: `
          bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500
          dark:from-primary-600 dark:via-primary-500 dark:to-primary-400
        `,
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const sliderThumbVariants = cva(
  "block shrink-0 rounded-full border-2 shadow-md transition-all duration-200 outline-none motion-reduce:transition-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: `
          border-primary-700 bg-white
          hover:ring-4 hover:ring-primary-500/30
          focus-visible:ring-4 focus-visible:ring-primary-500/30
          dark:border-primary-600 dark:bg-white
        `,
        primary: `
          border-primary-700 bg-white
          hover:ring-4 hover:ring-primary-500/30
          focus-visible:ring-4 focus-visible:ring-primary-500/30
          dark:border-primary-600
        `,
        success: `
          border-green-600 bg-white
          hover:ring-4 hover:ring-green-500/30
          focus-visible:ring-4 focus-visible:ring-green-500/30
          dark:border-green-500
        `,
        warning: `
          border-yellow-600 bg-white
          hover:ring-4 hover:ring-yellow-500/30
          focus-visible:ring-4 focus-visible:ring-yellow-500/30
          dark:border-yellow-500
        `,
        destructive: `
          border-red-600 bg-white
          hover:ring-4 hover:ring-red-500/30
          focus-visible:ring-4 focus-visible:ring-red-500/30
          dark:border-red-500
        `,
        gradient: `
          border-primary-700 bg-white
          hover:ring-4 hover:ring-primary-500/30
          focus-visible:ring-4 focus-visible:ring-primary-500/30
          dark:border-primary-600
        `,
      },
      size: {
        sm: "h-3.5 w-3.5",
        default: "h-5 w-5",
        lg: "h-6 w-6",
        xl: "h-7 w-7",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// ---------- Slider Component ----------
const Slider = React.forwardRef(
  (
    {
      className,
      defaultValue,
      value,
      min = 0,
      max = 100,
      step = 1,
      variant = "default",
      size = "default",
      showValue = false,
      showTooltip = false,
      formatValue,
      ...props
    },
    ref
  ) => {
    const _values = React.useMemo(
      () =>
        Array.isArray(value)
          ? value
          : Array.isArray(defaultValue)
          ? defaultValue
          : [min],
      [value, defaultValue, min]
    );

    const formatDisplayValue = React.useCallback(
      (val) => {
        if (formatValue) return formatValue(val);
        return val.toString();
      },
      [formatValue]
    );

    return (
      <div className="w-full space-y-2">
        <SliderPrimitive.Root
          ref={ref}
          data-slot="slider"
          defaultValue={defaultValue}
          value={value}
          min={min}
          max={max}
          step={step}
          className={cn(
            "relative flex w-full touch-none items-center select-none",
            "data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed",
            "data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44",
            "data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
            className
          )}
          {...props}
        >
          <SliderPrimitive.Track
            data-slot="slider-track"
            className={sliderTrackVariants({ variant, size })}
          >
            <SliderPrimitive.Range
              data-slot="slider-range"
              className={cn(
                sliderRangeVariants({ variant }),
                "data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
              )}
            />
          </SliderPrimitive.Track>
          {_values.map((_, index) => (
            <SliderPrimitive.Thumb
              key={index}
              data-slot="slider-thumb"
              className={sliderThumbVariants({ variant, size })}
            >
              {showTooltip && (
                <span
                  className={cn(
                    "absolute -top-10 left-1/2 -translate-x-1/2",
                    "rounded-lg bg-neutral-900 dark:bg-neutral-100",
                    "px-2 py-1 text-xs font-medium",
                    "text-white dark:text-neutral-900",
                    "opacity-0 transition-opacity duration-200",
                    "group-hover:opacity-100",
                    "pointer-events-none whitespace-nowrap",
                    "after:absolute after:left-1/2 after:top-full after:-translate-x-1/2",
                    "after:border-4 after:border-transparent",
                    "after:border-t-neutral-900 dark:after:border-t-neutral-100"
                  )}
                >
                  {formatDisplayValue(_values[index])}
                </span>
              )}
            </SliderPrimitive.Thumb>
          ))}
        </SliderPrimitive.Root>

        {showValue && (
          <div className="flex items-center justify-between text-xs font-medium text-neutral-600 dark:text-neutral-400 tabular-nums">
            <span>{formatDisplayValue(min)}</span>
            <span className="text-primary-700 dark:text-primary-400 font-semibold">
              {_values.length === 1
                ? formatDisplayValue(_values[0])
                : `${formatDisplayValue(_values[0])} - ${formatDisplayValue(_values[_values.length - 1])}`}
            </span>
            <span>{formatDisplayValue(max)}</span>
          </div>
        )}
      </div>
    );
  }
);
Slider.displayName = SliderPrimitive.Root.displayName;

// ---------- Slider With Label ----------
const SliderWithLabel = React.forwardRef(
  (
    {
      label,
      description,
      className,
      containerClassName,
      required,
      ...props
    },
    ref
  ) => (
    <div className={cn("space-y-2 w-full", containerClassName)}>
      {label && (
        <label className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 block">
          {label}
          {required && (
            <span
              className="ml-1 text-red-600 dark:text-red-400"
              aria-label="required"
            >
              *
            </span>
          )}
        </label>
      )}
      <Slider ref={ref} className={className} {...props} />
      {description && (
        <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {description}
        </p>
      )}
    </div>
  )
);
SliderWithLabel.displayName = "SliderWithLabel";

// ---------- Slider With Marks ----------
const SliderWithMarks = React.forwardRef(
  (
    {
      marks = [],
      className,
      min = 0,
      max = 100,
      variant = "default",
      size = "default",
      ...props
    },
    ref
  ) => {
    const calculatePosition = (value) => {
      return ((value - min) / (max - min)) * 100;
    };

    return (
      <div className="w-full space-y-2">
        <div className="relative">
          <Slider
            ref={ref}
            className={className}
            min={min}
            max={max}
            variant={variant}
            size={size}
            {...props}
          />
          <div className="relative mt-2">
            {marks.map((mark, index) => {
              const position = calculatePosition(mark.value);
              return (
                <div
                  key={index}
                  className="absolute -translate-x-1/2"
                  style={{ left: `${position}%` }}
                >
                  <div className="h-2 w-0.5 bg-neutral-400 dark:bg-neutral-600" />
                  {mark.label && (
                    <span className="absolute top-3 left-1/2 -translate-x-1/2 text-xs text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                      {mark.label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
);
SliderWithMarks.displayName = "SliderWithMarks";

// ---------- Slider Range ----------
const SliderRange = React.forwardRef(
  (
    {
      defaultValue = [25, 75],
      className,
      ...props
    },
    ref
  ) => (
    <Slider
      ref={ref}
      defaultValue={defaultValue}
      className={className}
      {...props}
    />
  )
);
SliderRange.displayName = "SliderRange";

// ---------- Slider Stepped ----------
const SliderStepped = React.forwardRef(
  (
    {
      steps = 4,
      min = 0,
      max = 100,
      className,
      showMarks = true,
      ...props
    },
    ref
  ) => {
    const stepValue = (max - min) / steps;
    const marks = Array.from({ length: steps + 1 }, (_, i) => ({
      value: min + i * stepValue,
      label: (min + i * stepValue).toString(),
    }));

    if (showMarks) {
      return (
        <SliderWithMarks
          ref={ref}
          marks={marks}
          min={min}
          max={max}
          step={stepValue}
          className={className}
          {...props}
        />
      );
    }

    return (
      <Slider
        ref={ref}
        min={min}
        max={max}
        step={stepValue}
        className={className}
        {...props}
      />
    );
  }
);
SliderStepped.displayName = "SliderStepped";

// ---------- Slider Vertical ----------
const SliderVertical = React.forwardRef(
  ({ className, ...props }, ref) => (
    <Slider
      ref={ref}
      orientation="vertical"
      className={cn("h-48", className)}
      {...props}
    />
  )
);
SliderVertical.displayName = "SliderVertical";

// ---------- Slider Card ----------
const SliderCard = React.forwardRef(
  (
    {
      title,
      description,
      icon,
      value,
      className,
      variant = "default",
      ...props
    },
    ref
  ) => (
    <div
      className={cn(
        "rounded-xl border border-neutral-200 dark:border-neutral-800",
        "bg-white/95 backdrop-blur-md dark:bg-neutral-900/95",
        "p-4 sm:p-5 space-y-4",
        className
      )}
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
        {value !== undefined && (
          <div className="text-2xl font-bold text-primary-800 dark:text-primary-200 tabular-nums">
            {value}
          </div>
        )}
      </div>
      <Slider ref={ref} variant={variant} showValue {...props} />
    </div>
  )
);
SliderCard.displayName = "SliderCard";

export {
  Slider,
  SliderWithLabel,
  SliderWithMarks,
  SliderRange,
  SliderStepped,
  SliderVertical,
  SliderCard,
  sliderTrackVariants,
  sliderRangeVariants,
  sliderThumbVariants,
};
