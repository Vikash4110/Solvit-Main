"use client";

import * as React from "react";
import { GripVertical } from "lucide-react";
import * as ResizablePrimitive from "react-resizable-panels";
import { cn } from "@/lib/utils";

// ---------- Resizable Panel Group ----------
const ResizablePanelGroup = React.forwardRef(
  ({ className, ...props }, ref) => (
    <ResizablePrimitive.PanelGroup
      ref={ref}
      data-slot="resizable-panel-group"
      className={cn(
        "flex h-full w-full",
        "data-[panel-group-direction=vertical]:flex-col",
        className
      )}
      {...props}
    />
  )
);
ResizablePanelGroup.displayName = "ResizablePanelGroup";

// ---------- Resizable Panel ----------
const ResizablePanel = React.forwardRef(
  ({ className, ...props }, ref) => (
    <ResizablePrimitive.Panel
      ref={ref}
      data-slot="resizable-panel"
      className={cn("overflow-auto", className)}
      {...props}
    />
  )
);
ResizablePanel.displayName = "ResizablePanel";

// ---------- Resizable Handle ----------
const ResizableHandle = React.forwardRef(
  (
    {
      withHandle = false,
      className,
      variant = "default",
      size = "default",
      ...props
    },
    ref
  ) => {
    const variantClasses = {
      default: `
        bg-neutral-200 hover:bg-neutral-300
        dark:bg-neutral-800 dark:hover:bg-neutral-700
      `,
      primary: `
        bg-primary-200 hover:bg-primary-300
        dark:bg-primary-900/30 dark:hover:bg-primary-900/50
      `,
      ghost: `
        bg-transparent hover:bg-neutral-200
        dark:hover:bg-neutral-800
      `,
    };

    const sizeClasses = {
      sm: "w-px data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full",
      default: "w-1 data-[panel-group-direction=vertical]:h-1 data-[panel-group-direction=vertical]:w-full",
      lg: "w-1.5 data-[panel-group-direction=vertical]:h-1.5 data-[panel-group-direction=vertical]:w-full",
    };

    const handleSizeClasses = {
      sm: "h-6 w-4 [&_svg]:h-2.5 [&_svg]:w-2.5",
      default: "h-8 w-5 [&_svg]:h-3 [&_svg]:w-3",
      lg: "h-10 w-6 [&_svg]:h-3.5 [&_svg]:w-3.5",
    };

    return (
      <ResizablePrimitive.PanelResizeHandle
        ref={ref}
        data-slot="resizable-handle"
        className={cn(
          "relative flex items-center justify-center",
          "transition-colors duration-200",
          "motion-reduce:transition-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
          // Hit area
          "after:absolute after:inset-y-0 after:left-1/2 after:w-3 after:-translate-x-1/2",
          "data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-3 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:top-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 data-[panel-group-direction=vertical]:after:-translate-y-1/2",
          // Rotate handle for vertical
          "[&[data-panel-group-direction=vertical]>div]:rotate-90",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {withHandle && (
          <div
            className={cn(
              "z-10 flex items-center justify-center rounded-md border",
              "bg-white dark:bg-neutral-900",
              "border-neutral-300 dark:border-neutral-700",
              "shadow-sm",
              "transition-all duration-200",
              "hover:shadow-md hover:scale-105",
              "motion-reduce:transition-none motion-reduce:hover:scale-100",
              handleSizeClasses[size]
            )}
          >
            <GripVertical className="text-neutral-600 dark:text-neutral-400" />
          </div>
        )}
      </ResizablePrimitive.PanelResizeHandle>
    );
  }
);
ResizableHandle.displayName = "ResizableHandle";

// ---------- Resizable Panel Content ----------
const ResizablePanelContent = React.forwardRef(
  ({ className, variant = "default", ...props }, ref) => {
    const variantClasses = {
      default: "bg-white dark:bg-neutral-900",
      muted: "bg-neutral-50 dark:bg-neutral-950",
      transparent: "bg-transparent",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "h-full w-full overflow-auto p-4",
          variantClasses[variant],
          className
        )}
        {...props}
      />
    );
  }
);
ResizablePanelContent.displayName = "ResizablePanelContent";

// ---------- Resizable Panel Header ----------
const ResizablePanelHeader = React.forwardRef(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-between gap-2 px-4 py-3",
        "border-b border-neutral-200 dark:border-neutral-800",
        "bg-neutral-50 dark:bg-neutral-950",
        className
      )}
      {...props}
    />
  )
);
ResizablePanelHeader.displayName = "ResizablePanelHeader";

// ---------- Resizable Panel Title ----------
const ResizablePanelTitle = React.forwardRef(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        "text-sm font-semibold text-neutral-800 dark:text-neutral-200",
        className
      )}
      {...props}
    />
  )
);
ResizablePanelTitle.displayName = "ResizablePanelTitle";

