"use client";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { formatDate, formatMoney, makeCreditSchema, parseMoneyInput, type CreditOffer, type Loan } from "@bfa/shared";
import { Alert, Button, Card, CardTitle, Icon, MoneyField, Skeleton } from "@/components/ui";
import { useAccounts, useAcceptCredit, useCreditOffer, useCreditSimulation, useRepayLoan } from "@/hooks/useBank";
import { cn } from "@/lib/cn";
import { errorMessage } from "../errors";
import { Money } from "../Money";
import { PinConfirmDialog } from "../PinConfirmDialog";
import { SummaryList } from "../SummaryList";
import { AccountSelectField } from "../forms/AccountSelectField";

const round1000 = (n: number) => Math.max(0, Math.round(n / 1000) * 1000);
const SERIES = "#3B52C4";

function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={selected}
      className={cn("inline-flex h-10 items-center rounded-full px-4 text-sm font-semibold ring-1 transition", selected ? "bg-navy-800 text-white ring-navy-800" : "bg-white text-slate-800 ring-slate-200 hover:bg-slate-50")}>{children}</button>
  );
}

/** Pre-approved microcredit: offer → live server-side simulation → PIN → disbursement. Or why not, and what an active loan looks like. */
export function CreditPanel() {
  const offer = useCreditOffer();
  return (
    <section id="credito" aria-labelledby="credito-title" className="scroll-mt-24">
      <Card className="space-y-5">
        <CardTitle><span id="credito-title" className="inline-flex items-center gap-2"><Icon name="coins" className="size-5 text-brand-600" />Microcrédito pré-aprovado</span></CardTitle>
        {offer.isPending ? <Skeleton className="h-40" /> : offer.isError ? <Alert kind="error">Não foi possível carregar a oferta.</Alert> : offer.data.activeLoan ? <LoanCard loan={offer.data.activeLoan} /> : offer.data.eligible ? <Simulator offer={offer.data} /> : <NotEligible offer={offer.data} />}
      </Card>
    </section>
  );
}

function NotEligible({ offer }: { offer: CreditOffer }) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600">Ainda não há uma oferta para si. O assistente explica sempre porquê — e o que falta:</p>
      <ul className="space-y-2">{offer.blockers.map((b) => <li key={b} className="flex gap-2 text-sm text-slate-700"><Icon name="warn" className="mt-0.5 size-4 shrink-0 text-amber-700" />{b}</li>)}</ul>
      {offer.reasons.length > 0 && <ul className="space-y-1.5 border-t border-slate-100 pt-3">{offer.reasons.map((r) => <li key={r} className="flex gap-2 text-sm text-slate-500"><Icon name="check" className="mt-0.5 size-4 shrink-0 text-emerald-600" />{r}</li>)}</ul>}
    </div>
  );
}

type In = { accountId: string; amount: string; months: number };
type Out = z.output<ReturnType<typeof makeCreditSchema>>;

