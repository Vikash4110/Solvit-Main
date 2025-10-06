import * as React from "react";
import { cn } from "@/lib/utils";

// ---------- Card Variants ----------
const cardVariants = {
  default: `
    bg-white/95 backdrop-blur-md border border-neutral-200
    shadow-lg rounded-2xl overflow-hidden
    transition-all duration-300 ease-out
    hover:scale-[1.005] hover:shadow-xl
    motion-reduce:transition-none motion-reduce:hover:scale-100
    dark:bg-neutral-900/95 dark:border-neutral-800
  `,
  "default-lite": `
    bg-white border border-neutral-200
    shadow-md rounded-xl overflow-hidden
    transition-all duration-300 ease-out
    hover:shadow-lg
    motion-reduce:transition-none
    dark:bg-neutral-900 dark:border-neutral-800
  `,
  glass: `
    bg-white/20 backdrop-blur-xl border border-white/30
    shadow-xl rounded-3xl overflow-hidden
    transition-all duration-500 ease-out
    hover:bg-white/30 hover:border-white/50 hover:scale-[1.01] hover:-translate-y-1
    motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:hover:translate-y-0
    dark:bg-neutral-900/20 dark:border-neutral-800/30
  `,
  elevated: `
    bg-gradient-to-br from-white to-neutral-50/90
    backdrop-blur-lg border border-neutral-200/60
    shadow-xl rounded-2xl overflow-hidden
    transition-all duration-300 ease-out
    hover:scale-[1.01] hover:-translate-y-1 hover:shadow-2xl
    motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:hover:translate-y-0
    dark:from-neutral-900 dark:to-neutral-800/90 dark:border-neutral-800/60
  `,
  subtle: `
    bg-gradient-to-br from-neutral-50/90 to-neutral-100/60
    backdrop-blur-sm border border-neutral-200/60
    shadow-sm rounded-xl overflow-hidden
    transition-all duration-300 ease-out
    hover:shadow-md hover:scale-[1.005]
    motion-reduce:transition-none motion-reduce:hover:scale-100
    dark:from-neutral-900/90 dark:to-neutral-800/60 dark:border-neutral-800/60
  `,
};

// ---------- Card Header Variants ----------
const cardHeaderVariants = {
  default: `
    @container/card-header grid auto-rows-min items-start gap-1.5 
    px-4 py-3 sm:px-6 sm:py-4
    has-data-[slot=card-action]:grid-cols-[1fr_auto]
  `,
  gradient: `
    px-4 py-4 sm:px-8 sm:py-6 
    bg-gradient-to-r from-transparent via-primary-50/20 to-transparent
    dark:via-primary-900/20
  `,
  bordered: `
    px-4 py-4 sm:px-8 sm:py-6 
    border-b border-neutral-200/50
    dark:border-neutral-800/50
  `,
};

// ---------- Card Title Variants ----------
const cardTitleVariants = {
  default: "leading-none font-semibold text-base sm:text-lg text-primary-800 dark:text-primary-200",
  gradient: `
    text-lg sm:text-xl font-bold leading-tight tracking-tight
    bg-gradient-to-r from-primary-800 to-primary-600 bg-clip-text text-transparent
    dark:from-primary-400 dark:to-primary-300
  `,
  large: `
    text-xl sm:text-2xl font-bold leading-tight tracking-tight
    bg-gradient-to-r from-primary-800 to-primary-600 bg-clip-text text-transparent
    dark:from-primary-400 dark:to-primary-300
  `,
};

// ---------- Card Components ----------
function Card({ className, variant = "default", isLoading = false, ...props }) {
  return (
    <div 
      data-slot="card" 
      className={cn(
        cardVariants[variant], 
        isLoading && "animate-pulse pointer-events-none",
        className
      )} 
      {...props} 
    />
  );
}

function CardHeader({ className, variant = "default", ...props }) {
  return (
    <div data-slot="card-header" className={cn(cardHeaderVariants[variant], className)} {...props} />
  );
}

function CardTitle({ className, variant = "default", ...props }) {
  return (
    <div data-slot="card-title" className={cn(cardTitleVariants[variant], className)} {...props} />
  );
}

function CardDescription({ className, ...props }) {
  return (
    <div 
      data-slot="card-description" 
      className={cn("text-muted-foreground text-xs sm:text-sm dark:text-neutral-400", className)} 
      {...props} 
    />
  );
}

function CardAction({ className, ...props }) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-4 pb-4 sm:px-6 sm:pb-6 text-neutral-700 dark:text-neutral-300 leading-relaxed text-sm sm:text-base", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-4 pt-4 sm:px-6 sm:pt-6", className)}
      {...props}
    />
  );
}

// ---------- Skeleton Component ----------
function CardSkeleton({ className }) {
  return (
    <Card variant="default-lite" isLoading className={className}>
      <CardHeader>
        <div className="h-5 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4" />
        <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2 mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded" />
          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-5/6" />
        </div>
      </CardContent>
    </Card>
  );
}

// ---------- Exports ----------
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  CardSkeleton,
};
