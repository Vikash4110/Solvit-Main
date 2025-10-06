import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------- Accordion Root ----------
function Accordion({ className, ...props }) {
  return (
    <AccordionPrimitive.Root 
      data-slot="accordion" 
      className={cn("space-y-2", className)}
      {...props} 
    />
  );
}

// ---------- Accordion Item Variants ----------
const accordionItemVariants = {
  default: `
    bg-white/95 backdrop-blur-md border border-neutral-200
    rounded-xl overflow-hidden shadow-sm
    transition-all duration-300 ease-out
    hover:shadow-md hover:border-neutral-300
    motion-reduce:transition-none
    dark:bg-neutral-900/95 dark:border-neutral-800
    dark:hover:border-neutral-700
  `,
  "default-lite": `
    bg-white border border-neutral-200
    rounded-lg overflow-hidden
    transition-all duration-300 ease-out
    hover:border-neutral-300
    motion-reduce:transition-none
    dark:bg-neutral-900 dark:border-neutral-800
    dark:hover:border-neutral-700
  `,
  glass: `
    bg-white/20 backdrop-blur-xl border border-white/30
    rounded-2xl overflow-hidden shadow-lg
    transition-all duration-300 ease-out
    hover:bg-white/30 hover:border-white/50
    motion-reduce:transition-none
    dark:bg-neutral-900/20 dark:border-neutral-800/30
    dark:hover:bg-neutral-900/30
  `,
  bordered: `
    bg-transparent border-b border-neutral-200
    rounded-none
    last:border-b-0
    transition-all duration-300 ease-out
    hover:bg-neutral-50/50
    motion-reduce:transition-none
    dark:border-neutral-800
    dark:hover:bg-neutral-900/50
  `,
  elevated: `
    bg-gradient-to-br from-white to-neutral-50/90
    backdrop-blur-lg border border-neutral-200/60
    rounded-xl overflow-hidden shadow-md
    transition-all duration-300 ease-out
    hover:shadow-lg hover:border-neutral-300/80
    motion-reduce:transition-none
    dark:from-neutral-900 dark:to-neutral-800/90
    dark:border-neutral-800/60
  `,
};

// ---------- Accordion Item ----------
function AccordionItem({ className, variant = "default", ...props }) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn(
        accordionItemVariants[variant],
        className
      )}
      {...props}
    />
  );
}

// ---------- Accordion Trigger ----------
const AccordionTrigger = React.forwardRef(
  ({ className, children, iconClassName, ...props }, ref) => {
    return (
      <AccordionPrimitive.Header className="flex" asChild={false}>
        <AccordionPrimitive.Trigger
          ref={ref}
          data-slot="accordion-trigger"
          className={cn(
            "flex flex-1 items-center justify-between gap-3",
            "px-4 py-3 sm:px-6 sm:py-4",
            "text-left text-sm sm:text-base font-semibold",
            "text-primary-800 dark:text-primary-200",
            "transition-all duration-300 ease-out",
            "hover:text-primary-700 dark:hover:text-primary-300",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
            "disabled:pointer-events-none disabled:opacity-50",
            "group",
            "[&[data-state=open]>svg]:rotate-180",
            "motion-reduce:transition-none",
            className
          )}
          {...props}
        >
          <span className="flex-1 leading-tight">{children}</span>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-neutral-600 dark:text-neutral-400",
              "transition-transform duration-300 ease-out",
              "group-hover:text-primary-600 dark:group-hover:text-primary-400",
              "motion-reduce:transition-none",
              iconClassName
            )}
            aria-hidden="true"
          />
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
    );
  }
);
AccordionTrigger.displayName = "AccordionTrigger";

// ---------- Accordion Content ----------
const AccordionContent = React.forwardRef(
  ({ className, children, ...props }, ref) => {
    return (
      <AccordionPrimitive.Content
        ref={ref}
        data-slot="accordion-content"
        className={cn(
          "overflow-hidden",
          "data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
          "motion-reduce:data-[state=closed]:animate-none motion-reduce:data-[state=open]:animate-none",
          "text-sm sm:text-base text-neutral-700 dark:text-neutral-300"
        )}
        {...props}
      >
        <div className={cn("px-4 pb-4 pt-0 sm:px-6 sm:pb-6", className)}>
          {children}
        </div>
      </AccordionPrimitive.Content>
    );
  }
);
AccordionContent.displayName = "AccordionContent";

// ---------- Accordion Group (Styled Container) ----------
function AccordionGroup({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "w-full space-y-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ---------- Exports ----------
export { 
  Accordion, 
  AccordionItem, 
  AccordionTrigger, 
  AccordionContent,
  AccordionGroup 
};
