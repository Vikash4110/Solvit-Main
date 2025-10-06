"use client";

import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

// ---------- Scroll Area Root ----------
const ScrollArea = React.forwardRef(
  (
    {
      className,
      children,
      variant = "default",
      type = "hover",
      scrollHideDelay = 600,
      ...props
    },
    ref
  ) => {
    const variantClasses = {
      default: "rounded-lg",
      minimal: "rounded-md",
      bordered: "rounded-lg border border-neutral-200 dark:border-neutral-800",
      elevated: `
        rounded-xl border border-neutral-200 dark:border-neutral-800
        shadow-sm
      `,
    };

    return (
      <ScrollAreaPrimitive.Root
        ref={ref}
        data-slot="scroll-area"
        type={type}
        scrollHideDelay={scrollHideDelay}
        className={cn("relative overflow-hidden", variantClasses[variant], className)}
        {...props}
      >
        <ScrollAreaPrimitive.Viewport
          data-slot="scroll-area-viewport"
          className={cn(
            "h-full w-full rounded-[inherit]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30"
          )}
        >
          {children}
        </ScrollAreaPrimitive.Viewport>
        <ScrollBar />
        <ScrollBar orientation="horizontal" />
        <ScrollAreaPrimitive.Corner />
      </ScrollAreaPrimitive.Root>
    );
  }
);
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

// ---------- Scroll Bar Variants ----------
const scrollBarVariants = cva(
  "flex touch-none select-none transition-all duration-200 motion-reduce:transition-none",
  {
    variants: {
      variant: {
        default: "p-0.5",
        minimal: "p-px",
        thick: "p-1",
      },
      orientation: {
        vertical: "h-full w-2.5 border-l border-l-transparent",
        horizontal: "h-2.5 w-full flex-col border-t border-t-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
      orientation: "vertical",
    },
  }
);

// ---------- Scroll Bar ----------
const ScrollBar = React.forwardRef(
  (
    {
      className,
      orientation = "vertical",
      variant = "default",
      ...props
    },
    ref
  ) => (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      ref={ref}
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      className={cn(
        scrollBarVariants({ variant, orientation }),
        "hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50",
        className
      )}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb
        data-slot="scroll-area-thumb"
        className={cn(
          "relative flex-1 rounded-full",
          "bg-neutral-400 dark:bg-neutral-600",
          "hover:bg-neutral-500 dark:hover:bg-neutral-500",
          "transition-colors duration-200",
          "motion-reduce:transition-none"
        )}
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  )
);
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

// ---------- Scroll Area with Fade ----------
const ScrollAreaWithFade = React.forwardRef(
  (
    {
      className,
      children,
      fadeSize = "default",
      variant = "default",
      ...props
    },
    ref
  ) => {
    const fadeSizeClasses = {
      sm: "h-8",
      default: "h-12",
      lg: "h-16",
      xl: "h-20",
    };

    return (
      <div className="relative">
        <ScrollArea
          ref={ref}
          variant={variant}
          className={className}
          {...props}
        >
          {children}
        </ScrollArea>
        {/* Top fade */}
        <div
          className={cn(
            "pointer-events-none absolute top-0 left-0 right-0 z-10",
            "bg-gradient-to-b from-white to-transparent",
            "dark:from-neutral-900",
            fadeSizeClasses[fadeSize]
          )}
        />
        {/* Bottom fade */}
        <div
          className={cn(
            "pointer-events-none absolute bottom-0 left-0 right-0 z-10",
            "bg-gradient-to-t from-white to-transparent",
            "dark:from-neutral-900",
            fadeSizeClasses[fadeSize]
          )}
        />
      </div>
    );
  }
);
ScrollAreaWithFade.displayName = "ScrollAreaWithFade";

// ---------- Scroll Area Content ----------
const ScrollAreaContent = React.forwardRef(
  ({ className, padding = "default", ...props }, ref) => {
    const paddingClasses = {
      none: "p-0",
      sm: "p-2",
      default: "p-4",
      lg: "p-6",
      xl: "p-8",
    };

    return (
      <div
        ref={ref}
        className={cn(paddingClasses[padding], className)}
        {...props}
      />
    );
  }
);
ScrollAreaContent.displayName = "ScrollAreaContent";

// ---------- Scroll Area List ----------
const ScrollAreaList = React.forwardRef(
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
        className={cn("p-4", spacingClasses[spacing], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
ScrollAreaList.displayName = "ScrollAreaList";

// ---------- Scroll Area Header ----------
const ScrollAreaHeader = React.forwardRef(
  ({ className, sticky = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "px-4 py-3 border-b border-neutral-200 dark:border-neutral-800",
        "bg-white dark:bg-neutral-900",
        sticky && "sticky top-0 z-10",
        className
      )}
      {...props}
    />
  )
);
ScrollAreaHeader.displayName = "ScrollAreaHeader";

// ---------- Scroll Area Footer ----------
const ScrollAreaFooter = React.forwardRef(
  ({ className, sticky = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "px-4 py-3 border-t border-neutral-200 dark:border-neutral-800",
        "bg-white dark:bg-neutral-900",
        sticky && "sticky bottom-0 z-10",
        className
      )}
      {...props}
    />
  )
);
ScrollAreaFooter.displayName = "ScrollAreaFooter";

// ---------- Scroll Area Card ----------
const ScrollAreaCard = React.forwardRef(
  (
    {
      className,
      title,
      description,
      footer,
      children,
      variant = "default",
      maxHeight = "96",
      ...props
    },
    ref
  ) => {
    const maxHeightClass = `max-h-${maxHeight}`;

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl border border-neutral-200 dark:border-neutral-800",
          "bg-white dark:bg-neutral-900 shadow-sm overflow-hidden",
          className
        )}
        {...props}
      >
        {(title || description) && (
          <ScrollAreaHeader sticky>
            {title && (
              <h3 className="text-base font-semibold text-primary-800 dark:text-primary-200">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                {description}
              </p>
            )}
          </ScrollAreaHeader>
        )}

        <ScrollArea variant="minimal" className={maxHeightClass}>
          <ScrollAreaContent>{children}</ScrollAreaContent>
        </ScrollArea>

        {footer && <ScrollAreaFooter sticky>{footer}</ScrollAreaFooter>}
      </div>
    );
  }
);
ScrollAreaCard.displayName = "ScrollAreaCard";

