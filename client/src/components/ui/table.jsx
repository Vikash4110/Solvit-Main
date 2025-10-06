"use client";

import * as React from "react";
import { cva } from "class-variance-authority";
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  MoreHorizontal,
  ArrowUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

// ---------- Table Variants ----------
const tableVariants = cva(
  "w-full caption-bottom text-sm",
  {
    variants: {
      variant: {
        default: "",
        striped: "[&_tbody_tr:nth-child(odd)]:bg-neutral-50 dark:[&_tbody_tr:nth-child(odd)]:bg-neutral-900/30",
        bordered: "border border-neutral-200 dark:border-neutral-800",
        hoverable: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

// ---------- Table Component ----------
const Table = React.forwardRef(
  ({ className, variant, ...props }, ref) => (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800"
    >
      <table
        ref={ref}
        data-slot="table"
        className={cn(tableVariants({ variant }), className)}
        {...props}
      />
    </div>
  )
);
Table.displayName = "Table";

// ---------- Table Header ----------
const TableHeader = React.forwardRef(
  ({ className, sticky = false, ...props }, ref) => (
    <thead
      ref={ref}
      data-slot="table-header"
      className={cn(
        "bg-neutral-50 dark:bg-neutral-900",
        "[&_tr]:border-b [&_tr]:border-neutral-200 dark:[&_tr]:border-neutral-800",
        sticky && "sticky top-0 z-10",
        className
      )}
      {...props}
    />
  )
);
TableHeader.displayName = "TableHeader";

// ---------- Table Body ----------
const TableBody = React.forwardRef(
  ({ className, ...props }, ref) => (
    <tbody
      ref={ref}
      data-slot="table-body"
      className={cn(
        "bg-white dark:bg-neutral-950",
        "[&_tr:last-child]:border-0",
        className
      )}
      {...props}
    />
  )
);
TableBody.displayName = "TableBody";

// ---------- Table Footer ----------
const TableFooter = React.forwardRef(
  ({ className, ...props }, ref) => (
    <tfoot
      ref={ref}
      data-slot="table-footer"
      className={cn(
        "bg-neutral-50 dark:bg-neutral-900",
        "border-t border-neutral-200 dark:border-neutral-800",
        "font-semibold",
        "[&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
);
TableFooter.displayName = "TableFooter";

// ---------- Table Row ----------
const TableRow = React.forwardRef(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      data-slot="table-row"
      className={cn(
        "border-b border-neutral-200 dark:border-neutral-800",
        "transition-colors duration-150",
        "hover:bg-neutral-50 dark:hover:bg-neutral-900/50",
        "data-[state=selected]:bg-primary-50 dark:data-[state=selected]:bg-primary-950/30",
        "motion-reduce:transition-none",
        className
      )}
      {...props}
    />
  )
);
TableRow.displayName = "TableRow";

// ---------- Table Head ----------
const TableHead = React.forwardRef(
  ({ className, sortable = false, sortDirection, onSort, ...props }, ref) => {
    const handleSort = () => {
      if (sortable && onSort) {
        onSort();
      }
    };

    return (
      <th
        ref={ref}
        data-slot="table-head"
        className={cn(
          "h-12 px-4 text-left align-middle",
          "font-semibold text-xs uppercase tracking-wider",
          "text-neutral-700 dark:text-neutral-300",
          "whitespace-nowrap",
          sortable && "cursor-pointer select-none hover:text-primary-800 dark:hover:text-primary-200",
          "[&:has([role=checkbox])]:pr-0",
          "[&>[role=checkbox]]:translate-y-[2px]",
          className
        )}
        onClick={sortable ? handleSort : undefined}
        {...props}
      >
        <div className="flex items-center gap-2">
          {props.children}
          {sortable && (
            <span className="ml-auto">
              {sortDirection === "asc" ? (
                <ChevronUp className="h-4 w-4" />
              ) : sortDirection === "desc" ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronsUpDown className="h-4 w-4 text-neutral-400" />
              )}
            </span>
          )}
        </div>
      </th>
    );
  }
);
TableHead.displayName = "TableHead";

// ---------- Table Cell ----------
const TableCell = React.forwardRef(
  ({ className, ...props }, ref) => (
    <td
      ref={ref}
      data-slot="table-cell"
      className={cn(
        "p-4 align-middle",
        "text-neutral-700 dark:text-neutral-300",
        "[&:has([role=checkbox])]:pr-0",
        "[&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  )
);
TableCell.displayName = "TableCell";

// ---------- Table Caption ----------
const TableCaption = React.forwardRef(
  ({ className, ...props }, ref) => (
    <caption
      ref={ref}
      data-slot="table-caption"
      className={cn(
        "mt-4 text-sm text-neutral-600 dark:text-neutral-400",
        className
      )}
      {...props}
    />
  )
);
TableCaption.displayName = "TableCaption";

// ---------- Table Empty ----------
const TableEmpty = React.forwardRef(
  ({ className, colSpan, icon, message = "No data available", ...props }, ref) => (
    <TableRow ref={ref}>
      <TableCell
        colSpan={colSpan}
        className={cn("h-48 text-center", className)}
        {...props}
      >
        <div className="flex flex-col items-center justify-center gap-3">
          {icon && (
            <div className="text-neutral-400 dark:text-neutral-600">
              {icon}
            </div>
          )}
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {message}
          </p>
        </div>
      </TableCell>
    </TableRow>
  )
);
TableEmpty.displayName = "TableEmpty";

// ---------- Table Loading ----------
const TableLoading = React.forwardRef(
  ({ className, rows = 5, cols = 4, ...props }, ref) => (
    <>
      {Array.from({ length: rows }, (_, i) => (
        <TableRow key={i} ref={i === 0 ? ref : undefined}>
          {Array.from({ length: cols }, (_, j) => (
            <TableCell key={j}>
              <Skeleton className="h-4 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
);
TableLoading.displayName = "TableLoading";

// ---------- Table Actions ----------
const TableActions = React.forwardRef(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-end gap-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
TableActions.displayName = "TableActions";

// ---------- Table Badge ----------
const TableBadge = React.forwardRef(
  ({ className, variant = "default", ...props }, ref) => {
    const variantClasses = {
      default: "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300",
      primary: "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300",
      success: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
      warning: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300",
      destructive: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
          variantClasses[variant],
          className
        )}
        {...props}
      />
    );
  }
);
TableBadge.displayName = "TableBadge";

// ---------- Table Toolbar ----------
const TableToolbar = React.forwardRef(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-between gap-4 p-4",
        "bg-neutral-50 dark:bg-neutral-900",
        "border-b border-neutral-200 dark:border-neutral-800",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
TableToolbar.displayName = "TableToolbar";

// ---------- Table Pagination ----------
const TablePagination = React.forwardRef(
  (
    {
      className,
      currentPage = 1,
      totalPages = 1,
      onPageChange,
      pageSize = 10,
      totalItems = 0,
      ...props
    },
    ref
  ) => {
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-between gap-4 px-4 py-3",
          "bg-neutral-50 dark:bg-neutral-900",
          "border-t border-neutral-200 dark:border-neutral-800",
          className
        )}
        {...props}
      >
        <div className="text-sm text-neutral-600 dark:text-neutral-400">
          <span className="hidden sm:inline">Showing </span>
          <span className="font-semibold text-neutral-800 dark:text-neutral-200">
            {startItem}-{endItem}
          </span>
          <span> of </span>
          <span className="font-semibold text-neutral-800 dark:text-neutral-200">
            {totalItems}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange?.(currentPage - 1)}
            disabled={currentPage === 1}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-lg",
              "border border-neutral-300 dark:border-neutral-700",
              "bg-white dark:bg-neutral-900",
              "hover:bg-neutral-50 dark:hover:bg-neutral-800",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "transition-colors duration-200"
            )}
          >
            Previous
          </button>
          <span className="text-sm text-neutral-600 dark:text-neutral-400">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange?.(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-lg",
              "border border-neutral-300 dark:border-neutral-700",
              "bg-white dark:bg-neutral-900",
              "hover:bg-neutral-50 dark:hover:bg-neutral-800",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "transition-colors duration-200"
            )}
          >
            Next
          </button>
        </div>
      </div>
    );
  }
);
TablePagination.displayName = "TablePagination";

// ---------- Table Card ----------
const TableCard = React.forwardRef(
  ({ className, title, description, actions, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border border-neutral-200 dark:border-neutral-800",
        "bg-white dark:bg-neutral-900 shadow-sm overflow-hidden",
        className
      )}
      {...props}
    >
      {(title || description || actions) && (
        <div className="flex items-center justify-between gap-4 p-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="space-y-1">
            {title && (
              <h3 className="text-base font-semibold text-primary-800 dark:text-primary-200">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  )
);
TableCard.displayName = "TableCard";

// ---------- Table Container ----------
const TableContainer = React.forwardRef(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("w-full space-y-4", className)}
      {...props}
    />
  )
);
TableContainer.displayName = "TableContainer";

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  TableEmpty,
  TableLoading,
  TableActions,
  TableBadge,
  TableToolbar,
  TablePagination,
  TableCard,
  TableContainer,
  tableVariants,
};
