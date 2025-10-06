"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";
import { cn } from "@/lib/utils";

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = {
  light: "",
  dark: ".dark",
};

const ChartContext = React.createContext(null);

function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }

  return context;
}

// ---------- Chart Container ----------
function ChartContainer({
  id,
  className,
  children,
  config,
  variant = "default",
  aspectRatio = "video",
  isLoading = false,
  ...props
}) {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

  const variantClasses = {
    default: `
      bg-white/95 backdrop-blur-md border border-neutral-200
      rounded-xl shadow-sm
      dark:bg-neutral-900/95 dark:border-neutral-800
    `,
    "default-lite": `
      bg-white border border-neutral-200
      rounded-lg
      dark:bg-neutral-900 dark:border-neutral-800
    `,
    glass: `
      bg-white/20 backdrop-blur-xl border border-white/30
      rounded-2xl shadow-lg
      dark:bg-neutral-900/20 dark:border-neutral-800/30
    `,
    elevated: `
      bg-gradient-to-br from-white to-neutral-50/90
      backdrop-blur-lg border border-neutral-200/60
      rounded-2xl shadow-xl
      dark:from-neutral-900 dark:to-neutral-800/90
      dark:border-neutral-800/60
    `,
    minimal: `
      bg-transparent
    `,
  };

  const aspectRatioClasses = {
    video: "aspect-video",
    square: "aspect-square",
    wide: "aspect-[21/9]",
    portrait: "aspect-[3/4]",
    auto: "",
  };

  if (isLoading) {
    return (
      <div
        className={cn(
          "flex items-center justify-center p-6 sm:p-8",
          variantClasses[variant],
          aspectRatioClasses[aspectRatio],
          className
        )}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-neutral-200 border-t-primary-700 dark:border-neutral-700 dark:border-t-primary-500" />
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Loading chart...
          </p>
        </div>
      </div>
    );
  }

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "flex justify-center text-xs p-4 sm:p-6",
          aspectRatioClasses[aspectRatio],
          variantClasses[variant],
          "[&_.recharts-cartesian-axis-tick_text]:fill-neutral-600",
          "dark:[&_.recharts-cartesian-axis-tick_text]:fill-neutral-400",
          "[&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-neutral-200",
          "dark:[&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-neutral-800",
          "[&_.recharts-curve.recharts-tooltip-cursor]:stroke-neutral-300",
          "dark:[&_.recharts-curve.recharts-tooltip-cursor]:stroke-neutral-700",
          "[&_.recharts-polar-grid_[stroke='#ccc']]:stroke-neutral-200",
          "dark:[&_.recharts-polar-grid_[stroke='#ccc']]:stroke-neutral-800",
          "[&_.recharts-radial-bar-background-sector]:fill-neutral-100",
          "dark:[&_.recharts-radial-bar-background-sector]:fill-neutral-800",
          "[&_.recharts-rectangle.recharts-tooltip-cursor]:fill-neutral-100",
          "dark:[&_.recharts-rectangle.recharts-tooltip-cursor]:fill-neutral-800",
          "[&_.recharts-reference-line_[stroke='#ccc']]:stroke-neutral-200",
          "dark:[&_.recharts-reference-line_[stroke='#ccc']]:stroke-neutral-800",
          "[&_.recharts-dot[stroke='#fff']]:stroke-transparent",
          "[&_.recharts-layer]:outline-none",
          "[&_.recharts-sector]:outline-none",
          "[&_.recharts-sector[stroke='#fff']]:stroke-transparent",
          "[&_.recharts-surface]:outline-none",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

// ---------- Chart Style ----------
const ChartStyle = ({ id, config }) => {
  const colorConfig = Object.entries(config).filter(
    ([, config]) => config.theme || config.color
  );

  if (!colorConfig.length) {
    return null;
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color = itemConfig.theme?.[theme] || itemConfig.color;
    return color ? `  --color-${key}: ${color};` : null;
  })
  .join("\n")}
}
`
          )
          .join("\n"),
      }}
    />
  );
};

// ---------- Chart Tooltip ----------
const ChartTooltip = RechartsPrimitive.Tooltip;

const ChartTooltipContent = React.forwardRef(
  (
    {
      active,
      payload,
      className,
      indicator = "dot",
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      labelClassName,
      formatter,
      color,
      nameKey,
      labelKey,
      variant = "default",
    },
    ref
  ) => {
    const { config } = useChart();

    const tooltipLabel = React.useMemo(() => {
      if (hideLabel || !payload?.length) {
        return null;
      }

      const [item] = payload;
      const key = `${labelKey || item?.dataKey || item?.name || "value"}`;
      const itemConfig = getPayloadConfigFromPayload(config, item, key);
      const value =
        !labelKey && typeof label === "string"
          ? config[label]?.label || label
          : itemConfig?.label;

      if (labelFormatter) {
        return (
          <div className={cn("font-semibold text-sm", labelClassName)}>
            {labelFormatter(value, payload)}
          </div>
        );
      }

      if (!value) {
        return null;
      }

      return (
        <div className={cn("font-semibold text-sm", labelClassName)}>
          {value}
        </div>
      );
    }, [label, labelFormatter, payload, hideLabel, labelClassName, config, labelKey]);

    if (!active || !payload?.length) {
      return null;
    }

    const nestLabel = payload.length === 1 && indicator !== "dot";

    const variantClasses = {
      default: `
        bg-white/98 backdrop-blur-xl border border-neutral-200
        shadow-xl
        dark:bg-neutral-900/98 dark:border-neutral-800
      `,
      glass: `
        bg-white/90 backdrop-blur-2xl border border-white/40
        shadow-2xl
        dark:bg-neutral-900/90 dark:border-neutral-800/40
      `,
      solid: `
        bg-white border border-neutral-200
        shadow-lg
        dark:bg-neutral-900 dark:border-neutral-800
      `,
    };

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-[10rem] items-start gap-2",
          "rounded-xl px-3 py-2.5 text-xs sm:text-sm",
          "motion-reduce:transition-none",
          variantClasses[variant],
          className
        )}
      >
        {!nestLabel ? tooltipLabel : null}
        <div className="grid gap-2">
          {payload
            .filter((item) => item.type !== "none")
            .map((item, index) => {
              const key = `${nameKey || item.name || item.dataKey || "value"}`;
              const itemConfig = getPayloadConfigFromPayload(config, item, key);
              const indicatorColor = color || item.payload.fill || item.color;

              return (
                <div
                  key={item.dataKey}
                  className={cn(
                    "flex w-full flex-wrap items-stretch gap-2",
                    "[&>svg]:text-neutral-600 dark:[&>svg]:text-neutral-400",
                    "[&>svg]:h-3 [&>svg]:w-3",
                    indicator === "dot" && "items-center"
                  )}
                >
                  {formatter && item?.value !== undefined && item.name ? (
                    formatter(item.value, item.name, item, index, item.payload)
                  ) : (
                    <>
                      {itemConfig?.icon ? (
                        <itemConfig.icon />
                      ) : (
                        !hideIndicator && (
                          <div
                            className={cn(
                              "shrink-0 rounded-sm border-(--color-border) bg-(--color-bg)",
                              {
                                "h-3 w-3": indicator === "dot",
                                "w-1 h-4": indicator === "line",
                                "w-0 border-[2px] border-dashed bg-transparent h-4":
                                  indicator === "dashed",
                                "my-0.5": nestLabel && indicator === "dashed",
                              }
                            )}
                            style={
                              {
                                "--color-bg": indicatorColor,
                                "--color-border": indicatorColor,
                              } as React.CSSProperties
                            }
                          />
                        )
                      )}
                      <div
                        className={cn(
                          "flex flex-1 justify-between leading-tight",
                          nestLabel ? "items-end" : "items-center"
                        )}
                      >
                        <div className="grid gap-1">
                          {nestLabel ? tooltipLabel : null}
                          <span className="text-neutral-600 dark:text-neutral-400 font-medium">
                            {itemConfig?.label || item.name}
                          </span>
                        </div>
                        {item.value && (
                          <span className="text-primary-800 dark:text-primary-200 font-semibold tabular-nums">
                            {item.value.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    );
  }
);
ChartTooltipContent.displayName = "ChartTooltipContent";

// ---------- Chart Legend ----------
const ChartLegend = RechartsPrimitive.Legend;

const ChartLegendContent = React.forwardRef(
  (
    {
      className,
      hideIcon = false,
      payload,
      verticalAlign = "bottom",
      nameKey,
      variant = "default",
    },
    ref
  ) => {
    const { config } = useChart();

    if (!payload?.length) {
      return null;
    }

    const variantClasses = {
      default: "gap-4 sm:gap-6",
      compact: "gap-3 sm:gap-4",
      pills: "gap-2",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-wrap items-center justify-center",
          verticalAlign === "top" ? "pb-3 sm:pb-4" : "pt-3 sm:pt-4",
          variantClasses[variant],
          className
        )}
      >
        {payload
          .filter((item) => item.type !== "none")
          .map((item) => {
            const key = `${nameKey || item.dataKey || "value"}`;
            const itemConfig = getPayloadConfigFromPayload(config, item, key);

            return (
              <div
                key={item.value}
                className={cn(
                  "flex items-center gap-2",
                  "[&>svg]:text-neutral-600 dark:[&>svg]:text-neutral-400",
                  "[&>svg]:h-4 [&>svg]:w-4",
                  variant === "pills" &&
                    "bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 rounded-full"
                )}
              >
                {itemConfig?.icon && !hideIcon ? (
                  <itemConfig.icon />
                ) : (
                  <div
                    className="h-3 w-3 shrink-0 rounded-sm"
                    style={{
                      backgroundColor: item.color,
                    }}
                  />
                )}
                <span className="text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  {itemConfig?.label}
                </span>
              </div>
            );
          })}
      </div>
    );
  }
);
ChartLegendContent.displayName = "ChartLegendContent";

// ---------- Helper Functions ----------
function getPayloadConfigFromPayload(config, payload, key) {
  if (typeof payload !== "object" || payload === null) {
    return undefined;
  }

  const payloadPayload =
    "payload" in payload &&
    typeof payload.payload === "object" &&
    payload.payload !== null
      ? payload.payload
      : undefined;

  let configLabelKey = key;

  if (key in payload && typeof payload[key] === "string") {
    configLabelKey = payload[key];
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key] === "string"
  ) {
    configLabelKey = payloadPayload[key];
  }

  return configLabelKey in config ? config[configLabelKey] : config[key];
}

// ---------- Chart Title ----------
function ChartTitle({ className, children, ...props }) {
  return (
    <h3
      className={cn(
        "text-base sm:text-lg font-semibold text-primary-800 dark:text-primary-200",
        "mb-3 sm:mb-4",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

// ---------- Chart Description ----------
function ChartDescription({ className, children, ...props }) {
  return (
    <p
      className={cn(
        "text-xs sm:text-sm text-neutral-600 dark:text-neutral-400",
        "mb-4 sm:mb-6",
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
}

// ---------- Chart Empty State ----------
function ChartEmptyState({ className, message = "No data available", ...props }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 sm:p-12",
        "text-center",
        className
      )}
      {...props}
    >
      <svg
        className="h-12 w-12 sm:h-16 sm:w-16 text-neutral-300 dark:text-neutral-700 mb-3"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
      <p className="text-sm sm:text-base font-medium text-neutral-600 dark:text-neutral-400">
        {message}
      </p>
    </div>
  );
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
  ChartTitle,
  ChartDescription,
  ChartEmptyState,
};
