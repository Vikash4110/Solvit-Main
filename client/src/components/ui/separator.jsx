import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

// ---------- Separator Variants ----------
const separatorVariants = cva(
  "shrink-0 transition-colors duration-200 motion-reduce:transition-none",
  {
    variants: {
      variant: {
        default: "bg-neutral-200 dark:bg-neutral-800",
        primary: "bg-primary-200 dark:bg-primary-900/30",
        muted: "bg-neutral-100 dark:bg-neutral-900",
        gradient: "bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700",
        dashed: "border-t-2 border-dashed border-neutral-300 dark:border-neutral-700 bg-transparent",
        dotted: "border-t-2 border-dotted border-neutral-300 dark:border-neutral-700 bg-transparent",
      },
      size: {
        sm: "",
        default: "",
        lg: "",
        xl: "",
      },
      spacing: {
        none: "",
        sm: "",
        default: "",
        lg: "",
        xl: "",
      },
    },
    compoundVariants: [
      // Horizontal sizes
      {
        size: "sm",
        className: "data-[orientation=horizontal]:h-px",
      },
      {
        size: "default",
        className: "data-[orientation=horizontal]:h-px",
      },
      {
        size: "lg",
        className: "data-[orientation=horizontal]:h-0.5",
      },
      {
        size: "xl",
        className: "data-[orientation=horizontal]:h-1",
      },
      // Vertical sizes
      {
        size: "sm",
        className: "data-[orientation=vertical]:w-px",
      },
      {
        size: "default",
        className: "data-[orientation=vertical]:w-px",
      },
      {
        size: "lg",
        className: "data-[orientation=vertical]:w-0.5",
      },
      {
        size: "xl",
        className: "data-[orientation=vertical]:w-1",
      },
      // Horizontal spacing
      {
        spacing: "none",
        className: "data-[orientation=horizontal]:my-0",
      },
      {
        spacing: "sm",
        className: "data-[orientation=horizontal]:my-2",
      },
      {
        spacing: "default",
        className: "data-[orientation=horizontal]:my-4",
      },
      {
        spacing: "lg",
        className: "data-[orientation=horizontal]:my-6",
      },
      {
        spacing: "xl",
        className: "data-[orientation=horizontal]:my-8",
      },
      // Vertical spacing
      {
        spacing: "none",
        className: "data-[orientation=vertical]:mx-0",
      },
      {
        spacing: "sm",
        className: "data-[orientation=vertical]:mx-2",
      },
      {
        spacing: "default",
        className: "data-[orientation=vertical]:mx-4",
      },
      {
        spacing: "lg",
        className: "data-[orientation=vertical]:mx-6",
      },
      {
        spacing: "xl",
        className: "data-[orientation=vertical]:mx-8",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
      spacing: "none",
    },
  }
);

// ---------- Separator Component ----------
const Separator = React.forwardRef(
  (
    {
      className,
      orientation = "horizontal",
      decorative = true,
      variant,
      size,
      spacing,
      ...props
    },
    ref
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        separatorVariants({ variant, size, spacing }),
        "data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full",
        className
      )}
      {...props}
    />
  )
);
Separator.displayName = SeparatorPrimitive.Root.displayName;

// ---------- Separator With Text ----------
const SeparatorWithText = React.forwardRef(
  (
    {
      className,
      children,
      variant = "default",
      size = "default",
      orientation = "horizontal",
      ...props
    },
    ref
  ) => {
    if (orientation === "vertical") {
      return (
        <div
          ref={ref}
          className={cn("flex flex-col items-center gap-2", className)}
          {...props}
        >
          <Separator orientation="vertical" variant={variant} size={size} />
          <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400 whitespace-nowrap writing-mode-vertical">
            {children}
          </span>
          <Separator orientation="vertical" variant={variant} size={size} />
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn("flex items-center gap-3", className)}
        {...props}
      >
        <Separator variant={variant} size={size} />
        <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
          {children}
        </span>
        <Separator variant={variant} size={size} />
      </div>
    );
  }
);
SeparatorWithText.displayName = "SeparatorWithText";

// ---------- Separator With Icon ----------
const SeparatorWithIcon = React.forwardRef(
  (
    {
      className,
      icon,
      variant = "default",
      size = "default",
      orientation = "horizontal",
      ...props
    },
    ref
  ) => {
    if (orientation === "vertical") {
      return (
        <div
          ref={ref}
          className={cn("flex flex-col items-center gap-2", className)}
          {...props}
        >
          <Separator orientation="vertical" variant={variant} size={size} />
          <div className="flex-shrink-0 text-neutral-500 dark:text-neutral-500">
            {icon}
          </div>
          <Separator orientation="vertical" variant={variant} size={size} />
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn("flex items-center gap-3", className)}
        {...props}
      >
        <Separator variant={variant} size={size} />
        <div className="flex-shrink-0 text-neutral-500 dark:text-neutral-500">
          {icon}
        </div>
        <Separator variant={variant} size={size} />
      </div>
    );
  }
);
SeparatorWithIcon.displayName = "SeparatorWithIcon";

