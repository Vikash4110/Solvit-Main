// components/ui/toggle-group.tsx
"use client";

import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { toggleVariants } from "@/components/ui/toggle";

// ---------- Context ----------
const ToggleGroupContext = React.createContext({
  size: "default",
  variant: "default",
});

// ---------- Toggle Group Variants ----------
const toggleGroupVariants = cva(
  "flex w-fit transition-all duration-200 motion-reduce:transition-none",
  {
    variants: {
      variant: {
        default: `
          bg-neutral-100 dark:bg-neutral-800
          rounded-lg p-1 gap-1
        `,
        outline: `
          bg-white dark:bg-neutral-900
          border border-neutral-200 dark:border-neutral-800
          rounded-lg shadow-sm
        `,
        pills: `
          bg-transparent gap-2
        `,
        separated: `
          bg-transparent gap-2
        `,
      },
      orientation: {
        horizontal: "flex-row items-center",
        vertical: "flex-col items-stretch",
      },
    },
    defaultVariants: {
      variant: "default",
      orientation: "horizontal",
    },
  }
);

// ---------- Toggle Group Root ----------
const ToggleGroup = React.forwardRef(
  (
    {
      className,
      variant = "default",
      size = "default",
      orientation = "horizontal",
      children,
      ...props
    },
    ref
  ) => (
    <ToggleGroupPrimitive.Root
      ref={ref}
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      className={cn(toggleGroupVariants({ variant, orientation }), className)}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant, size }}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  )
);
ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName;

// ---------- Toggle Group Item ----------
const ToggleGroupItem = React.forwardRef(
  (
    {
      className,
      children,
      variant,
      size,
      icon,
      badge,
      ...props
    },
    ref
  ) => {
    const context = React.useContext(ToggleGroupContext);
    const itemVariant = context.variant || variant;
    const itemSize = context.size || size;

    return (
      <ToggleGroupPrimitive.Item
        ref={ref}
        data-slot="toggle-group-item"
        data-variant={itemVariant}
        data-size={itemSize}
        className={cn(
          toggleVariants({
            variant: itemVariant,
            size: itemSize,
          }),
          "min-w-0 flex-1 shrink-0",
          // Default variant - connected buttons
          itemVariant === "default" && [
            "rounded-none shadow-none",
            "first:rounded-l-lg last:rounded-r-lg",
            "[&:not(:first-child)]:border-l [&:not(:first-child)]:border-neutral-200",
            "dark:[&:not(:first-child)]:border-neutral-700",
            "data-[orientation=vertical]:first:rounded-t-lg",
            "data-[orientation=vertical]:last:rounded-b-lg",
            "data-[orientation=vertical]:first:rounded-b-none",
            "data-[orientation=vertical]:last:rounded-t-none",
            "data-[orientation=vertical]:[&:not(:first-child)]:border-l-0",
            "data-[orientation=vertical]:[&:not(:first-child)]:border-t",
          ],
          // Outline variant - connected buttons with borders
          itemVariant === "outline" && [
            "rounded-none",
            "[&:not(:first-child)]:border-l-0",
            "first:rounded-l-lg last:rounded-r-lg",
            "data-[orientation=vertical]:first:rounded-t-lg",
            "data-[orientation=vertical]:last:rounded-b-lg",
            "data-[orientation=vertical]:first:rounded-b-none",
            "data-[orientation=vertical]:last:rounded-t-none",
            "data-[orientation=vertical]:[&:not(:first-child)]:border-l",
            "data-[orientation=vertical]:[&:not(:first-child)]:border-t-0",
          ],
          // Pills variant - fully rounded
          itemVariant === "pills" && "rounded-full",
          // Separated variant - individual rounded buttons
          itemVariant === "separated" && "rounded-lg",
          "focus:z-10 focus-visible:z-10",
          className
        )}
        {...props}
      >
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <span className="flex-1">{children}</span>
        {badge && (
          <span className="ml-1.5 inline-flex items-center justify-center min-w-5 h-5 px-1.5 text-xs font-medium rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
            {badge}
          </span>
        )}
      </ToggleGroupPrimitive.Item>
    );
  }
);
ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName;

// ---------- Toggle Group Label ----------
const ToggleGroupLabel = React.forwardRef(
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
ToggleGroupLabel.displayName = "ToggleGroupLabel";

// ---------- Toggle Group With Label ----------
const ToggleGroupWithLabel = React.forwardRef(
  (
    {
      label,
      description,
      required,
      className,
      containerClassName,
      children,
      ...props
    },
    ref
  ) => (
    <div className={cn("space-y-2 w-full", containerClassName)}>
      {label && (
        <ToggleGroupLabel required={required}>{label}</ToggleGroupLabel>
      )}
      {description && (
        <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-2 leading-relaxed">
          {description}
        </p>
      )}
      <ToggleGroup ref={ref} className={className} {...props}>
        {children}
      </ToggleGroup>
    </div>
  )
);
ToggleGroupWithLabel.displayName = "ToggleGroupWithLabel";

// ---------- Toggle Group Card ----------
const ToggleGroupCard = React.forwardRef(
  (
    {
      className,
      title,
      description,
      children,
      ...props
    },
    ref
  ) => (
    <div
      className={cn(
        "rounded-xl border border-neutral-200 dark:border-neutral-800",
        "bg-white dark:bg-neutral-900 shadow-sm overflow-hidden p-4 space-y-3",
        className
      )}
    >
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h4 className="text-base font-semibold text-primary-800 dark:text-primary-200">
              {title}
            </h4>
          )}
          {description && (
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {description}
            </p>
          )}
        </div>
      )}
      <ToggleGroup ref={ref} {...props}>
        {children}
      </ToggleGroup>
    </div>
  )
);
ToggleGroupCard.displayName = "ToggleGroupCard";

// ---------- Toggle Group Container ----------
const ToggleGroupContainer = React.forwardRef(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("space-y-2 w-full", className)}
      {...props}
    />
  )
);
ToggleGroupContainer.displayName = "ToggleGroupContainer";

export {
  ToggleGroup,
  ToggleGroupItem,
  ToggleGroupLabel,
  ToggleGroupWithLabel,
  ToggleGroupCard,
  ToggleGroupContainer,
  toggleGroupVariants,
};
