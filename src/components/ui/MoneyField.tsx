"use client";
import { Field, inputClass } from "./Field";
import { cn } from "@/lib/cn";

interface Props extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "inputMode"> {
  label: string;
  error?: string;
  hint?: string;
  currency?: string;
}

/** Text input for amounts. Only digits, spaces and one decimal separator can be typed; parsing lives in the zod schema. */
export function MoneyField({ label, error, hint, currency = "Kz", className, onChange, ...rest }: Props) {
  return (
    <Field label={label} error={error} hint={hint} className={className}>
      {({ id, describedBy, invalid }) => (
        <div className="relative">
          <input
            id={id} type="text" inputMode="decimal" autoComplete="off" placeholder="0,00"
            aria-invalid={invalid} aria-describedby={describedBy}
            className={cn(inputClass(invalid), "pr-12 text-right tabular")}
            onChange={(e) => { e.target.value = e.target.value.replace(/[^\d\s.,]/g, ""); onChange?.(e); }}
            {...rest}
          />
          <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-sm text-slate-500">{currency}</span>
        </div>
      )}
    </Field>
  );
}
