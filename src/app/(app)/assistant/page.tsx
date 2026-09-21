"use client";
import { useState } from "react";
import { formatMoney, type Receipt } from "@bfa/shared";
import { CategoryBars } from "@/components/features/assistant/CategoryBars";
import { CreditPanel } from "@/components/features/assistant/CreditPanel";
import { HealthRing } from "@/components/features/assistant/HealthRing";
import { IncomeSpendChart } from "@/components/features/assistant/IncomeSpendChart";
import { InsightCard } from "@/components/features/assistant/InsightCard";
import { SaveDialog } from "@/components/features/assistant/SaveDialog";
import { Money } from "@/components/features/Money";
import { PageHeader } from "@/components/features/PageHeader";
import { Alert, Button, Card, CardTitle, Icon, Skeleton, type IconName } from "@/components/ui";
import { useInsights } from "@/hooks/useBank";
import { formatDate } from "@bfa/shared";

function Kpi({ icon, label, children, hint }: { icon: IconName; label: string; children: React.ReactNode; hint?: string }) {
  return (
    <Card className="!p-4">
      <p className="flex items-center gap-2 text-sm text-slate-500"><Icon name={icon} className="size-4" />{label}</p>
      <p className="mt-1 whitespace-nowrap text-[clamp(1.15rem,5vw,1.5rem)] font-bold text-navy-900">{children}</p>
      {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
    </Card>
  );
}

export default function AssistantPage() {
  const q = useInsights();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<Receipt | null>(null);
  const goCredit = () => document.getElementById("credito")?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="space-y-6">
      <PageHeader title="Assistente financeiro" />
      <p className="-mt-3 flex items-center gap-2 text-slate-500"><Icon name="sparkles" className="size-4 text-brand-600" />Análise dos seus movimentos, actualizada a cada visita.</p>

      {q.isError && <Alert kind="error">Não foi possível analisar os seus movimentos agora.</Alert>}
      {saved && <Alert kind="success">Poupou {formatMoney(saved.amount)}. Referência {saved.reference}.</Alert>}

      {q.isPending ? <Skeleton className="h-64 rounded-2xl" /> : q.data && (
        <>
          <Card><CardTitle>Saúde financeira</CardTitle><HealthRing health={q.data.health} /></Card>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            <Kpi icon="arrowUp" label="Gasto este mês" hint={`Previsão: ${formatMoney(q.data.projectedSpend).replace(",00", "")}`}><Money value={q.data.spentThisMonth} /></Kpi>
            <Kpi icon="calendar" label="Pode gastar por dia" hint={`${q.data.daysLeft} dias até ao fim do mês`}><Money value={q.data.dailyBudget} /></Kpi>
            <Kpi icon="piggy" label="Taxa de poupança" hint="Rendimento − gastos, em média">{q.data.savingsRatePercent.toFixed(0)}%</Kpi>
          </div>

          <section aria-labelledby="ins">
            <h2 id="ins" className="mb-3 text-lg font-semibold text-navy-900">Para si</h2>
            <ul className="space-y-3">
              {q.data.insights.map((i) => <InsightCard key={i.id} insight={i} onSave={() => setSaving(true)} onCredit={goCredit} />)}
            </ul>
          </section>

          {q.data.saving && (
            <Card className="bg-gradient-to-br from-brand-50 to-white">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-0"><p className="flex items-center gap-2 text-sm font-semibold text-brand-700"><Icon name="piggy" className="size-4" />Poupança sugerida</p>
                  <p className="text-3xl font-bold text-navy-900"><Money value={q.data.saving.amount} always /><span className="text-base font-medium text-slate-500"> / mês</span></p>
                  <p className="text-sm text-slate-600">{formatMoney(q.data.saving.yearlyProjection).replace(",00", "")} num ano</p></div>
                {q.data.saving.targetIban ? <Button onClick={() => setSaving(true)}>Poupar agora</Button> : <p className="max-w-xs text-sm text-slate-500">Ainda não tem uma conta poupança. Abra uma num balcão BFA para guardar automaticamente.</p>}
              </div>
            </Card>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card><CardTitle>Rendimento e gastos</CardTitle><IncomeSpendChart months={q.data.months} /></Card>
            <Card><CardTitle>Para onde vai o dinheiro (este mês)</CardTitle><CategoryBars categories={q.data.categories} /></Card>
          </div>

          {q.data.recurring.length > 0 && (
            <Card>
              <CardTitle>Pagamentos recorrentes</CardTitle>
              <ul className="divide-y divide-slate-100">
                {q.data.recurring.map((r) => (
                  <li key={r.name} className="flex items-center gap-3 py-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-navy-50 text-navy-700"><Icon name="repeat" className="size-4.5" /></span>
                    <div className="min-w-0 flex-1"><p className="truncate font-medium text-slate-900">{r.name}</p><p className="text-xs text-slate-500">{r.categoryLabel} · próximo a {formatDate(`${r.nextDate}T00:00:00Z`)}</p></div>
                    <p className="tabular font-semibold text-slate-900"><Money value={r.amount} /></p>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </>
      )}

      <CreditPanel />

      <p className="text-center text-xs text-slate-500">Estatística automática sobre os seus próprios movimentos — não usa inteligência artificial nem constitui aconselhamento financeiro. Projecto de demonstração.</p>

      {q.data?.saving && <SaveDialog suggestion={q.data.saving} open={saving} onClose={() => setSaving(false)} onDone={setSaved} />}
    </div>
  );
}
