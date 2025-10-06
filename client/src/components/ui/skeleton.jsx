import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

// ---------- Skeleton Variants ----------
const skeletonVariants = cva(
  "relative overflow-hidden rounded-lg",
  {
    variants: {
      variant: {
        default: "bg-neutral-200 dark:bg-neutral-800",
        light: "bg-neutral-100 dark:bg-neutral-900",
        primary: "bg-primary-100 dark:bg-primary-900/30",
      },
      animation: {
        pulse: "animate-pulse",
        shimmer: `
          before:absolute before:inset-0 before:-translate-x-full
          before:animate-shimmer before:bg-gradient-to-r
          before:from-transparent before:via-white/20 before:to-transparent
        `,
        wave: `
          before:absolute before:inset-0 before:-translate-x-full
          before:animate-wave before:bg-gradient-to-r
          before:from-transparent before:via-white/40 before:to-transparent
        `,
        none: "",
      },
    },
    defaultVariants: {
      variant: "default",
      animation: "pulse",
    },
  }
);

// ---------- Skeleton Component ----------
const Skeleton = React.forwardRef(
  (
    {
      className,
      variant = "default",
      animation = "pulse",
      isLoading = true,
      children,
      ...props
    },
    ref
  ) => {
    if (!isLoading && children) {
      return <>{children}</>;
    }

    return (
      <div
        ref={ref}
        data-slot="skeleton"
        aria-busy="true"
        aria-live="polite"
        role="status"
        className={cn(skeletonVariants({ variant, animation }), className)}
        {...props}
      >
        <span className="sr-only">Loading...</span>
      </div>
    );
  }
);
Skeleton.displayName = "Skeleton";

// ---------- Skeleton Text ----------
const SkeletonText = React.forwardRef(
  (
    {
      className,
      lines = 3,
      variant = "default",
      animation = "pulse",
      lastLineWidth = "60%",
      ...props
    },
    ref
  ) => (
    <div ref={ref} className={cn("space-y-2", className)} {...props}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant={variant}
          animation={animation}
          className={cn(
            "h-4 w-full",
            index === lines - 1 && `max-w-[${lastLineWidth}]`
          )}
          style={index === lines - 1 ? { maxWidth: lastLineWidth } : undefined}
        />
      ))}
    </div>
  )
);
SkeletonText.displayName = "SkeletonText";

// ---------- Skeleton Circle ----------
const SkeletonCircle = React.forwardRef(
  (
    {
      className,
      size = "default",
      variant = "default",
      animation = "pulse",
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: "h-8 w-8",
      default: "h-10 w-10",
      lg: "h-12 w-12",
      xl: "h-16 w-16",
    };

    return (
      <Skeleton
        ref={ref}
        variant={variant}
        animation={animation}
        className={cn("rounded-full", sizeClasses[size], className)}
        {...props}
      />
    );
  }
);
SkeletonCircle.displayName = "SkeletonCircle";

// ---------- Skeleton Button ----------
const SkeletonButton = React.forwardRef(
  (
    {
      className,
      size = "default",
      variant = "default",
      animation = "pulse",
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: "h-8 w-20",
      default: "h-9 w-24",
      lg: "h-11 w-28",
    };

    return (
      <Skeleton
        ref={ref}
        variant={variant}
        animation={animation}
        className={cn(sizeClasses[size], className)}
        {...props}
      />
    );
  }
);
SkeletonButton.displayName = "SkeletonButton";

// ---------- Skeleton Avatar ----------
const SkeletonAvatar = React.forwardRef(
  (
    {
      className,
      size = "default",
      withText = false,
      textLines = 2,
      variant = "default",
      animation = "pulse",
      ...props
    },
    ref
  ) => (
    <div ref={ref} className={cn("flex items-center gap-3", className)} {...props}>
      <SkeletonCircle size={size} variant={variant} animation={animation} />
      {withText && (
        <div className="flex-1 space-y-2">
          {Array.from({ length: textLines }).map((_, index) => (
            <Skeleton
              key={index}
              variant={variant}
              animation={animation}
              className={cn("h-3", index === 0 ? "w-24" : "w-16")}
            />
          ))}
        </div>
      )}
    </div>
  )
);
SkeletonAvatar.displayName = "SkeletonAvatar";

