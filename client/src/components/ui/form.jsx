"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { Controller, FormProvider, useFormContext, useFormState } from "react-hook-form";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

// ---------- Form Root ----------
const Form = FormProvider;

// ---------- Form Field Context ----------
const FormFieldContext = React.createContext({});

const FormField = ({ ...props }) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

// ---------- useFormField Hook ----------
const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState } = useFormContext();
  const formState = useFormState({ name: fieldContext.name });
  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

// ---------- Form Item Context ----------
const FormItemContext = React.createContext({});

// ---------- Form Item ----------
const FormItem = React.forwardRef(({ className, ...props }, ref) => {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div
        ref={ref}
        data-slot="form-item"
        className={cn("grid gap-2", className)}
        {...props}
      />
    </FormItemContext.Provider>
  );
});
FormItem.displayName = "FormItem";

// ---------- Form Label ----------
const FormLabel = React.forwardRef(
  ({ className, required, optional, children, ...props }, ref) => {
    const { error, formItemId } = useFormField();

    return (
      <Label
        ref={ref}
        data-slot="form-label"
        data-error={!!error}
        className={cn(
          "text-sm font-semibold text-neutral-800 dark:text-neutral-200",
          "data-[error=true]:text-red-600 dark:data-[error=true]:text-red-400",
          className
        )}
        htmlFor={formItemId}
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
      </Label>
    );
  }
);
FormLabel.displayName = "FormLabel";

// ---------- Form Control ----------
const FormControl = React.forwardRef(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

  return (
    <Slot
      ref={ref}
      data-slot="form-control"
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  );
});
FormControl.displayName = "FormControl";

// ---------- Form Description ----------
const FormDescription = React.forwardRef(
  ({ className, icon, ...props }, ref) => {
    const { formDescriptionId } = useFormField();

    return (
      <p
        ref={ref}
        data-slot="form-description"
        id={formDescriptionId}
        className={cn(
          "text-xs text-neutral-600 dark:text-neutral-400",
          "leading-relaxed flex items-start gap-1.5",
          className
        )}
        {...props}
      >
        {icon && (
          <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-neutral-500 dark:text-neutral-500" />
        )}
        <span>{props.children}</span>
      </p>
    );
  }
);
FormDescription.displayName = "FormDescription";

// ---------- Form Message ----------
const FormMessage = React.forwardRef(
  ({ className, variant = "error", ...props }, ref) => {
    const { error, formMessageId } = useFormField();
    const body = error ? String(error?.message ?? "") : props.children;

    if (!body) {
      return null;
    }

    const variantClasses = {
      error: "text-red-600 dark:text-red-400",
      warning: "text-yellow-600 dark:text-yellow-400",
      success: "text-green-600 dark:text-green-400",
      info: "text-blue-600 dark:text-blue-400",
    };

    const Icon = {
      error: AlertCircle,
      warning: AlertCircle,
      success: CheckCircle2,
      info: Info,
    }[variant];

    return (
      <p
        ref={ref}
        data-slot="form-message"
        id={formMessageId}
        className={cn(
          "text-xs font-medium flex items-start gap-1.5",
          variantClasses[variant],
          className
        )}
        {...props}
      >
        <Icon className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
        <span>{body}</span>
      </p>
    );
  }
);
FormMessage.displayName = "FormMessage";

// ---------- Form Success Message ----------
function FormSuccess({ className, children, ...props }) {
  if (!children) return null;

  return (
    <p
      data-slot="form-success"
      className={cn(
        "text-xs font-medium text-green-600 dark:text-green-400",
        "flex items-start gap-1.5",
        className
      )}
      {...props}
    >
      <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
      <span>{children}</span>
    </p>
  );
}

// ---------- Form Character Count ----------
function FormCharacterCount({
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
      data-slot="form-character-count"
      className={cn(
        "text-xs font-medium",
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

// ---------- Form Section ----------
const FormSection = React.forwardRef(
  ({ className, title, description, children, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="form-section"
      className={cn("space-y-4 sm:space-y-6", className)}
      {...props}
    >
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h3 className="text-base sm:text-lg font-semibold text-primary-800 dark:text-primary-200">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </div>
  )
);
FormSection.displayName = "FormSection";

// ---------- Form Actions ----------
const FormActions = React.forwardRef(
  ({ className, align = "end", ...props }, ref) => {
    const alignClasses = {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      between: "justify-between",
    };

    return (
      <div
        ref={ref}
        data-slot="form-actions"
        className={cn(
          "flex flex-col-reverse gap-2 sm:flex-row sm:gap-3",
          alignClasses[align],
          "pt-4 sm:pt-6",
          className
        )}
        {...props}
      />
    );
  }
);
FormActions.displayName = "FormActions";

// ---------- Form Card ----------
const FormCard = React.forwardRef(
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
      minimal: `
        bg-transparent p-0
      `,
    };

    return (
      <div
        ref={ref}
        data-slot="form-card"
        className={cn(variantClasses[variant], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
FormCard.displayName = "FormCard";

// ---------- Form Helper Text ----------
function FormHelperText({ className, children, ...props }) {
  return (
    <p
      data-slot="form-helper-text"
      className={cn(
        "text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed",
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
}

// ---------- Form Error Summary ----------
function FormErrorSummary({ errors, className, ...props }) {
  const errorEntries = Object.entries(errors || {});

  if (errorEntries.length === 0) return null;

  return (
    <div
      data-slot="form-error-summary"
      className={cn(
        "rounded-xl border-2 border-red-200 dark:border-red-900/50",
        "bg-red-50/50 dark:bg-red-950/20 p-4",
        className
      )}
      role="alert"
      {...props}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1 space-y-2">
          <p className="text-sm font-semibold text-red-900 dark:text-red-200">
            Please fix the following errors:
          </p>
          <ul className="space-y-1 text-sm text-red-700 dark:text-red-300 list-disc list-inside">
            {errorEntries.map(([field, error]) => (
              <li key={field}>{error.message}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ---------- Form Fieldset ----------
const FormFieldset = React.forwardRef(
  ({ className, legend, description, children, ...props }, ref) => (
    <fieldset
      ref={ref}
      data-slot="form-fieldset"
      className={cn("space-y-4", className)}
      {...props}
    >
      {legend && (
        <legend className="text-base font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
          {legend}
        </legend>
      )}
      {description && (
        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed -mt-1 mb-4">
          {description}
        </p>
      )}
      <div className="space-y-4">{children}</div>
    </fieldset>
  )
);
FormFieldset.displayName = "FormFieldset";

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormSuccess,
  FormCharacterCount,
  FormSection,
  FormActions,
  FormCard,
  FormHelperText,
  FormErrorSummary,
  FormFieldset,
  FormField,
};
