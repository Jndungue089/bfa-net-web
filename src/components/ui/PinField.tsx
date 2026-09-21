"use client";
import { Field, inputClass } from "./Field";
import { cn } from "@/lib/cn";

interface Props extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "maxLength" | "inputMode"> {
  label: string;
  error?: string;
  hint?: string;
}

/**
 * 6-digit PIN. Masked, numeric keypad, no autofill/suggestions, and non-digits are dropped as typed
 * so the value in the form is always clean.
 */
export function PinField({ label, error, hint, className, onChange, ...rest }: Props) {
  return (
    <Field label={label} error={error} hint={hint} className={className}>
      {({ id, describedBy, invalid }) => (
        <input
          id={id} type="password" inputMode="numeric" maxLength={6} autoComplete="off" autoCorrect="off" spellCheck={false}
          aria-invalid={invalid} aria-describedby={describedBy} placeholder="••••••"
          className={cn(inputClass(invalid), "text-center text-lg tracking-[0.6em] tabular")}
          onChange={(e) => { e.target.value = e.target.value.replace(/\D/g, "").slice(0, 6); onChange?.(e); }}
          {...rest}
        />
      )}
    </Field>
  );
}
