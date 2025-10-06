import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { ChevronRight, MoreHorizontal, Slash, Home } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------- Breadcrumb Root ----------
const Breadcrumb = React.forwardRef(({ className, ...props }, ref) => (
  <nav
    ref={ref}
    aria-label="breadcrumb"
    data-slot="breadcrumb"
    className={cn("w-full", className)}
    {...props}
  />
));
Breadcrumb.displayName = "Breadcrumb";

// ---------- Breadcrumb List ----------
const BreadcrumbList = React.forwardRef(
  ({ className, variant = "default", ...props }, ref) => {
    const variantClasses = {
      default: "",
      pills: "gap-1",
      ghost: "",
      elevated: `
        bg-white/95 backdrop-blur-md border border-neutral-200
        rounded-xl px-3 py-2 sm:px-4 sm:py-2.5 shadow-sm
        dark:bg-neutral-900/95 dark:border-neutral-800
      `,
      glass: `
        bg-white/20 backdrop-blur-xl border border-white/30
        rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 shadow-lg
        dark:bg-neutral-900/20 dark:border-neutral-800/30
      `,
    };

    return (
      <ol
        ref={ref}
        data-slot="breadcrumb-list"
        className={cn(
          "flex flex-wrap items-center gap-1.5 text-sm sm:gap-2.5",
          "text-neutral-600 dark:text-neutral-400",
          variantClasses[variant],
          className
        )}
        {...props}
      />
    );
  }
);
BreadcrumbList.displayName = "BreadcrumbList";

// ---------- Breadcrumb Item ----------
const BreadcrumbItem = React.forwardRef(({ className, ...props }, ref) => (
  <li
    ref={ref}
    data-slot="breadcrumb-item"
    className={cn("inline-flex items-center gap-1.5", className)}
    {...props}
  />
));
BreadcrumbItem.displayName = "BreadcrumbItem";

// ---------- Breadcrumb Link ----------
const BreadcrumbLink = React.forwardRef(
  ({ asChild, className, variant = "default", ...props }, ref) => {
    const Comp = asChild ? Slot : "a";

    const variantClasses = {
      default: `
        hover:text-primary-700 dark:hover:text-primary-400
        transition-colors duration-200
        motion-reduce:transition-none
      `,
      pills: `
        px-2.5 py-1 rounded-full
        hover:bg-primary-50 dark:hover:bg-primary-900/30
        hover:text-primary-700 dark:hover:text-primary-400
        transition-all duration-200
        motion-reduce:transition-none
      `,
      underline: `
        hover:text-primary-700 dark:hover:text-primary-400
        hover:underline underline-offset-4
        transition-colors duration-200
        motion-reduce:transition-none
      `,
      ghost: `
        px-2 py-1 rounded-md
        hover:bg-neutral-100 dark:hover:bg-neutral-800
        hover:text-primary-700 dark:hover:text-primary-400
        transition-all duration-200
        motion-reduce:transition-none
      `,
    };

    return (
      <Comp
        ref={ref}
        data-slot="breadcrumb-link"
        className={cn(
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
          "rounded-sm font-medium",
          variantClasses[variant],
          className
        )}
        {...props}
      />
    );
  }
);
BreadcrumbLink.displayName = "BreadcrumbLink";

// ---------- Breadcrumb Page ----------
const BreadcrumbPage = React.forwardRef(({ className, ...props }, ref) => (
  <span
    ref={ref}
    data-slot="breadcrumb-page"
    role="link"
    aria-disabled="true"
    aria-current="page"
    className={cn(
      "font-semibold text-primary-800 dark:text-primary-200",
      "px-1",
      className
    )}
    {...props}
  />
));
BreadcrumbPage.displayName = "BreadcrumbPage";

// ---------- Breadcrumb Separator ----------
const BreadcrumbSeparator = React.forwardRef(
  ({ children, className, type = "chevron", ...props }, ref) => {
    const separators = {
      chevron: <ChevronRight className="h-4 w-4" />,
      slash: <Slash className="h-4 w-4" />,
      dot: <span className="text-lg leading-none">·</span>,
      arrow: <span>→</span>,
    };

    return (
      <li
        ref={ref}
        data-slot="breadcrumb-separator"
        role="presentation"
        aria-hidden="true"
        className={cn(
          "flex items-center",
          "[&>svg]:h-4 [&>svg]:w-4",
          "text-neutral-400 dark:text-neutral-600",
          className
        )}
        {...props}
      >
        {children ?? separators[type]}
      </li>
    );
  }
);
BreadcrumbSeparator.displayName = "BreadcrumbSeparator";

// ---------- Breadcrumb Ellipsis ----------
const BreadcrumbEllipsis = React.forwardRef(({ className, ...props }, ref) => (
  <span
    ref={ref}
    data-slot="breadcrumb-ellipsis"
    role="presentation"
    aria-hidden="true"
    className={cn(
      "flex h-8 w-8 items-center justify-center",
      "rounded-md",
      "hover:bg-neutral-100 dark:hover:bg-neutral-800",
      "transition-colors duration-200",
      "motion-reduce:transition-none",
      className
    )}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
));
BreadcrumbEllipsis.displayName = "BreadcrumbEllipsis";

// ---------- Breadcrumb Home Icon ----------
const BreadcrumbHome = React.forwardRef(
  ({ className, asChild, href = "/", ...props }, ref) => {
    const Comp = asChild ? Slot : "a";

    return (
      <Comp
        ref={ref}
        href={href}
        data-slot="breadcrumb-home"
        className={cn(
          "inline-flex items-center justify-center",
          "h-8 w-8 rounded-md",
          "text-neutral-600 dark:text-neutral-400",
          "hover:bg-neutral-100 dark:hover:bg-neutral-800",
          "hover:text-primary-700 dark:hover:text-primary-400",
          "transition-all duration-200",
          "motion-reduce:transition-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
          className
        )}
        aria-label="Home"
        {...props}
      >
        <Home className="h-4 w-4" />
      </Comp>
    );
  }
);
BreadcrumbHome.displayName = "BreadcrumbHome";

// ---------- Breadcrumb Responsive Wrapper ----------
function BreadcrumbResponsive({ 
  items = [],
  maxItems = 3,
  className,
  variant = "default",
  linkVariant = "default",
  separatorType = "chevron",
  showHome = false,
}) {
  const shouldCollapse = items.length > maxItems;
  const displayItems = shouldCollapse 
    ? [items[0], ...items.slice(-2)] 
    : items;

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList variant={variant}>
        {showHome && (
          <>
            <BreadcrumbItem>
              <BreadcrumbHome />
            </BreadcrumbItem>
            {items.length > 0 && (
              <BreadcrumbSeparator type={separatorType} />
            )}
          </>
        )}
        
        {shouldCollapse && (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink href={displayItems[0].href} variant={linkVariant}>
                {displayItems[0].label}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator type={separatorType} />
            <BreadcrumbItem>
              <BreadcrumbEllipsis />
            </BreadcrumbItem>
            <BreadcrumbSeparator type={separatorType} />
          </>
        )}

        {(shouldCollapse ? displayItems.slice(1) : displayItems).map((item, index, arr) => (
          <React.Fragment key={item.href || index}>
            <BreadcrumbItem>
              {index === arr.length - 1 ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={item.href} variant={linkVariant}>
                  {item.label}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {index < arr.length - 1 && (
              <BreadcrumbSeparator type={separatorType} />
            )}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
  BreadcrumbHome,
  BreadcrumbResponsive,
};
