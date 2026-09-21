"use client";
import { formatMoney, monthShort, type MonthFlow } from "@bfa/shared";
import { usePrivacyStore } from "@/stores/privacy";

// Two series, validated together (lightness band, CVD separation, contrast) with the dataviz validator.
const INCOME = "#3B52C4", SPEND = "#F05D1A";

/** Grouped bars per month. Thin bars, 4 px rounded tops anchored on the baseline, 2 px gap, legend, per-bar tooltip and a table view. */
export function IncomeSpendChart({ months }: { months: MonthFlow[] }) {
  const hide = usePrivacyStore((s) => s.hideBalances);
  const max = Math.max(1, ...months.flatMap((m) => [m.income, m.spend]));
  const H = 150;
  const bar = (v: number) => Math.max(v > 0 ? 3 : 0, Math.round((v / max) * H));
  return (
    <figure>
      <figcaption className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-slate-700">
        <span className="inline-flex items-center gap-2"><span className="size-3 rounded-sm" style={{ background: INCOME }} />Rendimento</span>
        <span className="inline-flex items-center gap-2"><span className="size-3 rounded-sm" style={{ background: SPEND }} />Gastos</span>
      </figcaption>

      <div className={`relative flex items-end justify-around gap-2 border-b border-slate-300 px-2 ${hide ? "masked" : ""}`} style={{ height: H + 8 }}>
        <span aria-hidden className="absolute inset-x-0 top-0 border-t border-dashed border-slate-200" />
        <span aria-hidden className="absolute -top-2.5 left-0 bg-white pr-1 text-[0.7rem] text-slate-400 tabular">{formatMoney(max).replace(",00", "")}</span>
        {months.map((m) => (
          <div key={m.month} className="group relative flex items-end gap-0.5 outline-none" tabIndex={0} aria-label={`${monthShort(m.month)}: rendimento ${formatMoney(m.income)}, gastos ${formatMoney(m.spend)}`}>
            <span className="w-7 rounded-t-[4px] sm:w-9" style={{ height: bar(m.income), background: INCOME }} />
            <span className="w-7 rounded-t-[4px] sm:w-9" style={{ height: bar(m.spend), background: SPEND }} />
            <span role="tooltip" className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-2 text-xs text-white shadow-lg group-hover:block group-focus:block">
              <b>{monthShort(m.month)}</b><br />Rendimento {formatMoney(m.income)}<br />Gastos {formatMoney(m.spend)}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex justify-around px-2 text-sm font-medium text-slate-600">{months.map((m) => <span key={m.month} className="w-[4.6rem] text-center sm:w-[4.8rem]">{monthShort(m.month)}</span>)}</div>

      <details className="mt-3 text-sm">
        <summary className="cursor-pointer font-medium text-navy-700">Ver como tabela</summary>
        <table className="mt-2 w-full text-left tabular">
          <thead className="text-xs text-slate-500"><tr><th className="py-1 font-medium">Mês</th><th className="py-1 text-right font-medium">Rendimento</th><th className="py-1 text-right font-medium">Gastos</th></tr></thead>
          <tbody className={hide ? "masked" : ""}>{months.map((m) => <tr key={m.month} className="border-t border-slate-100"><td className="py-1">{monthShort(m.month)}</td><td className="py-1 text-right">{formatMoney(m.income)}</td><td className="py-1 text-right">{formatMoney(m.spend)}</td></tr>)}</tbody>
        </table>
      </details>
    </figure>
  );
}
