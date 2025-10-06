"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { PanelLeft, ChevronRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ---------- Constants ----------
const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";

// ---------- Context ----------
const SidebarContext = React.createContext(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }
  return context;
}

// ---------- Provider ----------
function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}) {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false);

  const [_open, _setOpen] = React.useState(defaultOpen);
  const open = openProp ?? _open;
  const setOpen = React.useCallback(
    (value) => {
      const openState = typeof value === "function" ? value(open) : value;
      if (setOpenProp) {
        setOpenProp(openState);
      } else {
        _setOpen(openState);
      }

      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
    },
    [setOpenProp, open]
  );

  const toggleSidebar = React.useCallback(() => {
    return isMobile
      ? setOpenMobile((open) => !open)
      : setOpen((open) => !open);
  }, [isMobile, setOpen, setOpenMobile]);

  React.useEffect(() => {
    const handleKeyDown = (event) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  const state = open ? "expanded" : "collapsed";

  const contextValue = React.useMemo(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div
          data-slot="sidebar-wrapper"
          style={{
            "--sidebar-width": SIDEBAR_WIDTH,
            "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
            ...style,
          }}
          className={cn(
            "group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  );
}

// ---------- Sidebar ----------
function Sidebar({
  side = "left",
  variant = "sidebar",
  collapsible = "offcanvas",
  className,
  children,
  ...props
}) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

  if (collapsible === "none") {
    return (
      <div
        data-slot="sidebar"
        className={cn(
          "bg-sidebar text-sidebar-foreground flex h-full w-[var(--sidebar-width)] flex-col border-r border-neutral-200 dark:border-neutral-800",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
        <SheetContent
          data-sidebar="sidebar"
          data-slot="sidebar"
          data-mobile="true"
          className="bg-sidebar text-sidebar-foreground w-[var(--sidebar-width)] p-0 [&>button]:hidden"
          style={{
            "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
          }}
          side={side}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Sidebar</SheetTitle>
            <SheetDescription>Displays the mobile sidebar.</SheetDescription>
          </SheetHeader>
          <div className="flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      className="group peer text-sidebar-foreground hidden md:block"
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsible : ""}
      data-variant={variant}
      data-side={side}
      data-slot="sidebar"
    >
      <div
        data-slot="sidebar-gap"
        className={cn(
          "relative w-[var(--sidebar-width)] bg-transparent transition-[width] duration-200 ease-linear",
          "group-data-[collapsible=offcanvas]:w-0",
          "group-data-[side=right]:rotate-180",
          variant === "floating" || variant === "inset"
            ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+theme(spacing.4))]"
            : "group-data-[collapsible=icon]:w-[var(--sidebar-width-icon)]"
        )}
      />
      <div
        data-slot="sidebar-container"
        className={cn(
          "fixed inset-y-0 z-10 hidden h-svh w-[var(--sidebar-width)] transition-[left,right,width] duration-200 ease-linear md:flex",
          side === "left"
            ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
            : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
          variant === "floating" || variant === "inset"
            ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+theme(spacing.4)+2px)]"
            : "group-data-[collapsible=icon]:w-[var(--sidebar-width-icon)] group-data-[side=left]:border-r group-data-[side=right]:border-l border-neutral-200 dark:border-neutral-800",
          className
        )}
        {...props}
      >
        <div
          data-sidebar="sidebar"
          data-slot="sidebar-inner"
          className={cn(
            "bg-white dark:bg-neutral-900 flex h-full w-full flex-col",
            "group-data-[variant=floating]:rounded-xl",
            "group-data-[variant=floating]:border group-data-[variant=floating]:border-neutral-200 dark:group-data-[variant=floating]:border-neutral-800",
            "group-data-[variant=floating]:shadow-lg"
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

// ---------- Trigger ----------
function SidebarTrigger({ className, onClick, ...props }) {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon"
      className={cn("h-7 w-7", className)}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      {...props}
    >
      <PanelLeft className="h-4 w-4" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
}

// ---------- Rail ----------
function SidebarRail({ className, ...props }) {
  const { toggleSidebar } = useSidebar();

  return (
    <button
      data-sidebar="rail"
      data-slot="sidebar-rail"
      aria-label="Toggle Sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Toggle Sidebar"
      className={cn(
        "absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear",
        "group-data-[side=left]:-right-4 group-data-[side=right]:left-0",
        "after:absolute after:inset-y-0 after:left-1/2 after:w-[2px]",
        "hover:after:bg-neutral-300 dark:hover:after:bg-neutral-700",
        "sm:flex",
        "group-data-[side=left]:cursor-w-resize group-data-[side=right]:cursor-e-resize",
        "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize",
        "[[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
        "group-data-[collapsible=offcanvas]:translate-x-0",
        "group-data-[collapsible=offcanvas]:after:left-full",
        "hover:group-data-[collapsible=offcanvas]:bg-neutral-100",
        "dark:hover:group-data-[collapsible=offcanvas]:bg-neutral-800",
        "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
        "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
        className
      )}
      {...props}
    />
  );
}

// ---------- Inset ----------
function SidebarInset({ className, ...props }) {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn(
        "bg-background relative flex w-full flex-1 flex-col",
        "md:peer-data-[variant=inset]:m-2",
        "md:peer-data-[variant=inset]:ml-0",
        "md:peer-data-[variant=inset]:rounded-xl",
        "md:peer-data-[variant=inset]:shadow-sm",
        "md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2",
        className
      )}
      {...props}
    />
  );
}

// ---------- Input ----------
function SidebarInput({ className, ...props }) {
  return (
    <Input
      data-slot="sidebar-input"
      data-sidebar="input"
      className={cn("h-8 w-full bg-white dark:bg-neutral-900 shadow-none", className)}
      {...props}
    />
  );
}

// ---------- Header ----------
function SidebarHeader({ className, ...props }) {
  return (
    <div
      data-slot="sidebar-header"
      data-sidebar="header"
      className={cn("flex flex-col gap-2 p-4", className)}
      {...props}
    />
  );
}

// ---------- Footer ----------
function SidebarFooter({ className, ...props }) {
  return (
    <div
      data-slot="sidebar-footer"
      data-sidebar="footer"
      className={cn("flex flex-col gap-2 p-4 mt-auto", className)}
      {...props}
    />
  );
}

// ---------- Separator ----------
function SidebarSeparator({ className, ...props }) {
  return (
    <Separator
      data-slot="sidebar-separator"
      data-sidebar="separator"
      className={cn("mx-2 w-auto bg-neutral-200 dark:bg-neutral-800", className)}
      {...props}
    />
  );
}

// ---------- Content ----------
function SidebarContent({ className, ...props }) {
  return (
    <div
      data-slot="sidebar-content"
      data-sidebar="content"
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-auto p-2",
        "group-data-[collapsible=icon]:overflow-hidden",
        "scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700",
        "scrollbar-track-transparent",
        className
      )}
      {...props}
    />
  );
}

// ---------- Group ----------
function SidebarGroup({ className, ...props }) {
  return (
    <div
      data-slot="sidebar-group"
      data-sidebar="group"
      className={cn("relative flex w-full min-w-0 flex-col p-2", className)}
      {...props}
    />
  );
}

// ---------- Group Label ----------
function SidebarGroupLabel({ className, asChild = false, ...props }) {
  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      data-slot="sidebar-group-label"
      data-sidebar="group-label"
      className={cn(
        "flex h-8 shrink-0 items-center rounded-md px-2",
        "text-xs font-semibold uppercase tracking-wider",
        "text-neutral-600 dark:text-neutral-400",
        "outline-none transition-[margin,opacity] duration-200 ease-linear",
        "focus-visible:ring-2 focus-visible:ring-primary-500",
        "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
        "[&>svg]:h-4 [&>svg]:w-4 [&>svg]:shrink-0",
        className
      )}
      {...props}
    />
  );
}

