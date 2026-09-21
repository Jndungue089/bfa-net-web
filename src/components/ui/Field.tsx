import { useId } from "react";
import { cn } from "@/lib/cn";

interface FieldProps {
  label: string;
  error?: string;
  hint?: string;
  children: (a: { id: string; describedBy?: string; invalid: boolean }) => React.ReactNode;
  className?: string;
}

/** Label + control + error wiring (ids, aria-invalid, aria-describedby) in one place. */
export function Field({ label, error, hint, children, className }: FieldProps) {
  const id = useId();
  const msgId = `${id}-msg`;
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium text-slate-700">{label}</label>
      {children({ id, describedBy: error || hint ? msgId : undefined, invalid: !!error })}
      {(error || hint) && (
        <p id={msgId} role={error ? "alert" : undefined} className={cn("text-xs", error ? "text-red-600" : "text-slate-500")}>{error ?? hint}</p>
      )}
    </div>
  );
}

export const inputClass = (invalid: boolean) =>
  cn(
    "h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 transition",
    "focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15 disabled:bg-slate-100",
    invalid ? "border-red-400" : "border-slate-200 hover:border-slate-300",
  );
