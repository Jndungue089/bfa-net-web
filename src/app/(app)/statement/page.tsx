"use client";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { dateRangeSchema, formatDate, presetRange, statementPdfPath, type PeriodPreset } from "@bfa/shared";
import { Money } from "@/components/features/Money";
import { PageHeader } from "@/components/features/PageHeader";
import { StatementList } from "@/components/features/StatementList";
import { accountTypeLabel } from "@/components/features/labels";
import { Alert, Button, Card, Icon, Skeleton, TextField, type IconName } from "@/components/ui";
import { useAccounts, useStatementRange } from "@/hooks/useBank";
import { cn } from "@/lib/cn";

type Mode = PeriodPreset | "custom";
const MODES: Array<{ id: Mode; label: string; icon?: IconName }> = [{ id: "month", label: "Este mês" }, { id: "30d", label: "30 dias" }, { id: "90d", label: "90 dias" }, { id: "custom", label: "Período", icon: "calendar" }];
type RangeIn = z.input<typeof dateRangeSchema>;

function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={selected}
      className={cn("inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold ring-1 transition", selected ? "bg-navy-800 text-white ring-navy-800" : "bg-white text-slate-800 ring-slate-200 hover:bg-slate-50")}>
      {children}
    </button>
  );
}

function Stat({ icon, label, children, className }: { icon?: IconName; label: string; children: React.ReactNode; className?: string }) {
  return (
    <Card className={cn("!p-4", className)}>
      <p className="flex items-center gap-1.5 text-sm text-slate-500">{icon && <Icon name={icon} className="size-4" />}{label}</p>
      <p className="mt-1 whitespace-nowrap text-[clamp(1rem,4.6vw,1.2rem)] font-bold">{children}</p>
    </Card>
  );
}

function StatementView() {
  const accounts = useAccounts();
  const preset = useSearchParams().get("account");
  const [accountId, setAccountId] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("month");
  const [custom, setCustom] = useState<{ from: string; to: string } | null>(null);

  const account = accounts.data?.find((a) => a.id === (accountId ?? preset)) ?? accounts.data?.find((a) => a.type === "Ordem") ?? accounts.data?.[0];
  const range = useMemo(() => (mode === "custom" ? custom : presetRange(mode)), [mode, custom]);
  const statement = useStatementRange(account?.id ?? "", range ?? {}, !!range);
  const items = useMemo(() => statement.data?.items ?? [], [statement.data]);
  const sum = useMemo(() => {
    let credits = 0, debits = 0;
    for (const i of items) {
      if (i.direction === "Credit") credits += i.amount; else debits += i.amount;
    }
    return { credits, debits };
  }, [items]);

  const { register, handleSubmit, formState: { errors } } = useForm<RangeIn>({ resolver: zodResolver(dateRangeSchema), defaultValues: { from: "", to: "" } });
  const canPdf = !!account && !!range;

  return (
    <div className="space-y-6">
      <PageHeader title="Extracto bancário" back="/profile" action={canPdf ? (
        // The PDF is issued by the backend (logo, holder, account, balances, paginated table); same-origin GET, cookie-authenticated.
        <a href={statementPdfPath(account.id, range)} download aria-label="Descarregar extracto em PDF" className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand-500 px-4 text-sm font-semibold text-white shadow-sm shadow-brand-500/30 hover:bg-brand-600">
          <Icon name="download" className="size-4" /><span className="hidden sm:inline">PDF</span>
        </a>
      ) : undefined} />

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Conta">
          {accounts.data?.map((a) => <Chip key={a.id} selected={account?.id === a.id} onClick={() => setAccountId(a.id)}><Icon name={a.type === "Poupanca" ? "wallet" : "card"} className="size-4" />{a.nickname ?? accountTypeLabel[a.type]}</Chip>)}
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Período">
          {MODES.map((m) => <Chip key={m.id} selected={mode === m.id} onClick={() => setMode(m.id)}>{m.icon && <Icon name={m.icon} className="size-4" />}{m.label}</Chip>)}
        </div>
        {mode === "custom" && (
          <Card>
            <form noValidate onSubmit={handleSubmit((v) => setCustom({ from: v.from, to: v.to }))} className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <TextField label="De" type="date" error={errors.from?.message} {...register("from")} />
              <TextField label="Até" type="date" error={errors.to?.message} {...register("to")} />
              <Button type="submit" variant="secondary">Aplicar</Button>
            </form>
          </Card>
        )}
      </div>

      {range ? <p className="text-sm text-slate-500">{formatDate(`${range.from}T00:00:00Z`)} — {formatDate(`${range.to}T00:00:00Z`)}</p> : <Alert kind="info">Indique o período e carregue em «Aplicar».</Alert>}

      {/* Two columns on phones (three cramped figures did not fit at 360 px), three from sm up. */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat icon="arrowDown" label="Entradas"><span className="text-emerald-700"><Money value={sum.credits} /></span></Stat>
        <Stat icon="arrowUp" label="Saídas"><Money value={sum.debits} /></Stat>
        <Stat label="Movimentos" className="col-span-2 sm:col-span-1">{items.length}</Stat>
      </div>

      {statement.data?.truncated && <Alert kind="warning">Mostrados os 1000 movimentos mais recentes do período.</Alert>}
      <Card>
        {statement.isPending && range ? <Skeleton className="h-48" /> : statement.isError ? <Alert kind="error">Não foi possível carregar o extracto.</Alert> : <StatementList items={items} empty="Sem movimentos no período." />}
      </Card>
    </div>
  );
}

export default function StatementPage() {
  return <Suspense><StatementView /></Suspense>;
}
