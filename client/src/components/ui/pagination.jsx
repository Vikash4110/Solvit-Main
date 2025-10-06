import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

// ---------- Pagination Root ----------
const Pagination = React.forwardRef(
  ({ className, variant = "default", ...props }, ref) => {
    const variantClasses = {
      default: "",
      contained: `
        bg-white/95 backdrop-blur-md border border-neutral-200
        rounded-xl p-2 shadow-sm
        dark:bg-neutral-900/95 dark:border-neutral-800
      `,
      elevated: `
        bg-gradient-to-br from-white to-neutral-50/90
        backdrop-blur-lg border border-neutral-200/60
        rounded-xl shadow-md p-2
        dark:from-neutral-900 dark:to-neutral-800/90
        dark:border-neutral-800/60
      `,
    };

    return (
      <nav
        ref={ref}
        role="navigation"
        aria-label="pagination"
        data-slot="pagination"
        className={cn("mx-auto flex w-full justify-center", variantClasses[variant], className)}
        {...props}
      />
    );
  }
);
Pagination.displayName = "Pagination";

// ---------- Pagination Content ----------
const PaginationContent = React.forwardRef(
  ({ className, ...props }, ref) => (
    <ul
      ref={ref}
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  )
);
PaginationContent.displayName = "PaginationContent";

// ---------- Pagination Item ----------
const PaginationItem = React.forwardRef(({ ...props }, ref) => (
  <li ref={ref} data-slot="pagination-item" {...props} />
));
PaginationItem.displayName = "PaginationItem";

// ---------- Pagination Link ----------
const PaginationLink = React.forwardRef(
  ({ className, isActive, size = "icon", disabled, ...props }, ref) => (
    <a
      ref={ref}
      aria-current={isActive ? "page" : undefined}
      aria-disabled={disabled}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
        buttonVariants({
          variant: isActive ? "default" : "ghost",
          size,
        }),
        isActive && [
          "bg-primary-700 text-white hover:bg-primary-800",
          "dark:bg-primary-600 dark:hover:bg-primary-700",
          "pointer-events-none",
        ],
        disabled && "pointer-events-none opacity-50 cursor-not-allowed",
        "transition-all duration-200 motion-reduce:transition-none",
        className
      )}
      {...props}
    />
  )
);
PaginationLink.displayName = "PaginationLink";

// ---------- Pagination Previous ----------
const PaginationPrevious = React.forwardRef(
  ({ className, disabled, showIcon = true, ...props }, ref) => (
    <PaginationLink
      ref={ref}
      aria-label="Go to previous page"
      size="default"
      disabled={disabled}
      className={cn("gap-1.5 px-3", className)}
      {...props}
    >
      {showIcon && <ChevronLeft className="h-4 w-4" />}
      <span className="hidden sm:inline">Previous</span>
    </PaginationLink>
  )
);
PaginationPrevious.displayName = "PaginationPrevious";

// ---------- Pagination Next ----------
const PaginationNext = React.forwardRef(
  ({ className, disabled, showIcon = true, ...props }, ref) => (
    <PaginationLink
      ref={ref}
      aria-label="Go to next page"
      size="default"
      disabled={disabled}
      className={cn("gap-1.5 px-3", className)}
      {...props}
    >
      <span className="hidden sm:inline">Next</span>
      {showIcon && <ChevronRight className="h-4 w-4" />}
    </PaginationLink>
  )
);
PaginationNext.displayName = "PaginationNext";

// ---------- Pagination First ----------
const PaginationFirst = React.forwardRef(
  ({ className, disabled, ...props }, ref) => (
    <PaginationLink
      ref={ref}
      aria-label="Go to first page"
      size="icon"
      disabled={disabled}
      className={cn(className)}
      {...props}
    >
      <ChevronsLeft className="h-4 w-4" />
    </PaginationLink>
  )
);
PaginationFirst.displayName = "PaginationFirst";

// ---------- Pagination Last ----------
const PaginationLast = React.forwardRef(
  ({ className, disabled, ...props }, ref) => (
    <PaginationLink
      ref={ref}
      aria-label="Go to last page"
      size="icon"
      disabled={disabled}
      className={cn(className)}
      {...props}
    >
      <ChevronsRight className="h-4 w-4" />
    </PaginationLink>
  )
);
PaginationLast.displayName = "PaginationLast";

// ---------- Pagination Ellipsis ----------
const PaginationEllipsis = React.forwardRef(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn(
        "flex h-9 w-9 items-center justify-center",
        "text-neutral-500 dark:text-neutral-500",
        className
      )}
      {...props}
    >
      <MoreHorizontal className="h-4 w-4" />
      <span className="sr-only">More pages</span>
    </span>
  )
);
PaginationEllipsis.displayName = "PaginationEllipsis";