// ---------- Group Action ----------
function SidebarGroupAction({ className, asChild = false, ...props }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="sidebar-group-action"
      data-sidebar="group-action"
      className={cn(
        "absolute top-3.5 right-3 flex aspect-square w-5 items-center justify-center",
        "rounded-md p-0 outline-none transition-transform",
        "text-neutral-700 dark:text-neutral-300",
        "hover:bg-neutral-100 dark:hover:bg-neutral-800",
        "hover:text-primary-800 dark:hover:text-primary-200",
        "focus-visible:ring-2 focus-visible:ring-primary-500",
        "after:absolute after:-inset-2 md:after:hidden",
        "group-data-[collapsible=icon]:hidden",
        "[&>svg]:h-4 [&>svg]:w-4 [&>svg]:shrink-0",
        className
      )}
      {...props}
    />
  );
}

// ---------- Group Content ----------
function SidebarGroupContent({ className, ...props }) {
  return (
    <div
      data-slot="sidebar-group-content"
      data-sidebar="group-content"
      className={cn("w-full text-sm", className)}
      {...props}
    />
  );
}

// ---------- Menu ----------
function SidebarMenu({ className, ...props }) {
  return (
    <ul
      data-slot="sidebar-menu"
      data-sidebar="menu"
      className={cn("flex w-full min-w-0 flex-col gap-1", className)}
      {...props}
    />
  );
}

