"use client";

import * as React from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { DayPicker, getDefaultClassNames } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  variant = "elevated",
  formatters,
  components,
  hasSlotsDates = [],
  onDateSelect,
  ...props
}) {
  const defaultClassNames = getDefaultClassNames();

  const variantClasses = {
    default: `
      bg-white/95 backdrop-blur-md border border-neutral-200
      rounded-2xl shadow-md
      dark:bg-neutral-900/95 dark:border-neutral-800
    `,
    "default-lite": `
      bg-white border border-neutral-200
      rounded-xl
      dark:bg-neutral-900 dark:border-neutral-800
    `,
    glass: `
      bg-white/20 backdrop-blur-xl border border-white/30
      rounded-3xl shadow-lg
      dark:bg-neutral-900/20 dark:border-neutral-800/30
    `,
    elevated: `
      bg-gradient-to-br from-white via-white to-primary-50/30
      backdrop-blur-lg border border-neutral-200
      rounded-2xl shadow-xl
      dark:from-neutral-900 dark:via-neutral-900 dark:to-primary-950/30
      dark:border-neutral-800
    `,
    minimal: `
      bg-transparent
    `,
  };

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "group/calendar p-4 sm:p-5",
        "[--cell-size:3rem] sm:[--cell-size:3rem]",
        "[[data-slot=card-content]_&]:bg-transparent",
        "[[data-slot=popover-content]_&]:bg-transparent",
        "motion-reduce:transition-none",
        variantClasses[variant],
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn(
          "flex gap-4 flex-col sm:flex-row relative",
          defaultClassNames.months
        ),
        month: cn("flex flex-col w-full gap-4", defaultClassNames.month),
        nav: cn(
          "flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between z-10",
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant, size: "icon" }),
          "size-(--cell-size) aria-disabled:opacity-50 p-0 select-none",
          "hover:bg-primary-100 dark:hover:bg-primary-900/30",
          "transition-colors duration-200",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant, size: "icon" }),
          "size-(--cell-size) aria-disabled:opacity-50 p-0 select-none",
          "hover:bg-primary-100 dark:hover:bg-primary-900/30",
          "transition-colors duration-200",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex items-center justify-center h-(--cell-size) w-full px-(--cell-size)",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "w-full flex items-center text-sm font-semibold justify-center h-(--cell-size) gap-1.5",
          "text-primary-800 dark:text-primary-200",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "relative has-focus:border-primary-500 border border-neutral-300",
          "shadow-sm has-focus:ring-primary-500/50 has-focus:ring-2 rounded-lg",
          "dark:border-neutral-700 dark:has-focus:border-primary-500",
          "transition-all duration-200",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn(
          "absolute bg-white dark:bg-neutral-900 inset-0 opacity-0",
          defaultClassNames.dropdown
        ),
        caption_label: cn(
          "select-none font-semibold text-primary-800 dark:text-primary-200",
          captionLayout === "label"
            ? "text-sm sm:text-base"
            : "rounded-lg pl-2.5 pr-1.5 flex items-center gap-1.5 text-sm h-9 [&>svg]:text-neutral-600 dark:[&>svg]:text-neutral-400 [&>svg]:size-4",
          defaultClassNames.caption_label
        ),
        table: "w-full border-collapse mt-2",
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "text-neutral-600 dark:text-neutral-400",
          "rounded-md flex-1 font-medium text-xs uppercase tracking-wide select-none",
          "pb-2",
          defaultClassNames.weekday
        ),
        week: cn("flex w-full mt-1", defaultClassNames.week),
        week_number_header: cn(
          "select-none w-(--cell-size)",
          defaultClassNames.week_number_header
        ),
        week_number: cn(
          "text-xs select-none text-neutral-600 dark:text-neutral-400 font-medium",
          defaultClassNames.week_number
        ),
        day: cn(
          "relative w-full h-full p-0.5 text-center",
          "group/day aspect-square select-none",
          defaultClassNames.day
        ),
        range_start: cn(
          "rounded-full bg-primary-100 dark:bg-primary-900/30",
          defaultClassNames.range_start
        ),
        range_middle: cn(
          "rounded-none bg-primary-50 dark:bg-primary-900/20",
          defaultClassNames.range_middle
        ),
        range_end: cn(
          "rounded-full bg-primary-100 dark:bg-primary-900/30",
          defaultClassNames.range_end
        ),
        today: cn(
          "bg-primary-100 dark:bg-primary-900/20",
          "text-primary-800 dark:text-primary-200",
          "rounded-full",
          "font-semibold ring-2 ring-primary-500",
          defaultClassNames.today
        ),
        outside: cn(
          "text-neutral-400 dark:text-neutral-600",
          "aria-selected:text-neutral-400 dark:aria-selected:text-neutral-600",
          defaultClassNames.outside
        ),
        disabled: cn(
          "text-neutral-300 dark:text-neutral-700 opacity-50 cursor-not-allowed",
          defaultClassNames.disabled
        ),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          );
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return <ChevronLeft className={cn("h-4 w-4", className)} {...props} />;
          }

          if (orientation === "right") {
            return <ChevronRight className={cn("h-4 w-4", className)} {...props} />;
          }

          return <ChevronDown className={cn("h-4 w-4", className)} {...props} />;
        },
        DayButton: (props) => (
          <CalendarDayButton
            {...props}
            hasSlotsDates={hasSlotsDates}
          />
        ),
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-(--cell-size) items-center justify-center text-center">
                {children}
              </div>
            </td>
          );
        },
        ...components,
      }}
      {...props}
    />
  );
}

