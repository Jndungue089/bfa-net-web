export function SummaryList({ rows }: { rows: Array<[string, React.ReactNode]> }) {
  return (
    <dl className="space-y-2">
      {rows.filter(([, v]) => v !== null && v !== undefined && v !== "").map(([k, v]) => (
        <div key={k} className="flex items-start justify-between gap-4">
          <dt className="text-slate-500">{k}</dt>
          <dd className="text-right font-medium text-slate-900 break-words">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