// ---------- Menu Item ----------
function SidebarMenuItem({ className, ...props }) {
  return (
    <li
      data-slot="sidebar-menu-item"
      data-sidebar="menu-item"
      className={cn("group/menu-item relative", className)}
      {...props}
    />
  );
}

// ---------- Menu Button Variants ----------
const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2.5 overflow-hidden rounded-lg p-2.5 text-left text-sm outline-none transition-all duration-200 motion-reduce:transition-none disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 [&>span:last-child]:truncate [&>svg]:h-4 [&>svg]:w-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: `
          text-neutral-700 dark:text-neutral-300
          hover:bg-neutral-100 dark:hover:bg-neutral-800
          hover:text-primary-800 dark:hover:text-primary-200
          active:bg-neutral-200 dark:active:bg-neutral-700
          data-[active=true]:bg-primary-100 dark:data-[active=true]:bg-primary-900/30
          data-[active=true]:text-primary-900 dark:data-[active=true]:text-primary-100
          data-[active=true]:font-semibold
          data-[state=open]:bg-neutral-100 dark:data-[state=open]:bg-neutral-800
          data-[state=open]:hover:bg-neutral-200 dark:data-[state=open]:hover:bg-neutral-700
        `,
        outline: `
          bg-white dark:bg-neutral-900
          shadow-[0_0_0_1px_theme(colors.neutral.200)] dark:shadow-[0_0_0_1px_theme(colors.neutral.800)]
          hover:bg-neutral-50 dark:hover:bg-neutral-800
          hover:shadow-[0_0_0_1px_theme(colors.primary.500)]
        `,
      },
      size: {
        default: "h-9 text-sm",
        sm: "h-8 text-xs",
        lg: "h-12 text-sm group-data-[collapsible=icon]:p-0",
      },
    },
    compoundVariants: [
      {
        size: "default",
        className: "group-data-[collapsible=icon]:h-9 group-data-[collapsible=icon]:w-9 group-data-[collapsible=icon]:p-2",
      },
      {
        size: "sm",
        className: "group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:p-1.5",
      },
      {
        size: "lg",
        className: "group-data-[collapsible=icon]:h-12 group-data-[collapsible=icon]:w-12 group-data-[collapsible=icon]:p-3",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// ---------- Menu Button ----------
function SidebarMenuButton({
  asChild = false,
  isActive = false,
  variant = "default",
  size = "default",
  tooltip,
  className,
  ...props
}) {
  const Comp = asChild ? Slot : "button";
  const { isMobile, state } = useSidebar();

  const button = (
    <Comp
      data-slot="sidebar-menu-button"
      data-sidebar="menu-button"
      data-size={size}
      data-active={isActive}
      className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
      {...props}
    />
  );

  if (!tooltip) {
    return button;
  }

  if (typeof tooltip === "string") {
    tooltip = {
      children: tooltip,
    };
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent
        side="right"
        align="center"
        hidden={state !== "collapsed" || isMobile}
        {...tooltip}
      />
    </Tooltip>
  );
}

// ---------- Menu Action ----------
function SidebarMenuAction({
  className,
  asChild = false,
  showOnHover = false,
  ...props
}) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="sidebar-menu-action"
      data-sidebar="menu-action"
      className={cn(
        "absolute top-1.5 right-1 flex aspect-square w-5 items-center justify-center",
        "rounded-md p-0 outline-none transition-transform",
        "text-neutral-700 dark:text-neutral-300",
        "hover:bg-neutral-100 dark:hover:bg-neutral-800",
        "hover:text-primary-800 dark:hover:text-primary-200",
        "focus-visible:ring-2 focus-visible:ring-primary-500",
        "peer-hover/menu-button:text-primary-800 dark:peer-hover/menu-button:text-primary-200",
        "after:absolute after:-inset-2 md:after:hidden",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        showOnHover &&
          "peer-data-[active=true]/menu-button:text-primary-800 dark:peer-data-[active=true]/menu-button:text-primary-200 group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 md:opacity-0",
        "[&>svg]:h-4 [&>svg]:w-4 [&>svg]:shrink-0",
        className
      )}
      {...props}
    />
  );
}

