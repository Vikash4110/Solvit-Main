import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";

// ---------- Avatar Root ----------
const Avatar = React.forwardRef(
  ({ className, size = "md", variant = "default", status, isLoading = false, ...props }, ref) => {
    const sizeMap = {
      sm: "h-7 w-7 text-xs sm:h-8 sm:w-8",
      md: "h-9 w-9 text-sm sm:h-10 sm:w-10",
      lg: "h-12 w-12 text-base sm:h-14 sm:w-14",
      xl: "h-14 w-14 text-lg sm:h-16 sm:w-16",
      "2xl": "h-20 w-20 text-xl sm:h-32 sm:w-32",
   
    };

    const statusSizeMap = {
      sm: "h-2 w-2 border",
      md: "h-2.5 w-2.5 border-2",
      lg: "h-3 w-3 border-2",
      xl: "h-3.5 w-3.5 border-2",
      "2xl": "h-4 w-4 border-2",
    };

    const variantMap = {
      default: "bg-neutral-100 dark:bg-neutral-800",
      "default-lite": "bg-neutral-100 dark:bg-neutral-800",
      glass: "bg-white/20 backdrop-blur-lg border border-white/30 dark:bg-neutral-900/20 dark:border-neutral-800/30",
      primary: "bg-primary-50/50 dark:bg-primary-900/50",
      gradient: "bg-gradient-to-br from-primary-400 to-blue-400 dark:from-primary-600 dark:to-blue-600",
    };

    return (
      <AvatarPrimitive.Root
        ref={ref}
        data-slot="avatar"
        className={cn(
          "relative flex shrink-0 overflow-hidden rounded-full transition-all duration-300 ease-out",
          sizeMap[size],
          variantMap[variant],
          !isLoading && "hover:scale-105 hover:shadow-lg motion-reduce:hover:scale-100",
          "focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none",
          isLoading && "animate-pulse",
          className
        )}
        {...props}
      >
        {props.children}
        {status && !isLoading && (
          <span
            className={cn(
              "absolute bottom-0 right-0 rounded-full border-white dark:border-neutral-900",
              statusSizeMap[size],
              status === "online" && "bg-green-500",
              status === "offline" && "bg-neutral-400",
              status === "away" && "bg-yellow-400",
              status === "busy" && "bg-red-500"
            )}
            aria-label={`Status: ${status}`}
          />
        )}
      </AvatarPrimitive.Root>
    );
  }
);
Avatar.displayName = "Avatar";

// ---------- Avatar Image ----------
const AvatarImage = React.forwardRef(({ className, alt, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    data-slot="avatar-image"
    alt={alt}
    className={cn("aspect-square w-full h-full object-cover", className)}
    {...props}
  />
));
AvatarImage.displayName = "AvatarImage";

// ---------- Avatar Fallback ----------
const AvatarFallback = React.forwardRef(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    data-slot="avatar-fallback"
    className={cn(
      "aspect-square w-full h-full object-cover flex items-center justify-center rounded-full text-white font-semibold",
      "bg-gradient-to-br from-primary-500 to-primary-600",
      "dark:from-primary-600 dark:to-primary-700",
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = "AvatarFallback";

// ---------- Avatar Group ----------
function AvatarGroup({ children, max = 3, className }) {
  const childrenArray = React.Children.toArray(children);
  const displayChildren = max ? childrenArray.slice(0, max) : childrenArray;
  const remaining = max && childrenArray.length > max ? childrenArray.length - max : 0;

  return (
    <div className={cn("flex items-center -space-x-3", className)}>
      {displayChildren.map((child, index) => (
        <div key={index} className="ring-2 ring-white dark:ring-neutral-900 rounded-full">
          {child}
        </div>
      ))}
      {remaining > 0 && (
        <Avatar size="md" variant="default">
          <AvatarFallback>+{remaining}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

// ---------- Exports ----------
export { Avatar, AvatarImage, AvatarFallback, AvatarGroup };
