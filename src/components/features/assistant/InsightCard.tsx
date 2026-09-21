"use client";
import Link from "next/link";
import type { Insight, InsightKind } from "@bfa/shared";
import { cn } from "@/lib/cn";
import { Button, Icon, type IconName } from "@/components/ui";
import { usePrivacyStore } from "@/stores/privacy";

const LOOK: Record<InsightKind, { icon: IconName; tint: string; label: string }> = {
  success: { icon: "checkCircle", tint: "bg-emerald-100 text-emerald-700", label: "Bom sinal" },
  info: { icon: "info", tint: "bg-navy-50 text-navy-700", label: "Informação" },
  warning: { icon: "warn", tint: "bg-amber-100 text-amber-800", label: "Atenção" },
  tip: { icon: "bulb", tint: "bg-brand-100 text-brand-700", label: "Sugestão" },
};

export function InsightCard({ insight, onSave, onCredit }: { insight: Insight; onSave: () => void; onCredit: () => void }) {
  const look = LOOK[insight.kind];
  const hide = usePrivacyStore((s) => s.hideBalances);
  return (
    <li className="flex gap-3.5 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70">
      <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-full", look.tint)}><Icon name={look.icon} /></span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{look.label}</p>
        <h3 className="font-semibold text-navy-900">{insight.title}</h3>
        <p className={cn("mt-0.5 text-sm leading-relaxed text-slate-600", hide && "masked")}>{insight.message}</p>
        {insight.actionType === "save" && <Button className="mt-3 h-10" onClick={onSave}><Icon name="piggy" className="size-4" />Poupar agora</Button>}
        {insight.actionType === "credit" && <Button className="mt-3 h-10" variant="secondary" onClick={onCredit}><Icon name="coins" className="size-4" />Ver oferta</Button>}
        {insight.actionType === "statement" && <Link href="/statement" className="mt-3 inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-navy-800 ring-1 ring-slate-200 hover:bg-slate-50"><Icon name="file" className="size-4" />Ver extracto</Link>}
      </div>
    </li>
  );
}