// ---------- Scroll Area with Shadow Indicator ----------
const ScrollAreaWithIndicators = React.forwardRef(
  ({ className, children, variant = "default", ...props }, ref) => {
    const viewportRef = React.useRef(null);
    const [showTopShadow, setShowTopShadow] = React.useState(false);
    const [showBottomShadow, setShowBottomShadow] = React.useState(true);

    const handleScroll = React.useCallback(() => {
      const viewport = viewportRef.current;
      if (!viewport) return;

      const { scrollTop, scrollHeight, clientHeight } = viewport;
      setShowTopShadow(scrollTop > 0);
      setShowBottomShadow(scrollTop + clientHeight < scrollHeight - 1);
    }, []);

    React.useEffect(() => {
      const viewport = viewportRef.current;
      if (!viewport) return;

      viewport.addEventListener("scroll", handleScroll);
      handleScroll(); // Initial check

      return () => viewport.removeEventListener("scroll", handleScroll);
    }, [handleScroll]);

    return (
      <div className="relative">
        {showTopShadow && (
          <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-black/10 to-transparent z-10 pointer-events-none dark:from-black/30" />
        )}
        <ScrollArea ref={ref} variant={variant} className={className} {...props}>
          <div ref={viewportRef}>{children}</div>
        </ScrollArea>
        {showBottomShadow && (
          <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-black/10 to-transparent z-10 pointer-events-none dark:from-black/30" />
        )}
      </div>
    );
  }
);
ScrollAreaWithIndicators.displayName = "ScrollAreaWithIndicators";

// ---------- Horizontal Scroll Area ----------
const ScrollAreaHorizontal = React.forwardRef(
  ({ className, children, variant = "default", ...props }, ref) => (
    <ScrollArea
      ref={ref}
      variant={variant}
      className={className}
      {...props}
    >
      <div className="flex gap-4 p-4">{children}</div>
    </ScrollArea>
  )
);
ScrollAreaHorizontal.displayName = "ScrollAreaHorizontal";

export {
  ScrollArea,
  ScrollBar,
  ScrollAreaWithFade,
  ScrollAreaContent,
  ScrollAreaList,
  ScrollAreaHeader,
  ScrollAreaFooter,
  ScrollAreaCard,
  ScrollAreaWithIndicators,
  ScrollAreaHorizontal,
  scrollBarVariants,
};