// ---------- Separator Section ----------
const SeparatorSection = React.forwardRef(
  (
    {
      className,
      title,
      description,
      variant = "default",
      size = "default",
      spacing = "default",
      ...props
    },
    ref
  ) => (
    <div
      ref={ref}
      className={cn("space-y-4", className)}
      {...props}
    >
      <Separator variant={variant} size={size} spacing={spacing} />
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
    </div>
  )
);
SeparatorSection.displayName = "SeparatorSection";

// ---------- Separator Card ----------
const SeparatorCard = React.forwardRef(
  (
    {
      className,
      variant = "default",
      size = "default",
      children,
      ...props
    },
    ref
  ) => (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border border-neutral-200 dark:border-neutral-800",
        "bg-white dark:bg-neutral-900 shadow-sm overflow-hidden",
        className
      )}
      {...props}
    >
      {React.Children.map(children, (child, index) => (
        <React.Fragment key={index}>
          {index > 0 && <Separator variant={variant} size={size} />}
          {child}
        </React.Fragment>
      ))}
    </div>
  )
);
SeparatorCard.displayName = "SeparatorCard";

// ---------- Separator List ----------
const SeparatorList = React.forwardRef(
  (
    {
      className,
      variant = "default",
      size = "default",
      children,
      spacing = "default",
      ...props
    },
    ref
  ) => {
    const spacingClasses = {
      none: "space-y-0",
      sm: "space-y-2",
      default: "space-y-4",
      lg: "space-y-6",
      xl: "space-y-8",
    };

    return (
      <div
        ref={ref}
        className={cn(spacingClasses[spacing], className)}
        {...props}
      >
        {React.Children.map(children, (child, index) => (
          <React.Fragment key={index}>
            {index > 0 && <Separator variant={variant} size={size} />}
            {child}
          </React.Fragment>
        ))}
      </div>
    );
  }
);
SeparatorList.displayName = "SeparatorList";

// ---------- Separator Breadcrumb ----------
const SeparatorBreadcrumb = React.forwardRef(
  (
    {
      className,
      items = [],
      separator = "/",
      variant = "default",
      ...props
    },
    ref
  ) => (
    <nav
      ref={ref}
      aria-label="Breadcrumb"
      className={cn("flex items-center gap-2", className)}
      {...props}
    >
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <span className="text-neutral-400 dark:text-neutral-600 text-sm">
              {separator}
            </span>
          )}
          {typeof item === "string" ? (
            <span
              className={cn(
                "text-sm",
                index === items.length - 1
                  ? "text-primary-700 dark:text-primary-400 font-medium"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
              )}
            >
              {item}
            </span>
          ) : (
            item
          )}
        </React.Fragment>
      ))}
    </nav>
  )
);
SeparatorBreadcrumb.displayName = "SeparatorBreadcrumb";

// ---------- Separator Fade ----------
const SeparatorFade = React.forwardRef(
  (
    {
      className,
      orientation = "horizontal",
      variant = "gradient",
      ...props
    },
    ref
  ) => (
    <Separator
      ref={ref}
      orientation={orientation}
      variant={variant}
      className={cn(
        orientation === "horizontal"
          ? "bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700"
          : "bg-gradient-to-b from-transparent via-neutral-300 to-transparent dark:via-neutral-700",
        className
      )}
      {...props}
    />
  )
);
SeparatorFade.displayName = "SeparatorFade";

// ---------- Separator Ornament ----------
const SeparatorOrnament = React.forwardRef(
  (
    {
      className,
      variant = "default",
      size = "default",
      ...props
    },
    ref
  ) => (
    <div
      ref={ref}
      className={cn("flex items-center gap-2", className)}
      {...props}
    >
      <Separator variant={variant} size={size} />
      <div className="flex gap-1">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-1 w-1 rounded-full bg-neutral-400 dark:bg-neutral-600"
          />
        ))}
      </div>
      <Separator variant={variant} size={size} />
    </div>
  )
);
SeparatorOrnament.displayName = "SeparatorOrnament";

export {
  Separator,
  SeparatorWithText,
  SeparatorWithIcon,
  SeparatorSection,
  SeparatorCard,
  SeparatorList,
  SeparatorBreadcrumb,
  SeparatorFade,
  SeparatorOrnament,
  separatorVariants,
};
