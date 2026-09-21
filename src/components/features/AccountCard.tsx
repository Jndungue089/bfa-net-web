"use client";
import Link from "next/link";
import { formatIban, type Account } from "@bfa/shared";
import { Badge, Card } from "@/components/ui";
import { Money } from "./Money";
import { accountTypeLabel } from "./labels";

export function AccountCard({ account }: { account: Account }) {
  return (
    <Link href={`/statement?account=${account.id}`} className="group block">
      <Card className="h-full transition group-hover:shadow-md group-hover:ring-brand-500/40">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-navy-900">{account.nickname ?? accountTypeLabel[account.type]}</p>
            <p className="mt-0.5 text-xs text-slate-500 tabular">{formatIban(account.iban)}</p>
          </div>
          {account.status !== "Active" && <Badge tone="danger">{account.status === "Frozen" ? "Congelada" : "Encerrada"}</Badge>}
        </div>
        <p className="mt-5 text-xs uppercase tracking-wide text-slate-500">Saldo disponível</p>
        <p className="text-2xl font-bold text-navy-900"><Money value={account.balance} currency={account.currency} /></p>
      </Card>
    </Link>
  );
}