// ---------- Menu Badge ----------
function SidebarMenuBadge({ className, ...props }) {
  return (
    <div
      data-slot="sidebar-menu-badge"
      data-sidebar="menu-badge"
      className={cn(
        "pointer-events-none absolute right-1 flex h-5 min-w-5 items-center justify-center",
        "rounded-full px-1 text-xs font-medium tabular-nums select-none",
        "bg-primary-100 dark:bg-primary-900/30",
        "text-primary-700 dark:text-primary-300",
        "peer-hover/menu-button:bg-primary-200 dark:peer-hover/menu-button:bg-primary-900/50",
        "peer-data-[active=true]/menu-button:bg-primary-200 dark:peer-data-[active=true]/menu-button:bg-primary-800",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  );
}

// ---------- Menu Skeleton ----------
function SidebarMenuSkeleton({
  className,
  showIcon = false,
  ...props
}) {
  const width = React.useMemo(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`;
  }, []);

  return (
    <div
      data-slot="sidebar-menu-skeleton"
      data-sidebar="menu-skeleton"
      className={cn("flex h-9 items-center gap-2.5 rounded-lg px-2.5", className)}
      {...props}
    >
      {showIcon && (
        <Skeleton
          className="h-4 w-4 rounded-md"
          data-sidebar="menu-skeleton-icon"
        />
      )}
      <Skeleton
        className="h-4 flex-1"
        data-sidebar="menu-skeleton-text"
        style={{
          maxWidth: width,
        }}
      />
    </div>
  );
}

// ---------- Menu Sub ----------
function SidebarMenuSub({ className, ...props }) {
  return (
    <ul
      data-slot="sidebar-menu-sub"
      data-sidebar="menu-sub"
      className={cn(
        "mx-3.5 flex min-w-0 translate-x-px flex-col gap-1",
        "border-l border-neutral-200 dark:border-neutral-800",
        "px-2.5 py-0.5",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  );
}

// ---------- Menu Sub Item ----------
function SidebarMenuSubItem({ className, ...props }) {
  return (
    <li
      data-slot="sidebar-menu-sub-item"
      data-sidebar="menu-sub-item"
      className={cn("group/menu-sub-item relative", className)}
      {...props}
    />
  );
}

// ---------- Menu Sub Button ----------
function SidebarMenuSubButton({
  asChild = false,
  size = "md",
  isActive = false,
  className,
  ...props
}) {
  const Comp = asChild ? Slot : "a";

  return (
    <Comp
      data-slot="sidebar-menu-sub-button"
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        "flex h-7 min-w-0 -translate-x-px items-center gap-2.5 overflow-hidden",
        "rounded-md px-2 outline-none transition-colors duration-200",
        "motion-reduce:transition-none",
        "text-neutral-700 dark:text-neutral-300",
        "hover:bg-neutral-100 dark:hover:bg-neutral-800",
        "hover:text-primary-800 dark:hover:text-primary-200",
        "active:bg-neutral-200 dark:active:bg-neutral-700",
        "focus-visible:ring-2 focus-visible:ring-primary-500",
        "disabled:pointer-events-none disabled:opacity-50",
        "aria-disabled:pointer-events-none aria-disabled:opacity-50",
        "data-[active=true]:bg-primary-100 dark:data-[active=true]:bg-primary-900/30",
        "data-[active=true]:text-primary-900 dark:data-[active=true]:text-primary-100",
        "data-[active=true]:font-medium",
        "[&>span:last-child]:truncate",
        "[&>svg]:h-4 [&>svg]:w-4 [&>svg]:shrink-0",
        "[&>svg]:text-primary-700 dark:[&>svg]:text-primary-400",
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  );
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
  sidebarMenuButtonVariants,
};