function Simulator({ offer }: { offer: CreditOffer }) {
  const accounts = useAccounts();
  const accept = useAcceptCredit();
  const schema = useMemo(() => makeCreditSchema(offer), [offer]);
  const [pending, setPending] = useState<Out | null>(null);
  const [done, setDone] = useState<Loan | null>(null);
  const initialMonths = offer.terms.includes(6) ? 6 : offer.terms[0]!;
  const { control, register, handleSubmit, setValue, formState: { errors } } = useForm<In, unknown, Out>({
    resolver: zodResolver(schema), defaultValues: { accountId: "", amount: String(round1000(offer.maxAmount / 2)), months: initialMonths },
  });
  const amountText = useWatch({ control, name: "amount" }) ?? "";
  const months = useWatch({ control, name: "months" }) ?? initialMonths;
  const amount = parseMoneyInput(amountText);
  const inRange = Number.isFinite(amount) && amount >= offer.minAmount && amount <= offer.maxAmount;
  const sim = useCreditSimulation(amount, months, inRange);
  const s = inRange ? sim.data : undefined;

  // A previous rejection must not linger once the customer changes the request.
  const resetAccept = accept.reset;
  useEffect(() => { resetAccept(); }, [amountText, months, resetAccept]);

  if (done) return <Alert kind="success">Microcrédito de <strong>{formatMoney(done.principal)}</strong> creditado. A 1.ª prestação de {formatMoney(done.installment)} vence a {formatDate(`${done.installments[0]?.dueDate}T00:00:00Z`)}.</Alert>;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-slate-500">Pode pedir até</p>
        <p className="text-4xl font-bold text-navy-900"><Money value={offer.maxAmount} always /></p>
        <p className="mt-1 text-sm text-slate-600">{offer.annualRatePercent}% ao ano · comissão de {offer.originationFeePercent}% · prestação máxima {formatMoney(offer.maxInstallment).replace(",00", "")}</p>
        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">{offer.reasons.map((r) => <li key={r} className="inline-flex items-center gap-1"><Icon name="check" className="size-3.5 text-emerald-600" />{r}</li>)}</ul>
      </div>

      <form noValidate onSubmit={handleSubmit((v) => { accept.reset(); setPending(v); })} className="space-y-4">
        <MoneyField label="Montante" error={errors.amount?.message} {...register("amount")} />
        <div className="flex flex-wrap gap-2" role="group" aria-label="Atalhos de montante">
          {[0.25, 0.5, 0.75, 1].map((f) => <Chip key={f} selected={round1000(offer.maxAmount * f) === amount} onClick={() => setValue("amount", String(round1000(offer.maxAmount * f)), { shouldValidate: true })}>{f * 100}%</Chip>)}
        </div>
        <div>
          <p className="mb-1.5 text-sm font-medium text-slate-700">Prazo</p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Prazo em meses">{offer.terms.map((t) => <Chip key={t} selected={months === t} onClick={() => setValue("months", t, { shouldValidate: true })}>{t} meses</Chip>)}</div>
          {errors.months && <p role="alert" className="mt-1 text-xs text-red-600">{errors.months.message}</p>}
        </div>

        <div className={cn("rounded-2xl bg-navy-50 p-4 transition-opacity", sim.isFetching && "opacity-60")} aria-live="polite">
          {!s ? <p className="text-sm text-slate-500">{sim.isError ? errorMessage(sim.error) : `Indique um montante entre ${formatMoney(offer.minAmount).replace(",00", "")} e ${formatMoney(offer.maxAmount).replace(",00", "")}.`}</p> : (
            <>
              <p className="text-sm text-slate-600">Prestação mensal</p>
              <p className="text-3xl font-bold text-navy-900"><Money value={s.installment} always /></p>
              <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
                {[["Total a pagar", s.totalRepayable], ["Juros", s.totalInterest], ["Comissão", s.fee], ["Recebe na conta", s.netDisbursed]].map(([k, v]) => (
                  <div key={k as string} className="flex justify-between gap-3"><dt className="text-slate-500">{k}</dt><dd className="tabular font-semibold text-slate-900">{formatMoney(v as number)}</dd></div>
                ))}
              </dl>
              {!s.withinCapacity && <Alert kind="warning" className="mt-3">A prestação excede a sua capacidade de pagamento. Escolha um prazo mais longo ou um montante menor.</Alert>}
            </>
          )}
        </div>

        <AccountSelectField accounts={accounts.data?.filter((a) => a.type !== "Poupanca")} error={errors.accountId?.message} onDefault={(id) => setValue("accountId", id)} label="Receber na conta" {...register("accountId")} />
        <Button type="submit" full disabled={!s || !s.withinCapacity}><Icon name="coins" className="size-4" />Pedir microcrédito</Button>
        <p className="text-xs text-slate-500">Simulação de demonstração: análise automática sobre os seus movimentos, não constitui aconselhamento financeiro. O valor só é creditado depois de confirmar com o PIN.</p>
      </form>

      <PinConfirmDialog open={!!pending} title="Confirmar microcrédito" pending={accept.isPending} error={accept.error ? errorMessage(accept.error) : null} onCancel={() => setPending(null)}
        onConfirm={(pin) => pending && accept.mutate({ accountId: pending.accountId, amount: pending.amount, months: pending.months, pin }, { onSuccess: (l) => { setPending(null); setDone(l); } })}
        summary={pending && s && <SummaryList rows={[["Montante", <strong key="a">{formatMoney(pending.amount)}</strong>], ["Prazo", `${pending.months} meses`], ["Prestação", formatMoney(s.installment)], ["Taxa", `${s.annualRatePercent}% ao ano`], ["Comissão", formatMoney(s.fee)], ["Recebe", formatMoney(s.netDisbursed)]]} />} />
    </div>
  );
}

