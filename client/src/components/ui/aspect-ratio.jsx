import * as React from "react";
import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio";
import { cn } from "@/lib/utils";

// ---------- Aspect Ratio Presets ----------
const aspectRatioPresets = {
  square: 1 / 1,        // 1:1
  video: 16 / 9,        // 16:9
  "video-vertical": 9 / 16, // 9:16 (Stories, Reels)
  portrait: 3 / 4,      // 3:4
  landscape: 4 / 3,     // 4:3
  ultrawide: 21 / 9,    // 21:9
  golden: 1.618 / 1,    // Golden ratio
  "2:1": 2 / 1,
  "3:2": 3 / 2,
  "4:5": 4 / 5,
};

// ---------- Aspect Ratio Component ----------
const AspectRatio = React.forwardRef(
  ({ 
    className, 
    ratio, 
    preset,
    isLoading = false,
    variant = "default",
    children,
    ...props 
  }, ref) => {
    const finalRatio = preset ? aspectRatioPresets[preset] : ratio;

    const variantClasses = {
      default: "",
      rounded: "rounded-lg overflow-hidden",
      "rounded-xl": "rounded-xl overflow-hidden",
      "rounded-2xl": "rounded-2xl overflow-hidden",
      bordered: "rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800",
      elevated: "rounded-xl overflow-hidden shadow-md",
    };

    return (
      <AspectRatioPrimitive.Root
        ref={ref}
        data-slot="aspect-ratio"
        ratio={finalRatio}
        className={cn(
          "relative w-full",
          variantClasses[variant],
          isLoading && "animate-pulse bg-neutral-200 dark:bg-neutral-800",
          className
        )}
        {...props}
      >
        {children}
      </AspectRatioPrimitive.Root>
    );
  }
);
AspectRatio.displayName = "AspectRatio";

// ---------- Aspect Ratio Image ----------
const AspectRatioImage = React.forwardRef(
  ({ className, alt, objectFit = "cover", ...props }, ref) => (
    <img
      ref={ref}
      alt={alt}
      className={cn(
        "h-full w-full",
        objectFit === "cover" && "object-cover",
        objectFit === "contain" && "object-contain",
        objectFit === "fill" && "object-fill",
        objectFit === "none" && "object-none",
        className
      )}
      loading="lazy"
      {...props}
    />
  )
);
AspectRatioImage.displayName = "AspectRatioImage";

// ---------- Aspect Ratio Video ----------
const AspectRatioVideo = React.forwardRef(
  ({ className, ...props }, ref) => (
    <video
      ref={ref}
      className={cn(
        "h-full w-full object-cover",
        className
      )}
      {...props}
    />
  )
);
AspectRatioVideo.displayName = "AspectRatioVideo";

// ---------- Aspect Ratio Skeleton ----------
function AspectRatioSkeleton({ ratio, preset, variant = "rounded", className }) {
  return (
    <AspectRatio
      ratio={ratio}
      preset={preset}
      variant={variant}
      isLoading
      className={className}
    >
      <div className="flex h-full w-full items-center justify-center bg-neutral-100 dark:bg-neutral-800">
        <svg
          className="h-10 w-10 text-neutral-300 dark:text-neutral-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    </AspectRatio>
  );
}

export { 
  AspectRatio, 
  AspectRatioImage, 
  AspectRatioVideo, 
  AspectRatioSkeleton,
  aspectRatioPresets 
};
