"use client";

import * as React from "react";
import { OTPInput, OTPInputContext } from "input-otp";
import { Minus } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------- Input OTP Root ----------
const InputOTP = React.forwardRef(
  (
    {
      className,
      containerClassName,
      variant = "default",
      size = "default",
      ...props
    },
    ref
  ) => {
    return (
      <OTPInput
        ref={ref}
        data-slot="input-otp"
        containerClassName={cn(
          "flex items-center gap-2",
          "has-disabled:opacity-50 has-disabled:cursor-not-allowed",
          containerClassName
        )}
        className={cn("disabled:cursor-not-allowed", className)}
        {...props}
      />
    );
  }
);
InputOTP.displayName = "InputOTP";

// ---------- Input OTP Group ----------
const InputOTPGroup = React.forwardRef(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="input-otp-group"
      className={cn("flex items-center", className)}
      {...props}
    />
  )
);
InputOTPGroup.displayName = "InputOTPGroup";

// ---------- Input OTP Slot ----------
const InputOTPSlot = React.forwardRef(
  ({ index, className, variant = "default", size = "default", ...props }, ref) => {
    const inputOTPContext = React.useContext(OTPInputContext);
    const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {};

    const variantClasses = {
      default: `
        border-neutral-300 bg-white
        dark:border-neutral-700 dark:bg-neutral-900
        data-[active=true]:border-primary-500 data-[active=true]:ring-primary-500/30
        dark:data-[active=true]:border-primary-500 dark:data-[active=true]:ring-primary-500/30
      `,
      filled: `
        border-neutral-300 bg-neutral-50
        dark:border-neutral-700 dark:bg-neutral-800/50
        data-[active=true]:border-primary-500 data-[active=true]:ring-primary-500/30
        dark:data-[active=true]:border-primary-500 dark:data-[active=true]:ring-primary-500/30
      `,
      outlined: `
        border-2 border-neutral-300 bg-white
        dark:border-neutral-700 dark:bg-neutral-900
        data-[active=true]:border-primary-700 data-[active=true]:ring-primary-500/30
        dark:data-[active=true]:border-primary-500 dark:data-[active=true]:ring-primary-500/30
      `,
    };

    const sizeClasses = {
      sm: "h-9 w-9 text-sm",
      default: "h-11 w-11 text-base",
      lg: "h-14 w-14 text-lg",
    };

    return (
      <div
        ref={ref}
        data-slot="input-otp-slot"
        data-active={isActive}
        className={cn(
          "relative flex items-center justify-center",
          "border-y border-r text-center font-semibold",
          "shadow-sm transition-all duration-200 outline-none",
          "motion-reduce:transition-none",
          "text-primary-800 dark:text-primary-200",
          // First and last slot styling
          "first:rounded-l-lg first:border-l",
          "last:rounded-r-lg",
          // Active state
          "data-[active=true]:z-10 data-[active=true]:ring-2",
          // Invalid state
          "aria-invalid:border-red-500 aria-invalid:ring-red-500/30",
          "data-[active=true]:aria-invalid:border-red-500",
          "data-[active=true]:aria-invalid:ring-red-500/30",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {char}
        {hasFakeCaret && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div
              className={cn(
                "w-px bg-primary-700 dark:bg-primary-400",
                "animate-caret-blink duration-1000",
                size === "sm" && "h-4",
                size === "default" && "h-5",
                size === "lg" && "h-6"
              )}
            />
          </div>
        )}
      </div>
    );
  }
);
InputOTPSlot.displayName = "InputOTPSlot";

// ---------- Input OTP Separator ----------
const InputOTPSeparator = React.forwardRef(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="input-otp-separator"
      role="separator"
      className={cn(
        "flex items-center justify-center",
        "text-neutral-500 dark:text-neutral-500",
        className
      )}
      {...props}
    >
      <Minus className="h-4 w-4" />
    </div>
  )
);
InputOTPSeparator.displayName = "InputOTPSeparator";

