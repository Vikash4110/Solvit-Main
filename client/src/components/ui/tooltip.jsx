import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

// ---------- Tooltip Provider ----------
const TooltipProvider = TooltipPrimitive.Provider;

// ---------- Tooltip Root ----------
const Tooltip = TooltipPrimitive.Root;

// ---------- Tooltip Trigger ----------
const TooltipTrigger = TooltipPrimitive.Trigger;

// ---------- Tooltip Portal ----------
const TooltipPortal = TooltipPrimitive.Portal;

// ---------- Tooltip Arrow ----------
const TooltipArrow = TooltipPrimitive.Arrow;

// ---------- Tooltip Content Variants ----------
const tooltipContentVariants = cva(
  "z-50 overflow-hidden rounded-lg text-xs animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 motion-reduce:animate-none",
  {
    variants: {
      variant: {
        default: `
          bg-neutral-900 text-white
          dark:bg-neutral-100 dark:text-neutral-900
        `,
        inverse: `
          bg-white text-neutral-900 border border-neutral-200 shadow-md
          dark:bg-neutral-900 dark:text-white dark:border-neutral-800
        `,
        primary: `
          bg-primary-700 text-white
          dark:bg-primary-600
        `,
        success: `
          bg-green-700 text-white
          dark:bg-green-600
        `,
        warning: `
          bg-yellow-700 text-white
          dark:bg-yellow-600
        `,
        destructive: `
          bg-red-700 text-white
          dark:bg-red-600
        `,
      },
      size: {
        sm: "px-2 py-1 text-xs max-w-[200px]",
        default: "px-3 py-1.5 text-xs max-w-[250px]",
        lg: "px-4 py-2 text-sm max-w-[300px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// ---------- Tooltip Content ----------
const TooltipContent = React.forwardRef(
  (
    {
      className,
      sideOffset = 4,
      variant = "default",
      size = "default",
      showArrow = true,
      children,
      ...props
    },
    ref
  ) => (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
          tooltipContentVariants({ variant, size }),
          "origin-[var(--radix-tooltip-content-transform-origin)]",
          className
        )}
        {...props}
      >
        {children}
        {showArrow && (
          <TooltipPrimitive.Arrow
            className={cn(
              "fill-current",
              variant === "default" && "fill-neutral-900 dark:fill-neutral-100",
              variant === "inverse" && "fill-white dark:fill-neutral-900",
              variant === "primary" && "fill-primary-700 dark:fill-primary-600",
              variant === "success" && "fill-green-700 dark:fill-green-600",
              variant === "warning" && "fill-yellow-700 dark:fill-yellow-600",
              variant === "destructive" && "fill-red-700 dark:fill-red-600"
            )}
            width={10}
            height={5}
          />
        )}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
);
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

// ---------- Tooltip Simple ----------
function TooltipSimple({
  content,
  children,
  side = "top",
  align = "center",
  variant = "default",
  size = "default",
  showArrow = true,
  delayDuration = 200,
  className,
  contentClassName,
  asChild = true,
  ...props
}) {
  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild={asChild} className={className}>
          {children}
        </TooltipTrigger>
        <TooltipContent
          side={side}
          align={align}
          variant={variant}
          size={size}
          showArrow={showArrow}
          className={contentClassName}
          {...props}
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ---------- Tooltip with Title ----------
function TooltipWithTitle({ title, description, children, ...props }) {
  return (
    <TooltipSimple
      content={
        <div className="space-y-1">
          <div className="font-semibold text-sm">{title}</div>
          <div className="text-xs opacity-90 leading-relaxed">
            {description}
          </div>
        </div>
      }
      size="lg"
      {...props}
    >
      {children}
    </TooltipSimple>
  );
}

// ---------- Tooltip with Shortcut ----------
function TooltipWithShortcut({ content, shortcut, children, ...props }) {
  return (
    <TooltipSimple
      content={
        <div className="flex items-center gap-2">
          <span>{content}</span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-black/20 dark:bg-white/20 rounded border border-black/10 dark:border-white/10">
            {shortcut}
          </kbd>
        </div>
      }
      {...props}
    >
      {children}
    </TooltipSimple>
  );
}

// ---------- Tooltip with Icon ----------
function TooltipWithIcon({ content, icon, children, ...props }) {
  return (
    <TooltipSimple
      content={
        <div className="flex items-start gap-2">
          <div className="flex-shrink-0 mt-0.5">{icon}</div>
          <div className="flex-1">{content}</div>
        </div>
      }
      size="lg"
      {...props}
    >
      {children}
    </TooltipSimple>
  );
}

// ---------- Tooltip Info ----------
function TooltipInfo({ children, className, ...props }) {
  return (
    <TooltipSimple content={children} variant="inverse" {...props}>
      <button
        type="button"
        className={cn(
          "inline-flex items-center justify-center",
          "h-4 w-4 rounded-full",
          "bg-neutral-200 dark:bg-neutral-800",
          "text-neutral-600 dark:text-neutral-400",
          "hover:bg-neutral-300 dark:hover:bg-neutral-700",
          "transition-colors duration-200",
          "text-xs font-medium",
          className
        )}
      >
        ?
      </button>
    </TooltipSimple>
  );
}

// ---------- Tooltip Help ----------
function TooltipHelp({ content, className }) {
  return (
    <TooltipSimple content={content} side="top">
      <span
        className={cn(
          "inline-flex items-center justify-center cursor-help",
          "h-4 w-4 rounded-full border border-neutral-300 dark:border-neutral-700",
          "text-neutral-500 dark:text-neutral-400",
          "hover:border-primary-500 hover:text-primary-700 dark:hover:text-primary-400",
          "transition-colors duration-200",
          "text-[10px] font-bold",
          className
        )}
      >
        ?
      </span>
    </TooltipSimple>
  );
}

export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  TooltipPortal,
  TooltipArrow,
  TooltipSimple,
  TooltipWithTitle,
  TooltipWithShortcut,
  TooltipWithIcon,
  TooltipInfo,
  TooltipHelp,
  tooltipContentVariants,
};
