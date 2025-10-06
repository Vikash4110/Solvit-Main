"use client";

import * as React from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const CarouselContext = React.createContext(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }

  return context;
}

// ---------- Carousel Root ----------
function Carousel({
  orientation = "horizontal",
  opts,
  setApi,
  plugins,
  className,
  children,
  variant = "default",
  showControls = true,
  showIndicators = false,
  autoplay = false,
  autoplayDelay = 3000,
  ...props
}) {
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === "horizontal" ? "x" : "y",
    },
    plugins
  );
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [scrollSnaps, setScrollSnaps] = React.useState([]);

  const onSelect = React.useCallback((api) => {
    if (!api) return;
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
    setSelectedIndex(api.selectedScrollSnap());
  }, []);

  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev();
  }, [api]);

  const scrollNext = React.useCallback(() => {
    api?.scrollNext();
  }, [api]);

  const scrollTo = React.useCallback(
    (index) => {
      api?.scrollTo(index);
    },
    [api]
  );

  const handleKeyDown = React.useCallback(
    (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollNext();
      }
    },
    [scrollPrev, scrollNext]
  );

  React.useEffect(() => {
    if (!api || !setApi) return;
    setApi(api);
  }, [api, setApi]);

  React.useEffect(() => {
    if (!api) return;
    onSelect(api);
    setScrollSnaps(api.scrollSnapList());
    api.on("reInit", onSelect);
    api.on("select", onSelect);

    return () => {
      api?.off("select", onSelect);
    };
  }, [api, onSelect]);

  // Autoplay functionality
  React.useEffect(() => {
    if (!autoplay || !api) return;

    const interval = setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext();
      } else {
        api.scrollTo(0);
      }
    }, autoplayDelay);

    return () => clearInterval(interval);
  }, [api, autoplay, autoplayDelay]);

  const variantClasses = {
    default: "",
    glass: `
      bg-white/10 backdrop-blur-xl border border-white/20
      rounded-2xl p-4 sm:p-6
      dark:bg-neutral-900/10 dark:border-neutral-800/20
    `,
    elevated: `
      bg-gradient-to-br from-white to-neutral-50/90
      backdrop-blur-lg border border-neutral-200/60
      rounded-2xl shadow-xl p-4 sm:p-6
      dark:from-neutral-900 dark:to-neutral-800/90
      dark:border-neutral-800/60
    `,
  };

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api: api,
        opts,
        orientation:
          orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
        scrollPrev,
        scrollNext,
        scrollTo,
        canScrollPrev,
        canScrollNext,
        selectedIndex,
        scrollSnaps,
        showControls,
        showIndicators,
      }}
    >
      <div
        onKeyDownCapture={handleKeyDown}
        className={cn(
          "relative group/carousel",
          variantClasses[variant],
          className
        )}
        role="region"
        aria-roledescription="carousel"
        data-slot="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
}

// ---------- Carousel Content ----------
const CarouselContent = React.forwardRef(({ className, ...props }, ref) => {
  const { carouselRef, orientation } = useCarousel();

  return (
    <div
      ref={carouselRef}
      className="overflow-hidden rounded-xl"
      data-slot="carousel-content"
    >
      <div
        ref={ref}
        className={cn(
          "flex",
          orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
          className
        )}
        {...props}
      />
    </div>
  );
});
CarouselContent.displayName = "CarouselContent";

// ---------- Carousel Item ----------
const CarouselItem = React.forwardRef(({ className, ...props }, ref) => {
  const { orientation } = useCarousel();

  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className
      )}
      {...props}
    />
  );
});
CarouselItem.displayName = "CarouselItem";

// ---------- Carousel Previous ----------
const CarouselPrevious = React.forwardRef(
  (
    {
      className,
      variant = "default",
      size = "icon",
      position = "inside",
      ...props
    },
    ref
  ) => {
    const { orientation, scrollPrev, canScrollPrev, showControls } =
      useCarousel();

    if (!showControls) return null;

    const positionClasses = {
      inside: orientation === "horizontal"
        ? "left-2 sm:left-4 top-1/2 -translate-y-1/2"
        : "top-2 sm:top-4 left-1/2 -translate-x-1/2 rotate-90",
      outside: orientation === "horizontal"
        ? "-left-12 top-1/2 -translate-y-1/2"
        : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
    };

    return (
      <Button
        ref={ref}
        data-slot="carousel-previous"
        variant={variant}
        size={size}
        className={cn(
          "absolute z-10 h-8 w-8 sm:h-10 sm:w-10 rounded-full",
          "shadow-lg hover:shadow-xl",
          "transition-all duration-200",
          "motion-reduce:transition-none",
          "opacity-0 group-hover/carousel:opacity-100",
          "disabled:opacity-0",
          positionClasses[position],
          className
        )}
        disabled={!canScrollPrev}
        onClick={scrollPrev}
        aria-label="Previous slide"
        {...props}
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="sr-only">Previous slide</span>
      </Button>
    );
  }
);
CarouselPrevious.displayName = "CarouselPrevious";

