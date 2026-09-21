"use client";
import { use } from "react";
import { PageHeader } from "@/components/features/PageHeader";
import { Money } from "@/components/features/Money";
import { receiptRows } from "@/components/features/Receipt";
import { SummaryList } from "@/components/features/SummaryList";
import { kindIcon, kindLabel } from "@/components/features/labels";
import { Alert, Card, Icon, Skeleton } from "@/components/ui";
import { useTransaction } from "@/hooks/useBank";
import { cn } from "@/lib/cn";

export default function TransactionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const tx = useTransaction(id);

  if (tx.isPending) return <Skeleton className="mx-auto h-80 max-w-lg rounded-2xl" />;
  if (tx.isError || !tx.data) return <Alert kind="error">Não foi possível carregar a transacção.</Alert>;

  const r = tx.data;
  const credit = r.direction === "Credit";
  const ok = r.status === "Completed";
  return (
    <div className="mx-auto max-w-lg space-y-5">
      <PageHeader title="Detalhes" back="/statement" />
      <Card className="text-center">
        <span className={cn("mx-auto flex size-17 items-center justify-center rounded-full", credit ? "bg-emerald-100 text-emerald-700" : "bg-navy-50 text-navy-800")}><Icon name={kindIcon[r.kind]} className="size-8" /></span>
        <p className="mt-3 text-sm text-slate-500">{kindLabel[r.kind]}</p>
        <p className="text-3xl font-bold text-navy-900"><Money value={r.amount} currency={r.currency} always /></p>
        <p className={cn("mt-1 inline-flex items-center gap-1.5 font-semibold", ok ? "text-emerald-700" : "text-red-700")}>
          <Icon name={ok ? "checkCircle" : "alert"} className="size-4.5" />{ok ? "Concluída" : r.status === "Reversed" ? "Revertida" : "Falhada"}
        </p>
      </Card>
      <Card><div className="text-sm"><SummaryList rows={receiptRows(r).filter(([k]) => k !== "Tipo" && k !== "Referência")} /></div></Card>
      <Card className="flex items-center gap-2 print:hidden">
        <div className="min-w-0 flex-1"><p className="text-xs tracking-wider text-slate-500">REFERÊNCIA</p><p className="truncate font-mono text-sm font-semibold">{r.reference}</p></div>
        {/* PDF issued by the backend (logo, payer and account details); same-origin GET, authenticated by the session cookie */}
        <a href={`/api/v1/transactions/${r.transactionId}/receipt.pdf`} download aria-label="Descarregar comprovativo em PDF"
          className="flex size-11 items-center justify-center rounded-full bg-navy-50 text-navy-800 hover:bg-navy-100"><Icon name="download" /></a>
      </Card>
    </div>
  );
}