// ---------- Input OTP Label ----------
const InputOTPLabel = React.forwardRef(
  ({ className, required, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "text-sm font-semibold text-neutral-800 dark:text-neutral-200",
        "mb-2 block",
        className
      )}
      {...props}
    >
      {props.children}
      {required && (
        <span className="ml-1 text-red-600 dark:text-red-400" aria-label="required">
          *
        </span>
      )}
    </label>
  )
);
InputOTPLabel.displayName = "InputOTPLabel";

// ---------- Input OTP Description ----------
const InputOTPDescription = React.forwardRef(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(
        "text-xs text-neutral-600 dark:text-neutral-400",
        "mt-2 leading-relaxed",
        className
      )}
      {...props}
    />
  )
);
InputOTPDescription.displayName = "InputOTPDescription";

// ---------- Input OTP Error ----------
const InputOTPError = React.forwardRef(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(
        "text-xs font-medium text-red-600 dark:text-red-400",
        "mt-2 flex items-center gap-1",
        className
      )}
      role="alert"
      {...props}
    />
  )
);
InputOTPError.displayName = "InputOTPError";

// ---------- Input OTP Success ----------
const InputOTPSuccess = React.forwardRef(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(
        "text-xs font-medium text-green-600 dark:text-green-400",
        "mt-2 flex items-center gap-1",
        className
      )}
      {...props}
    />
  )
);
InputOTPSuccess.displayName = "InputOTPSuccess";

// ---------- Input OTP Container ----------
const InputOTPContainer = React.forwardRef(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("space-y-2", className)}
      {...props}
    >
      {children}
    </div>
  )
);
InputOTPContainer.displayName = "InputOTPContainer";

// ---------- Input OTP Timer ----------
function InputOTPTimer({
  seconds,
  onResend,
  resendText = "Resend code",
  className,
  ...props
}) {
  const [timeLeft, setTimeLeft] = React.useState(seconds);

  React.useEffect(() => {
    if (timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  if (timeLeft <= 0) {
    return (
      <button
        type="button"
        onClick={() => {
          onResend?.();
          setTimeLeft(seconds);
        }}
        className={cn(
          "text-sm font-medium text-primary-700 dark:text-primary-400",
          "hover:text-primary-800 dark:hover:text-primary-300",
          "hover:underline underline-offset-2",
          "transition-colors duration-200",
          "motion-reduce:transition-none",
          className
        )}
        {...props}
      >
        {resendText}
      </button>
    );
  }

  return (
    <p
      className={cn(
        "text-sm text-neutral-600 dark:text-neutral-400",
        "font-medium tabular-nums",
        className
      )}
      {...props}
    >
      Resend code in {minutes}:{secs.toString().padStart(2, "0")}
    </p>
  );
}

// ---------- Input OTP Card ----------
const InputOTPCard = React.forwardRef(
  ({ className, variant = "default", children, ...props }, ref) => {
    const variantClasses = {
      default: `
        bg-white/95 backdrop-blur-md border border-neutral-200
        rounded-xl shadow-sm p-4 sm:p-6
        dark:bg-neutral-900/95 dark:border-neutral-800
      `,
      glass: `
        bg-white/20 backdrop-blur-xl border border-white/30
        rounded-2xl shadow-lg p-4 sm:p-6
        dark:bg-neutral-900/20 dark:border-neutral-800/30
      `,
      elevated: `
        bg-gradient-to-br from-white to-neutral-50/90
        backdrop-blur-lg border border-neutral-200/60
        rounded-xl shadow-md p-4 sm:p-6
        dark:from-neutral-900 dark:to-neutral-800/90
        dark:border-neutral-800/60
      `,
    };

    return (
      <div
        ref={ref}
        className={cn(variantClasses[variant], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
InputOTPCard.displayName = "InputOTPCard";

export {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
  InputOTPLabel,
  InputOTPDescription,
  InputOTPError,
  InputOTPSuccess,
  InputOTPContainer,
  InputOTPTimer,
  InputOTPCard,
};
