"use client";
import { formatMoney, type CategorySpend } from "@bfa/shared";
import { Icon } from "@/components/ui";
import { usePrivacyStore } from "@/stores/privacy";

const SERIES = "#3B52C4";

/** Ranked horizontal bars (one hue: length carries the value). The tick marks the average of the previous months. */
export function CategoryBars({ categories }: { categories: CategorySpend[] }) {
  const hide = usePrivacyStore((s) => s.hideBalances);
  const rows = categories.filter((c) => c.amount > 0 || c.averageBefore > 0).slice(0, 7);
  const max = Math.max(1, ...rows.flatMap((c) => [c.amount, c.averageBefore]));
  if (rows.length === 0) return <p className="py-6 text-center text-sm text-slate-500">Ainda sem gastos este mês.</p>;
  return (
    <ul className={`space-y-3.5 ${hide ? "masked" : ""}`}>
      {rows.map((c) => {
        const up = c.averageBefore > 0 && c.amount > 1.3 * c.averageBefore;
        return (
          <li key={c.category} title={`Média dos meses anteriores: ${formatMoney(c.averageBefore)}`}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="min-w-0 truncate font-medium text-slate-800">{c.label}</span>
              <span className="tabular shrink-0 text-slate-600">{formatMoney(c.amount).replace(",00", "")}{c.sharePercent > 0 && <span className="ml-1.5 text-xs text-slate-400">{c.sharePercent.toFixed(0)}%</span>}</span>
            </div>
            <div className="relative mt-1.5 h-2.5 rounded-full bg-slate-100">
              <div className="h-2.5 rounded-full" style={{ width: `${Math.max(c.amount > 0 ? 2 : 0, (c.amount / max) * 100)}%`, background: SERIES }} />
              {c.averageBefore > 0 && <span aria-hidden className="absolute -top-1 h-[1.125rem] w-0.5 rounded bg-slate-500" style={{ left: `${(c.averageBefore / max) * 100}%` }} />}
            </div>
            {up && <p className="mt-1 flex items-center gap-1 text-xs font-medium text-slate-600"><Icon name="trend" className="size-3.5" />Acima da média ({formatMoney(c.averageBefore).replace(",00", "")})</p>}
          </li>
        );
      })}
    </ul>
  );
}
