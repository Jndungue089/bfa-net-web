import type { Health } from "@bfa/shared";

const SERIES = "#3B52C4"; // validated series blue (see dataviz check); navy stays for text

/** Score as a donut (single hue on a neutral track) plus the four weighted factors as meters. Text uses ink tokens, never the series colour. */
export function HealthRing({ health }: { health: Health }) {
  const r = 52, c = 2 * Math.PI * r, dash = (Math.max(0, Math.min(100, health.score)) / 100) * c;
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
      <div className="relative mx-auto size-40 shrink-0" role="img" aria-label={`Saúde financeira: ${health.score} em 100, ${health.label}`}>
        <svg viewBox="0 0 128 128" className="size-full -rotate-90">
          <circle cx="64" cy="64" r={r} fill="none" stroke="#E2E8F0" strokeWidth="12" />
          <circle cx="64" cy="64" r={r} fill="none" stroke={SERIES} strokeWidth="12" strokeLinecap="round" strokeDasharray={`${dash} ${c}`} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold leading-none text-navy-900">{health.score}</span>
          <span className="mt-1 text-sm font-semibold text-slate-600">{health.label}</span>
        </div>
      </div>
      <ul className="min-w-0 flex-1 space-y-3" aria-label="Componentes da pontuação">
        {health.factors.map((f) => (
          <li key={f.name}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="font-medium text-slate-800">{f.name}</span>
              <span className="tabular text-slate-500">{f.score}/{f.max}</span>
            </div>
            <div className="mt-1 h-2 rounded-full bg-slate-200" role="presentation"><div className="h-2 rounded-full" style={{ width: `${(f.score / f.max) * 100}%`, background: SERIES }} /></div>
            <p className="mt-0.5 text-xs text-slate-500">{f.note}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
