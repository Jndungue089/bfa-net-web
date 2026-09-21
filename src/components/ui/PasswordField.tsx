"use client";
import { useState } from "react";
import { Field, inputClass } from "./Field";

interface Props extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  error?: string;
  hint?: string;
}

export function PasswordField({ label, error, hint, className, ...rest }: Props) {
  const [visible, setVisible] = useState(false);
  return (
    <Field label={label} error={error} hint={hint} className={className}>
      {({ id, describedBy, invalid }) => (
        <div className="relative">
          <input
            id={id} type={visible ? "text" : "password"} aria-invalid={invalid} aria-describedby={describedBy}
            autoCapitalize="none" autoCorrect="off" spellCheck={false} className={`${inputClass(invalid)} pr-16`} {...rest}
          />
          <button
            type="button" onClick={() => setVisible((v) => !v)} aria-pressed={visible}
            className="absolute inset-y-0 right-2 my-auto h-8 rounded-lg px-2 text-xs font-medium text-navy-700 hover:bg-navy-50"
          >
            {visible ? "Ocultar" : "Mostrar"}
          </button>
        </div>
      )}
    </Field>
  );
}
