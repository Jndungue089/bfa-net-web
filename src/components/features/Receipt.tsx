"use client";
import { formatDateTime, formatIban, type Receipt as ReceiptData } from "@bfa/shared";
import { Button, Card, Icon } from "@/components/ui";
import { Money } from "./Money";
import { SummaryList } from "./SummaryList";
import { kindLabel } from "./labels";

/** Rows shared by the post-operation receipt and the transaction-detail page. */
export function receiptRows(r: ReceiptData): Array<[string, React.ReactNode]> {
  const incoming = r.direction === "Credit";
  return [
    ["Tipo", kindLabel[r.kind]],
    [incoming ? "De" : "Para", incoming ? r.originatorName : r.counterpartyName],
    ["IBAN", !incoming && r.counterpartyIban ? formatIban(r.counterpartyIban) : null],
    ["Descrição", r.description],
    ["Comissão", r.fee > 0 ? <Money key="f" value={r.fee} always /> : null],
    ["Saldo após operação", <Money key="b" value={r.balanceAfter} currency={r.currency} />],
    ["Data", formatDateTime(r.createdAt)],
    ["Referência", <span key="r" className="font-mono text-xs">{r.reference}</span>],
  ];
}

export function Receipt({ receipt, onDone, extra }: { receipt: ReceiptData; onDone: () => void; extra?: React.ReactNode }) {
  return (
    <Card className="mx-auto max-w-lg text-center">
      <div className="mx-auto mb-3 flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"><Icon name="checkCircle" className="size-9" /></div>
      <h2 className="text-lg font-semibold text-navy-900">Operação concluída</h2>
      <p className="mt-1 text-3xl font-bold text-navy-900"><Money value={receipt.amount} currency={receipt.currency} always /></p>
      <div className="mt-5 rounded-xl bg-slate-50 p-4 text-left text-sm ring-1 ring-slate-200"><SummaryList rows={receiptRows(receipt)} /></div>
      {extra}
      <div className="mt-5 flex gap-3 print:hidden">
        <a href={`/api/v1/transactions/${receipt.transactionId}/receipt.pdf`} download
          className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-navy-800 ring-1 ring-slate-200 hover:bg-slate-50">
          <Icon name="download" className="size-4" />Comprovativo PDF
        </a>
        <Button full onClick={onDone}>Concluir</Button>
      </div>
    </Card>
  );
}