// ---------- Resizable Panel Footer ----------
const ResizablePanelFooter = React.forwardRef(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-between gap-2 px-4 py-3",
        "border-t border-neutral-200 dark:border-neutral-800",
        "bg-neutral-50 dark:bg-neutral-950",
        className
      )}
      {...props}
    />
  )
);
ResizablePanelFooter.displayName = "ResizablePanelFooter";

// ---------- Resizable Container ----------
const ResizableContainer = React.forwardRef(
  ({ className, variant = "default", ...props }, ref) => {
    const variantClasses = {
      default: `
        border border-neutral-200 dark:border-neutral-800
        rounded-xl overflow-hidden shadow-sm
      `,
      elevated: `
        border border-neutral-200 dark:border-neutral-800
        rounded-xl overflow-hidden shadow-md
      `,
      ghost: `
        border border-neutral-200 dark:border-neutral-800
        rounded-xl overflow-hidden
      `,
      none: "overflow-hidden",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "bg-white dark:bg-neutral-900",
          variantClasses[variant],
          className
        )}
        {...props}
      />
    );
  }
);
ResizableContainer.displayName = "ResizableContainer";

// ---------- Resizable Sidebar Layout ----------
function ResizableSidebarLayout({
  sidebar,
  main,
  defaultSize = 20,
  minSize = 15,
  maxSize = 40,
  collapsible = false,
  sidebarPosition = "left",
  className,
}) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  return (
    <ResizableContainer variant="elevated" className={className}>
      <ResizablePanelGroup direction="horizontal">
        {sidebarPosition === "left" && (
          <>
            <ResizablePanel
              defaultSize={defaultSize}
              minSize={minSize}
              maxSize={maxSize}
              collapsible={collapsible}
              onCollapse={setIsCollapsed}
            >
              <ResizablePanelContent variant="muted">
                {sidebar}
              </ResizablePanelContent>
            </ResizablePanel>
            <ResizableHandle withHandle variant="default" />
          </>
        )}

        <ResizablePanel defaultSize={100 - defaultSize}>
          <ResizablePanelContent>{main}</ResizablePanelContent>
        </ResizablePanel>

        {sidebarPosition === "right" && (
          <>
            <ResizableHandle withHandle variant="default" />
            <ResizablePanel
              defaultSize={defaultSize}
              minSize={minSize}
              maxSize={maxSize}
              collapsible={collapsible}
              onCollapse={setIsCollapsed}
            >
              <ResizablePanelContent variant="muted">
                {sidebar}
              </ResizablePanelContent>
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </ResizableContainer>
  );
}

// ---------- Resizable Split Layout ----------
function ResizableSplitLayout({
  top,
  bottom,
  defaultSize = 50,
  minSize = 20,
  maxSize = 80,
  className,
}) {
  return (
    <ResizableContainer variant="elevated" className={className}>
      <ResizablePanelGroup direction="vertical">
        <ResizablePanel
          defaultSize={defaultSize}
          minSize={minSize}
          maxSize={maxSize}
        >
          <ResizablePanelContent>{top}</ResizablePanelContent>
        </ResizablePanel>

        <ResizableHandle withHandle variant="default" />

        <ResizablePanel
          defaultSize={100 - defaultSize}
          minSize={minSize}
          maxSize={maxSize}
        >
          <ResizablePanelContent variant="muted">{bottom}</ResizablePanelContent>
        </ResizablePanel>
      </ResizablePanelGroup>
    </ResizableContainer>
  );
}

// ---------- Resizable Three Column Layout ----------
function ResizableThreeColumnLayout({
  left,
  center,
  right,
  leftDefaultSize = 25,
  rightDefaultSize = 25,
  className,
}) {
  return (
    <ResizableContainer variant="elevated" className={className}>
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel
          defaultSize={leftDefaultSize}
          minSize={15}
          maxSize={40}
        >
          <ResizablePanelContent variant="muted">{left}</ResizablePanelContent>
        </ResizablePanel>

        <ResizableHandle withHandle variant="default" />

        <ResizablePanel defaultSize={100 - leftDefaultSize - rightDefaultSize}>
          <ResizablePanelContent>{center}</ResizablePanelContent>
        </ResizablePanel>

        <ResizableHandle withHandle variant="default" />

        <ResizablePanel
          defaultSize={rightDefaultSize}
          minSize={15}
          maxSize={40}
        >
          <ResizablePanelContent variant="muted">{right}</ResizablePanelContent>
        </ResizablePanel>
      </ResizablePanelGroup>
    </ResizableContainer>
  );
}

export {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
  ResizablePanelContent,
  ResizablePanelHeader,
  ResizablePanelTitle,
  ResizablePanelFooter,
  ResizableContainer,
  ResizableSidebarLayout,
  ResizableSplitLayout,
  ResizableThreeColumnLayout,
};
