"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import { Eye, EyeOff, Lock } from "lucide-react";
import Link from "next/link";
import { Input as InputPrimitive } from "@base-ui/react/input";
import { cn } from "@/lib/utils";

type BaseFieldProps = {
  label: string;
  name: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
};

type InputFieldProps = BaseFieldProps & {
  type?: React.HTMLInputTypeAttribute;
  // Input-specific props
};

type TextareaFieldProps = BaseFieldProps & {
  type: "textarea";
  rows?: number;
  cols?: number;
};

type FieldProps = InputFieldProps | TextareaFieldProps;

export function InputReactHookForm({
  label,
  name,
  type,
  placeholder,
  disabled,
  className,
  icon,
}: FieldProps) {
  const { register, getFieldState, formState, watch } = useFormContext();

  // Force subscription to this field
  const _value = watch(name);

  const fieldState = getFieldState(name, formState);

  const { error, isDirty, isTouched, invalid } = fieldState;

  React.useEffect(() => {
    console.log(`------ ${name} ------`);
    console.log("Value:", _value);
    console.log("Error:", error);
    console.log("Dirty:", isDirty);
    console.log("Touched:", isTouched);
    console.log("Invalid:", invalid);
    console.log("----------------------");
  }, [_value, error, isDirty, isTouched, invalid, name]);

  const field = register(name);

  const [showPassword, setShowPassword] = React.useState(false);

  const inputType =
    type === "password" ? (showPassword ? "text" : "password") : type;

  if (type === "textarea") {
    return (
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <label htmlFor={name} className="font-semibold text-sm">
            {label}
          </label>
        </div>

        <div className="relative">
          <textarea
            {...field}
            id={name}
            disabled={disabled}
            placeholder={placeholder}
            className={cn(
              "w-full h-[100px] py-2 border border-outline-variant/40 rounded-lg outline-none transition-all",
              icon || type === "password" ? "pl-12 pr-12" : "px-4",
              error && "border-red-500",
              className,
            )}
            onChange={(e) => {
              // console.log(`${name} onChange ->`, e.target.value);
              field.onChange(e);
            }}
            onBlur={(e) => {
              // console.log(`${name} onBlur`);
              field.onBlur(e);
            }}
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm">{String(error.message)}</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <label htmlFor={name} className="font-semibold text-sm">
          {label}
        </label>

        {type === "password" && (
          <Link href="#" className="text-sm text-secondary">
            Forgot Password?
          </Link>
        )}
      </div>

      <div className="relative">
        {(icon || type === "password") && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2">
            {icon ?? <Lock size={20} />}
          </span>
        )}

        <InputPrimitive
          {...field}
          id={name}
          type={type}
          disabled={disabled}
          placeholder={placeholder}
          data-slot="input"
          className={cn(
            "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
            className,
          )}
          onChange={(e) => {
            // console.log(`${name} onChange ->`, e.target.value);
            field.onChange(e);
          }}
          onBlur={(e) => {
            // console.log(`${name} onBlur`);
            field.onBlur(e);
          }}
        />

        {type === "password" && (
          <button
            type="button"
            className="absolute right-4 top-1/2 -translate-y-1/2"
            onClick={() => setShowPassword((p) => !p)}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>

      {error && <p className="text-red-500 text-sm">{String(error.message)}</p>}
    </div>
  );
}

