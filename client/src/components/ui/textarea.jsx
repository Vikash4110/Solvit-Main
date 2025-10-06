"use client";

import * as React from "react";
import { cva } from "class-variance-authority";
import { AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------- Textarea Variants ----------
const textareaVariants = cva(
  "flex w-full rounded-lg border text-sm transition-all duration-200 outline-none disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none",
  {
    variants: {
      variant: {
        default: `
          border-neutral-300 bg-white
          placeholder:text-neutral-500
          hover:border-neutral-400
          focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30
          aria-invalid:border-red-500 aria-invalid:ring-2 aria-invalid:ring-red-500/30
          dark:border-neutral-700 dark:bg-neutral-900
          dark:hover:border-neutral-600
          dark:focus:border-primary-500
          dark:placeholder:text-neutral-500
        `,
        filled: `
          border-transparent bg-neutral-100
          placeholder:text-neutral-500
          hover:bg-neutral-200
          focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30 focus:bg-white
          aria-invalid:border-red-500 aria-invalid:ring-2 aria-invalid:ring-red-500/30
          dark:bg-neutral-800
          dark:hover:bg-neutral-700
          dark:focus:bg-neutral-900
        `,
        outlined: `
          border-2 border-neutral-300 bg-white
          placeholder:text-neutral-500
          hover:border-neutral-400
          focus:border-primary-700 focus:ring-2 focus:ring-primary-500/30
          aria-invalid:border-red-500 aria-invalid:ring-2 aria-invalid:ring-red-500/30
          dark:border-neutral-700 dark:bg-neutral-900
          dark:hover:border-neutral-600
          dark:focus:border-primary-500
        `,
      },
      size: {
        sm: "min-h-20 px-3 py-2 text-sm",
        default: "min-h-24 px-4 py-2.5 text-sm",
        lg: "min-h-32 px-4 py-3 text-base",
      },
      resize: {
        none: "resize-none",
        vertical: "resize-y",
        horizontal: "resize-x",
        both: "resize",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      resize: "vertical",
    },
  }
);

// ---------- Textarea Component ----------
const Textarea = React.forwardRef(
  (
    {
      className,
      variant,
      size,
      resize,
      autoResize = false,
      maxLength,
      showCount = false,
      isLoading = false,
      ...props
    },
    ref
  ) => {
    const textareaRef = React.useRef(null);
    const combinedRef = (node) => {
      textareaRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    // Auto-resize functionality
    React.useEffect(() => {
      if (autoResize && textareaRef.current) {
        const textarea = textareaRef.current;
        const adjustHeight = () => {
          textarea.style.height = "auto";
          textarea.style.height = `${textarea.scrollHeight}px`;
        };
        adjustHeight();
        textarea.addEventListener("input", adjustHeight);
        return () => textarea.removeEventListener("input", adjustHeight);
      }
    }, [autoResize, props.value]);

    const currentLength = props.value?.toString().length || 0;
    const percentage = maxLength ? (currentLength / maxLength) * 100 : 0;
    const isNearLimit = percentage >= 80;
    const isOverLimit = percentage > 100;

    return (
      <div className="w-full space-y-2">
        <div className="relative">
          <textarea
            ref={combinedRef}
            data-slot="textarea"
            maxLength={maxLength}
            className={cn(
              textareaVariants({ variant, size, resize: autoResize ? "none" : resize }),
              showCount && maxLength && "pb-8",
              isLoading && "pr-10",
              className
            )}
            {...props}
          />
          {isLoading && (
            <div className="absolute top-3 right-3">
              <Loader2 className="h-4 w-4 animate-spin text-neutral-500" />
            </div>
          )}
        </div>
        {showCount && maxLength && (
          <div
            className={cn(
              "flex items-center justify-end text-xs font-medium tabular-nums",
              isOverLimit
                ? "text-red-600 dark:text-red-400"
                : isNearLimit
                ? "text-yellow-600 dark:text-yellow-400"
                : "text-neutral-500 dark:text-neutral-500"
            )}
          >
            {currentLength} / {maxLength}
            {isOverLimit && (
              <span className="ml-1">({currentLength - maxLength} over limit)</span>
            )}
          </div>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

// ---------- Textarea Label ----------
const TextareaLabel = React.forwardRef(
  ({ className, required, optional, children, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "text-sm font-semibold text-neutral-800 dark:text-neutral-200",
        "mb-2 block",
        className
      )}
      {...props}
    >
      {children}
      {required && (
        <span className="ml-1 text-red-600 dark:text-red-400" aria-label="required">
          *
        </span>
      )}
      {optional && (
        <span className="ml-1.5 text-xs font-normal text-neutral-500 dark:text-neutral-400">
          (optional)
        </span>
      )}
    </label>
  )
);
TextareaLabel.displayName = "TextareaLabel";

// ---------- Textarea Description ----------
const TextareaDescription = React.forwardRef(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(
        "text-xs text-neutral-600 dark:text-neutral-400",
        "mb-2 leading-relaxed",
        className
      )}
      {...props}
    />
  )
);
TextareaDescription.displayName = "TextareaDescription";

// ---------- Textarea Error ----------
const TextareaError = React.forwardRef(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(
        "text-xs font-medium text-red-600 dark:text-red-400",
        "mt-2 flex items-start gap-1",
        className
      )}
      role="alert"
      {...props}
    >
      <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
      <span>{props.children}</span>
    </p>
  )
);
TextareaError.displayName = "TextareaError";

// ---------- Textarea Container ----------
const TextareaContainer = React.forwardRef(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("space-y-2 w-full", className)}
      {...props}
    />
  )
);
TextareaContainer.displayName = "TextareaContainer";

// ---------- Textarea With Label ----------
const TextareaWithLabel = React.forwardRef(
  (
    {
      label,
      description,
      error,
      required,
      optional,
      className,
      containerClassName,
      ...props
    },
    ref
  ) => (
    <TextareaContainer className={containerClassName}>
      {label && (
        <TextareaLabel required={required} optional={optional}>
          {label}
        </TextareaLabel>
      )}
      {description && !error && (
        <TextareaDescription>{description}</TextareaDescription>
      )}
      <Textarea ref={ref} aria-invalid={!!error} className={className} {...props} />
      {error && <TextareaError>{error}</TextareaError>}
    </TextareaContainer>
  )
);
TextareaWithLabel.displayName = "TextareaWithLabel";

// ---------- Textarea Auto Resize ----------
const TextareaAutoResize = React.forwardRef(
  ({ className, ...props }, ref) => (
    <Textarea
      ref={ref}
      autoResize
      className={cn("overflow-hidden", className)}
      {...props}
    />
  )
);
TextareaAutoResize.displayName = "TextareaAutoResize";

// ---------- Textarea With Count ----------
const TextareaWithCount = React.forwardRef(
  ({ maxLength = 500, ...props }, ref) => (
    <Textarea
      ref={ref}
      maxLength={maxLength}
      showCount
      {...props}
    />
  )
);
TextareaWithCount.displayName = "TextareaWithCount";

// ---------- Textarea Card ----------
const TextareaCard = React.forwardRef(
  (
    {
      className,
      title,
      description,
      error,
      required,
      optional,
      children,
      ...props
    },
    ref
  ) => (
    <div
      className={cn(
        "rounded-xl border border-neutral-200 dark:border-neutral-800",
        "bg-white dark:bg-neutral-900 shadow-sm overflow-hidden p-4 space-y-3",
        className
      )}
    >
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <TextareaLabel required={required} optional={optional}>
              {title}
            </TextareaLabel>
          )}
          {description && !error && (
            <TextareaDescription>{description}</TextareaDescription>
          )}
        </div>
      )}
      <Textarea ref={ref} aria-invalid={!!error} {...props} />
      {error && <TextareaError>{error}</TextareaError>}
      {children}
    </div>
  )
);
TextareaCard.displayName = "TextareaCard";

export {
  Textarea,
  TextareaLabel,
  TextareaDescription,
  TextareaError,
  TextareaContainer,
  TextareaWithLabel,
  TextareaAutoResize,
  TextareaWithCount,
  TextareaCard,
  textareaVariants,
};
