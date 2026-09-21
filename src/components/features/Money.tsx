"use client";
import { formatMoney } from "@bfa/shared";
import { cn } from "@/lib/cn";
import { usePrivacyStore } from "@/stores/privacy";

/** Renders an amount, blurred when the user enabled "ocultar saldos". Use `always` for amounts the user just typed/confirmed. */
export function Money({ value, currency = "AOA", signed, always, className }: { value: number; currency?: string; signed?: boolean; always?: boolean; className?: string }) {
  const hide = usePrivacyStore((s) => s.hideBalances);
  const hidden = hide && !always;
  return (
    <span className={cn("tabular", hidden && "masked", className)} aria-label={hidden ? "Valor oculto" : undefined}>
      {formatMoney(value, currency, { sign: signed })}
    </span>
  );
}
