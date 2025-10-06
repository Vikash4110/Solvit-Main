import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

// ---------- Badge Variants ----------
const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border font-medium whitespace-nowrap shrink-0 transition-all duration-300 ease-out motion-reduce:transition-none motion-reduce:hover:scale-100",
  {
    variants: {
      variant: {
        default: `
          border-transparent 
          bg-gradient-to-r from-primary-100/90 to-primary-200/80 
          text-primary-800 border border-primary-200/60
          backdrop-blur-sm shadow-sm hover:shadow-md
          hover:scale-105
          dark:from-primary-900/90 dark:to-primary-800/80 dark:text-primary-200 dark:border-primary-800/60
        `,
        "default-lite": `
          bg-primary-100 text-primary-800 border-primary-200
          hover:bg-primary-200
          dark:bg-primary-900 dark:text-primary-200 dark:border-primary-800
        `,
        secondary: `
          border-transparent 
          bg-gradient-to-r from-neutral-100/90 to-neutral-200/80
          text-neutral-800 border border-neutral-200/60
          backdrop-blur-sm shadow-sm hover:shadow-md
          hover:scale-105
          dark:from-neutral-800/90 dark:to-neutral-700/80 dark:text-neutral-200 dark:border-neutral-700/60
        `,
        destructive: `
          border-transparent bg-red-500 text-white 
          hover:bg-red-600 focus-visible:ring-red-500/20 
          dark:bg-red-600 dark:hover:bg-red-700
        `,
        success: `
          bg-gradient-to-r from-green-100/90 to-green-200/80
          text-green-800 border border-green-200/60
          backdrop-blur-sm shadow-sm hover:shadow-md
          hover:scale-105
          dark:from-green-900/90 dark:to-green-800/80 dark:text-green-200 dark:border-green-800/60
        `,
        warning: `
          bg-gradient-to-r from-yellow-100/90 to-yellow-200/80
          text-yellow-800 border border-yellow-200/60
          backdrop-blur-sm shadow-sm hover:shadow-md
          hover:scale-105
          dark:from-yellow-900/90 dark:to-yellow-800/80 dark:text-yellow-200 dark:border-yellow-800/60
        `,
        outline: `
          border-2 border-neutral-300/70 bg-white/80 text-neutral-800
          backdrop-blur-sm shadow-sm hover:shadow-md
          hover:bg-white hover:border-neutral-400/80
          hover:scale-105
          dark:bg-neutral-900/80 dark:text-neutral-200 dark:border-neutral-700
          dark:hover:bg-neutral-800
        `,
      },
      size: {
        sm: "px-2 py-0.5 text-xs gap-1 md:px-3 md:py-1",
        default: "px-3 py-1 text-xs gap-1.5 md:px-4 md:py-2",
        lg: "px-4 py-1.5 text-sm gap-2 md:px-5 md:py-2.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// ---------- Badge Component ----------
const Badge = React.forwardRef(
  ({ className, variant, size, asChild = false, removable = false, onRemove, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "span";

    return (
      <Comp
        ref={ref}
        data-slot="badge"
        className={cn(badgeVariants({ variant, size }), className)}
        {...props}
        role="status"
        aria-live="polite"
      >
        {children}
        {removable && onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="ml-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 p-0.5 transition-colors"
            aria-label="Remove"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </Comp>
    );
  }
);
Badge.displayName = "Badge";

// ---------- Badge Dot Component ----------
function BadgeDot({ className, variant = "default", ...props }) {
  return (
    <span
      className={cn(
        "inline-flex h-2 w-2 rounded-full",
        variant === "default" && "bg-primary-500 dark:bg-primary-400",
        variant === "success" && "bg-green-500 dark:bg-green-400",
        variant === "warning" && "bg-yellow-500 dark:bg-yellow-400",
        variant === "destructive" && "bg-red-500 dark:bg-red-400",
        variant === "secondary" && "bg-neutral-500 dark:bg-neutral-400",
        className
      )}
      {...props}
    />
  );
}

// ---------- Exports ----------
export { Badge, BadgeDot, badgeVariants };
