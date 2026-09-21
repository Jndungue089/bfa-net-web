"use client";
import { Field, inputClass } from "./Field";

interface Props extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "inputMode" | "maxLength"> {
  label: string;
  error?: string;
  hint?: string;
  /** Maximum number of digits kept. */
  digits: number;
}

/**
 * Numeric identifier input. Everything that is not a digit is dropped as it is typed or pasted
 * ("1234 5678" → "12345678"), then the value is capped at `digits`. Sanitising instead of using the
 * `maxlength` attribute matters: maxlength counts separators, so pasted "1234 5678" would lose a digit.
 */
export function DigitsField({ label, error, hint, digits, className, onChange, ...rest }: Props) {
  return (
    <Field label={label} error={error} hint={hint} className={className}>
      {({ id, describedBy, invalid }) => (
        <input
          id={id} type="text" inputMode="numeric" autoComplete="off" aria-invalid={invalid} aria-describedby={describedBy}
          className={inputClass(invalid)}
          onChange={(e) => { e.target.value = e.target.value.replace(/\D/g, "").slice(0, digits); onChange?.(e); }}
          {...rest}
        />
      )}
    </Field>
  );
}
