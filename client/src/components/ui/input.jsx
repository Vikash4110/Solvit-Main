import * as React from "react";
import { cva } from "class-variance-authority";
import { Eye, EyeOff, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------- Input Variants ----------
const inputVariants = cva(
  "w-full min-w-0 rounded-lg text-base transition-all duration-200 outline-none disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none md:text-sm",
  {
    variants: {
      variant: {
        default: `
          border border-neutral-300 bg-white
          placeholder:text-neutral-500
          focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/30
          aria-invalid:border-red-500 aria-invalid:ring-2 aria-invalid:ring-red-500/30
          dark:border-neutral-700 dark:bg-neutral-900
          dark:placeholder:text-neutral-500
          dark:focus-visible:border-primary-500 dark:focus-visible:ring-primary-500/30
          dark:aria-invalid:border-red-500 dark:aria-invalid:ring-red-500/30
        `,
        filled: `
          border border-transparent bg-neutral-100
          placeholder:text-neutral-500
          focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/30
          focus-visible:bg-white
          aria-invalid:border-red-500 aria-invalid:ring-2 aria-invalid:ring-red-500/30
          dark:bg-neutral-800 dark:placeholder:text-neutral-500
          dark:focus-visible:bg-neutral-900 dark:focus-visible:border-primary-500
        `,
        outlined: `
          border-2 border-neutral-300 bg-white
          placeholder:text-neutral-500
          focus-visible:border-primary-700 focus-visible:ring-2 focus-visible:ring-primary-500/30
          aria-invalid:border-red-500 aria-invalid:ring-2 aria-invalid:ring-red-500/30
          dark:border-neutral-700 dark:bg-neutral-900
          dark:focus-visible:border-primary-500
        `,
        ghost: `
          border border-transparent bg-transparent
          placeholder:text-neutral-500
          hover:bg-neutral-50
          focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/30
          focus-visible:bg-white
          aria-invalid:border-red-500 aria-invalid:ring-2 aria-invalid:ring-red-500/30
          dark:hover:bg-neutral-900
          dark:focus-visible:bg-neutral-900
        `,
      },
      size: {
        sm: "h-9 px-3 py-1.5 text-sm",
        default: "h-10 px-4 py-2",
        lg: "h-12 px-5 py-3 text-base",
      },
      state: {
        default: "",
        error: "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/30",
        success: "border-green-500 focus-visible:border-green-500 focus-visible:ring-green-500/30",
        warning: "border-yellow-500 focus-visible:border-yellow-500 focus-visible:ring-yellow-500/30",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      state: "default",
    },
  }
);

// ---------- Input Component ----------
const Input = React.forwardRef(
  (
    {
      className,
      type = "text",
      variant,
      size,
      state,
      leftIcon,
      rightIcon,
      isLoading,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === "password";
    const inputType = isPassword && showPassword ? "text" : type;

    const hasLeftElement = leftIcon || isLoading;
    const hasRightElement = rightIcon || isPassword;

    if (hasLeftElement || hasRightElement) {
      return (
        <div className="relative w-full">
          {hasLeftElement && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 dark:text-neutral-400">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                leftIcon
              )}
            </div>
          )}
          <input
            ref={ref}
            type={inputType}
            data-slot="input"
            className={cn(
              inputVariants({ variant, size, state }),
              hasLeftElement && "pl-10",
              hasRightElement && "pr-10",
              // File input styling
              "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-neutral-700 dark:file:text-neutral-300",
              // Selection styling
              "selection:bg-primary-200 selection:text-primary-900 dark:selection:bg-primary-800 dark:selection:text-primary-100",
              className
            )}
            {...props}
          />
          {hasRightElement && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isPassword ? (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  <span className="sr-only">
                    {showPassword ? "Hide password" : "Show password"}
                  </span>
                </button>
              ) : (
                <div className="text-neutral-500 dark:text-neutral-400">
                  {rightIcon}
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    return (
      <input
        ref={ref}
        type={inputType}
        data-slot="input"
        className={cn(
          inputVariants({ variant, size, state }),
          "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-neutral-700 dark:file:text-neutral-300",
          "selection:bg-primary-200 selection:text-primary-900 dark:selection:bg-primary-800 dark:selection:text-primary-100",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

// ---------- Input Label ----------
const InputLabel = React.forwardRef(
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
InputLabel.displayName = "InputLabel";

// ---------- Input Description ----------
const InputDescription = React.forwardRef(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(
        "text-xs text-neutral-600 dark:text-neutral-400",
        "mt-1.5 leading-relaxed",
        className
      )}
      {...props}
    />
  )
);
InputDescription.displayName = "InputDescription";

// ---------- Input Error ----------
const InputError = React.forwardRef(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(
        "text-xs font-medium text-red-600 dark:text-red-400",
        "mt-1.5 flex items-start gap-1",
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
InputError.displayName = "InputError";

// ---------- Input Success ----------
const InputSuccess = React.forwardRef(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(
        "text-xs font-medium text-green-600 dark:text-green-400",
        "mt-1.5 flex items-start gap-1",
        className
      )}
      {...props}
    >
      <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
      <span>{props.children}</span>
    </p>
  )
);
InputSuccess.displayName = "InputSuccess";

// ---------- Input Container ----------
const InputContainer = React.forwardRef(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("space-y-2 w-full", className)}
      {...props}
    />
  )
);
InputContainer.displayName = "InputContainer";

// ---------- Input Group ----------
const InputGroup = React.forwardRef(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-stretch w-full", className)}
      {...props}
    >
      {children}
    </div>
  )
);
InputGroup.displayName = "InputGroup";

// ---------- Input Addon ----------
const InputAddon = React.forwardRef(
  ({ className, position = "left", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center px-3 bg-neutral-100 dark:bg-neutral-800",
        "border border-neutral-300 dark:border-neutral-700",
        "text-sm text-neutral-600 dark:text-neutral-400",
        position === "left" && "rounded-l-lg border-r-0",
        position === "right" && "rounded-r-lg border-l-0",
        className
      )}
      {...props}
    />
  )
);
InputAddon.displayName = "InputAddon";

// ---------- Input Character Count ----------
function InputCharacterCount({
  value = "",
  maxLength,
  showCount = true,
  className,
  ...props
}) {
  const currentLength = value?.length || 0;
  const percentage = maxLength ? (currentLength / maxLength) * 100 : 0;
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  return (
    <div
      className={cn(
        "text-xs font-medium text-right",
        isAtLimit
          ? "text-red-600 dark:text-red-400"
          : isNearLimit
          ? "text-yellow-600 dark:text-yellow-400"
          : "text-neutral-500 dark:text-neutral-500",
        className
      )}
      {...props}
    >
      {showCount && (
        <span>
          {currentLength}
          {maxLength && ` / ${maxLength}`}
        </span>
      )}
    </div>
  );
}

// ---------- Input With Label ----------
const InputWithLabel = React.forwardRef(
  (
    {
      label,
      description,
      error,
      success,
      required,
      optional,
      className,
      containerClassName,
      ...props
    },
    ref
  ) => (
    <InputContainer className={containerClassName}>
      {label && (
        <InputLabel required={required} optional={optional}>
          {label}
        </InputLabel>
      )}
      <Input ref={ref} state={error ? "error" : success ? "success" : "default"} className={className} {...props} />
      {description && !error && !success && (
        <InputDescription>{description}</InputDescription>
      )}
      {error && <InputError>{error}</InputError>}
      {success && <InputSuccess>{success}</InputSuccess>}
    </InputContainer>
  )
);
InputWithLabel.displayName = "InputWithLabel";

export {
  Input,
  InputLabel,
  InputDescription,
  InputError,
  InputSuccess,
  InputContainer,
  InputGroup,
  InputAddon,
  InputCharacterCount,
  InputWithLabel,
  inputVariants,
};