// ---------- Skeleton Card ----------
const SkeletonCard = React.forwardRef(
  (
    {
      className,
      hasImage = true,
      imageHeight = "h-48",
      variant = "default",
      animation = "pulse",
      ...props
    },
    ref
  ) => (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden",
        className
      )}
      {...props}
    >
      {hasImage && (
        <Skeleton
          variant={variant}
          animation={animation}
          className={cn("w-full rounded-none", imageHeight)}
        />
      )}
      <div className="p-4 space-y-3">
        <Skeleton variant={variant} animation={animation} className="h-6 w-3/4" />
        <SkeletonText lines={3} variant={variant} animation={animation} />
        <div className="flex gap-2 pt-2">
          <SkeletonButton size="sm" variant={variant} animation={animation} />
          <SkeletonButton size="sm" variant={variant} animation={animation} />
        </div>
      </div>
    </div>
  )
);
SkeletonCard.displayName = "SkeletonCard";

// ---------- Skeleton Table ----------
const SkeletonTable = React.forwardRef(
  (
    {
      className,
      rows = 5,
      columns = 4,
      hasHeader = true,
      variant = "default",
      animation = "pulse",
      ...props
    },
    ref
  ) => (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden",
        className
      )}
      {...props}
    >
      {hasHeader && (
        <div className="flex gap-4 p-4 bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
          {Array.from({ length: columns }).map((_, index) => (
            <Skeleton
              key={index}
              variant={variant}
              animation={animation}
              className="h-4 flex-1"
            />
          ))}
        </div>
      )}
      <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex gap-4 p-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton
                key={colIndex}
                variant={variant}
                animation={animation}
                className="h-4 flex-1"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
);
SkeletonTable.displayName = "SkeletonTable";

// ---------- Skeleton Form ----------
const SkeletonForm = React.forwardRef(
  (
    {
      className,
      fields = 4,
      variant = "default",
      animation = "pulse",
      ...props
    },
    ref
  ) => (
    <div ref={ref} className={cn("space-y-4", className)} {...props}>
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton variant={variant} animation={animation} className="h-4 w-24" />
          <Skeleton variant={variant} animation={animation} className="h-10 w-full" />
        </div>
      ))}
      <div className="flex gap-2 pt-2">
        <SkeletonButton variant={variant} animation={animation} />
        <SkeletonButton variant={variant} animation={animation} />
      </div>
    </div>
  )
);
SkeletonForm.displayName = "SkeletonForm";

// ---------- Skeleton List ----------
const SkeletonList = React.forwardRef(
  (
    {
      className,
      items = 5,
      hasAvatar = true,
      variant = "default",
      animation = "pulse",
      ...props
    },
    ref
  ) => (
    <div ref={ref} className={cn("space-y-4", className)} {...props}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center gap-3">
          {hasAvatar && (
            <SkeletonCircle size="default" variant={variant} animation={animation} />
          )}
          <div className="flex-1 space-y-2">
            <Skeleton variant={variant} animation={animation} className="h-4 w-3/4" />
            <Skeleton variant={variant} animation={animation} className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
);
SkeletonList.displayName = "SkeletonList";

// ---------- Skeleton Container ----------
const SkeletonContainer = React.forwardRef(
  (
    {
      className,
      isLoading = true,
      loadedContent,
      children,
      ...props
    },
    ref
  ) => {
    if (!isLoading && loadedContent) {
      return <>{loadedContent}</>;
    }

    return (
      <div
        ref={ref}
        className={cn("w-full", className)}
        aria-busy={isLoading}
        {...props}
      >
        {children}
      </div>
    );
  }
);
SkeletonContainer.displayName = "SkeletonContainer";

export {
  Skeleton,
  SkeletonText,
  SkeletonCircle,
  SkeletonButton,
  SkeletonAvatar,
  SkeletonCard,
  SkeletonTable,
  SkeletonForm,
  SkeletonList,
  SkeletonContainer,
  skeletonVariants,
};