// ---------- Pagination Info ----------
const PaginationInfo = React.forwardRef(
  ({ className, currentPage, totalPages, totalItems, itemsPerPage, ...props }, ref) => {
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
      <div
        ref={ref}
        className={cn(
          "text-sm text-neutral-600 dark:text-neutral-400",
          "flex items-center gap-1",
          className
        )}
        {...props}
      >
        <span className="hidden sm:inline">Showing</span>
        <span className="font-semibold text-neutral-800 dark:text-neutral-200">
          {startItem}-{endItem}
        </span>
        <span>of</span>
        <span className="font-semibold text-neutral-800 dark:text-neutral-200">
          {totalItems}
        </span>
      </div>
    );
  }
);
PaginationInfo.displayName = "PaginationInfo";

// ---------- Pagination Select ----------
const PaginationSelect = React.forwardRef(
  ({ className, value, onChange, options = [10, 20, 50, 100], ...props }, ref) => (
    <div className={cn("flex items-center gap-2", className)} {...props}>
      <span className="text-sm text-neutral-600 dark:text-neutral-400 hidden sm:inline">
        Show
      </span>
      <select
        ref={ref}
        value={value}
        onChange={(e) => onChange?.(Number(e.target.value))}
        className={cn(
          "h-9 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30",
          "dark:border-neutral-700 dark:bg-neutral-900",
          "dark:text-neutral-200",
          "transition-all duration-200"
        )}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <span className="text-sm text-neutral-600 dark:text-neutral-400 hidden sm:inline">
        per page
      </span>
    </div>
  )
);
PaginationSelect.displayName = "PaginationSelect";

// ---------- Pagination Wrapper ----------
const PaginationWrapper = React.forwardRef(
  ({ className, align = "center", ...props }, ref) => {
    const alignClasses = {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      between: "justify-between",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-4 flex-wrap",
          alignClasses[align],
          className
        )}
        {...props}
      />
    );
  }
);
PaginationWrapper.displayName = "PaginationWrapper";

// ---------- Pagination Helper: Generate Page Numbers ----------
export function generatePagination(currentPage, totalPages, maxVisible = 7) {
  const pages = [];

  if (totalPages <= maxVisible) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  const leftSiblingIndex = Math.max(currentPage - 1, 1);
  const rightSiblingIndex = Math.min(currentPage + 1, totalPages);

  const shouldShowLeftEllipsis = leftSiblingIndex > 2;
  const shouldShowRightEllipsis = rightSiblingIndex < totalPages - 1;

  if (!shouldShowLeftEllipsis && shouldShowRightEllipsis) {
    const leftItemCount = 3 + 2;
    for (let i = 1; i <= leftItemCount; i++) {
      pages.push(i);
    }
    pages.push("ellipsis-right");
    pages.push(totalPages);
    return pages;
  }

  if (shouldShowLeftEllipsis && !shouldShowRightEllipsis) {
    const rightItemCount = 3 + 2;
    pages.push(1);
    pages.push("ellipsis-left");
    for (let i = totalPages - rightItemCount + 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  if (shouldShowLeftEllipsis && shouldShowRightEllipsis) {
    pages.push(1);
    pages.push("ellipsis-left");
    for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
      pages.push(i);
    }
    pages.push("ellipsis-right");
    pages.push(totalPages);
    return pages;
  }

  return pages;
}

// ---------- Complete Pagination Component ----------
function CompletePagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  variant = "default",
  showFirstLast = true,
  showInfo = true,
  showSelect = true,
  className,
}) {
  const pages = generatePagination(currentPage, totalPages);

  return (
    <PaginationWrapper align="between" className={className}>
      {showInfo && (
        <PaginationInfo
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
        />
      )}

      <Pagination variant={variant}>
        <PaginationContent>
          {showFirstLast && (
            <PaginationItem>
              <PaginationFirst
                disabled={currentPage === 1}
                onClick={() => onPageChange(1)}
              />
            </PaginationItem>
          )}

          <PaginationItem>
            <PaginationPrevious
              disabled={currentPage === 1}
              onClick={() => onPageChange(currentPage - 1)}
            />
          </PaginationItem>

          {pages.map((page, index) => (
            <PaginationItem key={index}>
              {typeof page === "string" ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  isActive={currentPage === page}
                  onClick={() => onPageChange(page)}
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              disabled={currentPage === totalPages}
              onClick={() => onPageChange(currentPage + 1)}
            />
          </PaginationItem>

          {showFirstLast && (
            <PaginationItem>
              <PaginationLast
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(totalPages)}
              />
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>

      {showSelect && onItemsPerPageChange && (
        <PaginationSelect
          value={itemsPerPage}
          onChange={onItemsPerPageChange}
        />
      )}
    </PaginationWrapper>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationFirst,
  PaginationLast,
  PaginationEllipsis,
  PaginationInfo,
  PaginationSelect,
  PaginationWrapper,
  CompletePagination,
};
