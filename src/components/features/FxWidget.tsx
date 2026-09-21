"use client";
import { formatDate, formatRate } from "@bfa/shared";
import { useExchangeRates } from "@/hooks/useBank";
import { Card, CardTitle, Skeleton } from "@/components/ui";

export function FxWidget() {
  const { data, isPending, isError } = useExchangeRates();
  return (
    <Card>
      <CardTitle>Câmbios</CardTitle>
      {isPending ? <Skeleton className="h-16" /> : isError || !data?.length ? <p className="text-sm text-slate-500">Indisponível de momento.</p> : (
        <>
          <table className="w-full text-sm tabular">
            <thead className="text-left text-xs text-slate-500"><tr><th className="pb-2 font-medium">Moeda</th><th className="pb-2 text-right font-medium">Compra</th><th className="pb-2 text-right font-medium">Venda</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((r) => (
                <tr key={r.currency}><td className="py-2 font-semibold text-navy-900">{r.currency}</td><td className="py-2 text-right">{formatRate(r.buy)}</td><td className="py-2 text-right">{formatRate(r.sell)}</td></tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-xs text-slate-400">Valores indicativos em Kz · {data[0] && formatDate(data[0].updatedAt)}</p>
        </>
      )}
    </Card>
  );
}
