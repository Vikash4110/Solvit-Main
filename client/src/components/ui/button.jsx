import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

// ---------- Base Styles ----------
const baseButton = `
  inline-flex items-center justify-center font-medium
  transition-all duration-300 ease-out
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
  disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed
  active:scale-[0.98] transform-gpu
  relative overflow-hidden
  rounded-md
  motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:active:scale-100
`;

// ---------- Variants ----------
const buttonVariants = cva(baseButton, {
  variants: {
    variant: {
      default: `
        bg-gradient-to-r from-primary-700 to-primary-800 
        text-white shadow-lg hover:shadow-xl
        hover:from-primary-800 hover:to-primary-900
        focus-visible:ring-primary-500
        before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/0 before:via-white/10 before:to-white/0
        before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700
        motion-reduce:before:transition-none
        backdrop-blur-sm border border-primary-600/20
        font-semibold
        dark:from-primary-600 dark:to-primary-700
      `,
      "default-lite": `
        bg-primary-700 text-white shadow-md hover:shadow-lg
        hover:bg-primary-800 focus-visible:ring-primary-500
        border border-primary-600/20 font-semibold
        dark:bg-primary-600 dark:hover:bg-primary-700
      `,
      secondary: `
        bg-white/90 backdrop-blur-md text-primary-700 
        shadow-md hover:shadow-lg border border-neutral-200
        hover:bg-white hover:scale-[1.02]
        focus-visible:ring-primary-500
        motion-reduce:hover:scale-100
        font-medium
        dark:bg-neutral-800 dark:text-neutral-100 dark:border-neutral-700
        dark:hover:bg-neutral-700
      `,
      outline: `
        border-2 border-primary-400/60 bg-white/80 text-primary-700 
        backdrop-blur-sm shadow-sm hover:shadow-lg
        hover:bg-primary-50/80 hover:border-primary-500 hover:scale-[1.02]
        focus-visible:ring-primary-500
        motion-reduce:hover:scale-100
        font-medium
        dark:bg-neutral-900/80 dark:text-primary-400 dark:border-primary-500/60
        dark:hover:bg-neutral-800
      `,
      ghost: `
        bg-transparent text-primary-700 
        hover:bg-gradient-to-r hover:from-neutral-50/80 hover:to-primary-50/60
        hover:backdrop-blur-sm hover:shadow-md hover:scale-[1.02]
        focus-visible:ring-primary-500
        motion-reduce:hover:scale-100
        font-medium
        dark:text-primary-400 dark:hover:from-neutral-800/80 dark:hover:to-primary-900/60
      `,
      destructive: `
        bg-gradient-to-r from-red-600 to-red-700
        text-white shadow-lg hover:shadow-xl
        hover:from-red-700 hover:to-red-800
        focus-visible:ring-red-500
        font-semibold
        dark:from-red-700 dark:to-red-800
      `,
    },
    size: {
      sm: "h-8 px-3 text-xs gap-1.5 has-[>svg]:px-2.5 md:h-8 md:px-3",
      default: "h-9 px-4 text-sm gap-2 has-[>svg]:px-3 md:h-10 md:px-5",
      lg: "h-10 px-5 text-base gap-2 has-[>svg]:px-4 md:h-11 md:px-6",
      icon: "h-9 w-9 p-0 md:h-10 md:w-10",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

// ---------- Button Component ----------
const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, isLoading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    return (
      <Comp
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      >
        {isLoading && (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        )}
        {children}
      </Comp>
    );
  }
);

Button.displayName = "Button";

// ---------- Exports ----------
export { Button, buttonVariants };
