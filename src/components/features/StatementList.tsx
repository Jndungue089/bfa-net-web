"use client";
import Link from "next/link";
import { formatDateTime, type StatementItem } from "@bfa/shared";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui";
import { Money } from "./Money";
import { kindIcon, kindLabel } from "./labels";

/** One movement; the whole row links to the transaction detail. */
export function StatementRow({ item }: { item: StatementItem }) {
  const credit = item.direction === "Credit";
  return (
    <li>
      <Link href={`/transactions/${item.transactionId}`} className="flex items-center gap-3 rounded-xl px-1 py-3 transition hover:bg-slate-50" aria-label={`${item.counterparty ?? kindLabel[item.kind]}, ${credit ? "crédito" : "débito"}. Ver detalhes`}>
        <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-full", credit ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-navy-800")}><Icon name={kindIcon[item.kind]} className="size-5" /></span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-slate-900">{item.counterparty ?? kindLabel[item.kind]}</span>
          <span className="block truncate text-xs text-slate-500">{item.description ?? kindLabel[item.kind]} · {formatDateTime(item.createdAt)}</span>
        </span>
        <span className="text-right">
          <span className={cn("block text-sm font-semibold", credit ? "text-emerald-700" : "text-slate-900")}><Money value={credit ? item.amount : -item.amount} signed /></span>
          <span className="block text-xs text-slate-400"><Money value={item.balanceAfter} /></span>
        </span>
      </Link>
    </li>
  );
}

export function StatementList({ items, empty = "Sem movimentos." }: { items: StatementItem[]; empty?: string }) {
  if (items.length === 0) return <p className="py-8 text-center text-sm text-slate-500">{empty}</p>;
  return <ul className="divide-y divide-slate-100">{items.map((i) => <StatementRow key={i.entryId} item={i} />)}</ul>;
}