function CalendarDayButton({ className, day, modifiers, hasSlotsDates = [], ...props }) {
  const defaultClassNames = getDefaultClassNames();
  const ref = React.useRef(null);
  
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  const dateString = day.date.toLocaleDateString();
  const hasSlots = hasSlotsDates.includes(dateString);

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={dateString}
      data-has-slots={hasSlots}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1",
        "leading-none font-medium text-sm",
        "rounded-full transition-all duration-300",
        "hover:bg-primary-100 dark:hover:bg-primary-900/30",
        "hover:text-primary-800 dark:hover:text-primary-200",
        "motion-reduce:transition-none",
        "hover:scale-105",
        // Days with slots - rounded styling
        "data-[has-slots=true]:bg-primary-50 dark:data-[has-slots=true]:bg-primary-900/20",
        "data-[has-slots=true]:text-primary-700 dark:data-[has-slots=true]:text-primary-400",
        "data-[has-slots=true]:font-semibold",
        // Selected single day - FULLY ROUNDED
        "data-[selected-single=true]:!rounded-full",
        "data-[selected-single=true]:bg-gradient-to-br",
        "data-[selected-single=true]:from-primary-600",
        "data-[selected-single=true]:to-primary-700",
        "data-[selected-single=true]:text-white",
        "data-[selected-single=true]:hover:from-primary-700",
        "data-[selected-single=true]:hover:to-primary-800",
        "data-[selected-single=true]:shadow-lg",
        "data-[selected-single=true]:scale-105",
        "dark:data-[selected-single=true]:from-primary-500",
        "dark:data-[selected-single=true]:to-primary-600",
        // Range styling
        "data-[range-middle=true]:!rounded-none",
        "data-[range-middle=true]:bg-primary-100 dark:data-[range-middle=true]:bg-primary-900/30",
        "data-[range-middle=true]:text-primary-800 dark:data-[range-middle=true]:text-primary-200",
        "data-[range-start=true]:!rounded-full",
        "data-[range-start=true]:bg-primary-700",
        "data-[range-start=true]:text-white",
        "data-[range-start=true]:hover:bg-primary-800",
        "dark:data-[range-start=true]:bg-primary-600",
        "data-[range-end=true]:!rounded-full",
        "data-[range-end=true]:bg-primary-700",
        "data-[range-end=true]:text-white",
        "data-[range-end=true]:hover:bg-primary-800",
        "dark:data-[range-end=true]:bg-primary-600",
        // Focused state
        "group-data-[focused=true]/day:border-primary-500",
        "group-data-[focused=true]/day:ring-primary-500/50",
        "group-data-[focused=true]/day:relative",
        "group-data-[focused=true]/day:z-10",
        "group-data-[focused=true]/day:ring-2",
        // Slot indicator dots
        "relative",
        defaultClassNames.day,
        className
      )}
      {...props}
    >
      <span>{day.date.getDate()}</span>
      {hasSlots && !modifiers.selected && (
        <div className="absolute bottom-1 flex gap-0.5">
          <div className="w-1 h-1 rounded-full bg-primary-600" />
          <div className="w-1 h-1 rounded-full bg-primary-600" />
          <div className="w-1 h-1 rounded-full bg-primary-600" />
        </div>
      )}
    </Button>
  );
}

export { Calendar, CalendarDayButton };