// ---------- Carousel Next ----------
const CarouselNext = React.forwardRef(
  (
    {
      className,
      variant = "default",
      size = "icon",
      position = "inside",
      ...props
    },
    ref
  ) => {
    const { orientation, scrollNext, canScrollNext, showControls } =
      useCarousel();

    if (!showControls) return null;

    const positionClasses = {
      inside: orientation === "horizontal"
        ? "right-2 sm:right-4 top-1/2 -translate-y-1/2"
        : "bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 rotate-90",
      outside: orientation === "horizontal"
        ? "-right-12 top-1/2 -translate-y-1/2"
        : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
    };

    return (
      <Button
        ref={ref}
        data-slot="carousel-next"
        variant={variant}
        size={size}
        className={cn(
          "absolute z-10 h-8 w-8 sm:h-10 sm:w-10 rounded-full",
          "shadow-lg hover:shadow-xl",
          "transition-all duration-200",
          "motion-reduce:transition-none",
          "opacity-0 group-hover/carousel:opacity-100",
          "disabled:opacity-0",
          positionClasses[position],
          className
        )}
        disabled={!canScrollNext}
        onClick={scrollNext}
        aria-label="Next slide"
        {...props}
      >
        <ArrowRight className="h-4 w-4" />
        <span className="sr-only">Next slide</span>
      </Button>
    );
  }
);
CarouselNext.displayName = "CarouselNext";

// ---------- Carousel Indicators ----------
function CarouselIndicators({ className, variant = "dots", ...props }) {
  const { scrollSnaps, selectedIndex, scrollTo, showIndicators } =
    useCarousel();

  if (!showIndicators || scrollSnaps.length <= 1) return null;

  const variantClasses = {
    dots: "gap-2",
    lines: "gap-1.5",
    numbers: "gap-2",
  };

  return (
    <div
      data-slot="carousel-indicators"
      className={cn(
        "absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-10",
        "flex items-center justify-center",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {scrollSnaps.map((_, index) => (
        <button
          key={index}
          onClick={() => scrollTo(index)}
          className={cn(
            "transition-all duration-200",
            "motion-reduce:transition-none",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
            // Dots variant
            variant === "dots" &&
              cn(
                "h-2 w-2 rounded-full",
                selectedIndex === index
                  ? "bg-primary-700 dark:bg-primary-500 w-6"
                  : "bg-neutral-300 dark:bg-neutral-700 hover:bg-neutral-400 dark:hover:bg-neutral-600"
              ),
            // Lines variant
            variant === "lines" &&
              cn(
                "h-1 w-8 rounded-full",
                selectedIndex === index
                  ? "bg-primary-700 dark:bg-primary-500 w-12"
                  : "bg-neutral-300 dark:bg-neutral-700 hover:bg-neutral-400 dark:hover:bg-neutral-600"
              ),
            // Numbers variant
            variant === "numbers" &&
              cn(
                "h-6 w-6 sm:h-7 sm:w-7 rounded-full text-xs font-semibold",
                selectedIndex === index
                  ? "bg-primary-700 dark:bg-primary-600 text-white"
                  : "bg-white/80 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-800"
              )
          )}
          aria-label={`Go to slide ${index + 1}`}
          aria-current={selectedIndex === index ? "true" : "false"}
        >
          {variant === "numbers" && (
            <span className="sr-only sm:not-sr-only">{index + 1}</span>
          )}
        </button>
      ))}
    </div>
  );
}

// ---------- Carousel Progress ----------
function CarouselProgress({ className, ...props }) {
  const { scrollSnaps, selectedIndex } = useCarousel();

  if (scrollSnaps.length <= 1) return null;

  const progress = ((selectedIndex + 1) / scrollSnaps.length) * 100;

  return (
    <div
      data-slot="carousel-progress"
      className={cn(
        "absolute bottom-0 left-0 right-0 h-1 bg-neutral-200 dark:bg-neutral-800",
        className
      )}
      {...props}
    >
      <div
        className="h-full bg-primary-700 dark:bg-primary-600 transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
        role="progressbar"
        aria-valuenow={selectedIndex + 1}
        aria-valuemin={1}
        aria-valuemax={scrollSnaps.length}
        aria-label={`Slide ${selectedIndex + 1} of ${scrollSnaps.length}`}
      />
    </div>
  );
}

// ---------- Carousel Counter ----------
function CarouselCounter({ className, ...props }) {
  const { scrollSnaps, selectedIndex } = useCarousel();

  if (scrollSnaps.length <= 1) return null;

  return (
    <div
      data-slot="carousel-counter"
      className={cn(
        "absolute top-3 right-3 sm:top-4 sm:right-4 z-10",
        "bg-black/60 backdrop-blur-md text-white",
        "px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full",
        "text-xs sm:text-sm font-medium",
        className
      )}
      {...props}
    >
      {selectedIndex + 1} / {scrollSnaps.length}
    </div>
  );
}

export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselIndicators,
  CarouselProgress,
  CarouselCounter,
};