function LoanCard({ loan }: { loan: Loan }) {
  const accounts = useAccounts();
  const repay = useRepayLoan(loan.id);
  const [asking, setAsking] = useState(false);
  const [picked, setPicked] = useState("");
  const [paid, setPaid] = useState<string | null>(null);
  const paidCount = loan.installments.filter((i) => i.paidAt).length;
  const next = loan.installments.find((i) => !i.paidAt);
  const eligible = accounts.data?.filter((a) => a.type !== "Poupanca" && a.status === "Active");
  const account = picked || eligible?.[0]?.id || "";

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div><p className="text-sm text-slate-500">Em dívida</p><p className="text-3xl font-bold text-navy-900"><Money value={loan.outstanding} always /></p></div>
        <p className="text-sm text-slate-600">{paidCount}/{loan.termMonths} prestações</p>
      </div>
      <div className="h-2.5 rounded-full bg-slate-200" role="progressbar" aria-valuemin={0} aria-valuemax={loan.termMonths} aria-valuenow={paidCount} aria-label="Prestações pagas">
        <div className="h-2.5 rounded-full" style={{ width: `${(paidCount / loan.termMonths) * 100}%`, background: SERIES }} />
      </div>
      {paid && <Alert kind="success">{paid}</Alert>}
      {next && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-navy-50 p-4">
          <div><p className="text-sm text-slate-600">Próxima prestação · {formatDate(`${next.dueDate}T00:00:00Z`)}</p><p className="text-xl font-bold text-navy-900">{formatMoney(next.amount)}</p></div>
          <Button onClick={() => { repay.reset(); setAsking(true); }}>Pagar prestação</Button>
        </div>
      )}
      <details className="text-sm">
        <summary className="cursor-pointer font-medium text-navy-700">Ver plano de pagamento</summary>
        <ul className="mt-2 divide-y divide-slate-100">
          {loan.installments.map((i) => (
            <li key={i.number} className="flex items-center justify-between py-1.5"><span className="inline-flex items-center gap-2 text-slate-700">{i.paidAt ? <Icon name="checkCircle" className="size-4 text-emerald-600" /> : <span className="size-4 rounded-full ring-1 ring-slate-300" />}{i.number}. {formatDate(`${i.dueDate}T00:00:00Z`)}</span><span className="tabular text-slate-600">{formatMoney(i.amount)}</span></li>
          ))}
        </ul>
      </details>

      <PinConfirmDialog open={asking} title="Pagar prestação" pending={repay.isPending} error={repay.error ? errorMessage(repay.error) : null} onCancel={() => setAsking(false)}
        onConfirm={(pin) => repay.mutate({ fromAccountId: account, pin }, { onSuccess: (r) => { setAsking(false); setPaid(`Prestação paga (${formatMoney(r.amount)}). Referência ${r.reference}.`); } })}
        summary={
          <div className="space-y-3">
            <SummaryList rows={[["Prestação", next ? <strong key="p">{formatMoney(next.amount)}</strong> : ""], ["Vencimento", next ? formatDate(`${next.dueDate}T00:00:00Z`) : ""]]} />
            <AccountSelectField accounts={eligible} value={account} onChange={(e) => setPicked(e.target.value)} label="Debitar da conta" />
          </div>
        } />
    </div>
  );
}
