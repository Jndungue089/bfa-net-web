"use client";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { applyFieldErrors, formatIban, formatMoney, isBfaIban, isValidIban, normalizeIban, transferSchema, type Receipt } from "@bfa/shared";
import { Alert, Button, Card, MoneyField, SelectField, TextField } from "@/components/ui";
import { useAccounts, useBeneficiaries, useResolveIban, useTransfer } from "@/hooks/useBank";
import { errorMessage } from "../errors";
import { PinConfirmDialog } from "../PinConfirmDialog";
import { SummaryList } from "../SummaryList";
import { AccountSelectField } from "./AccountSelectField";

type In = z.input<typeof transferSchema>;
type Out = z.output<typeof transferSchema>;
const FIELDS = ["fromAccountId", "toIban", "beneficiaryName", "amount", "description"] as const;

export function TransferForm({ onDone, presetIban, plain }: { onDone: (r: Receipt, v: Out) => void; presetIban?: string; plain?: boolean }) {
  const accounts = useAccounts();
  const beneficiaries = useBeneficiaries();
  const transfer = useTransfer();
  const [pending, setPending] = useState<Out | null>(null);

  const { register, handleSubmit, setValue, setError, control, formState: { errors } } = useForm<In, unknown, Out>({
    resolver: zodResolver(transferSchema),
    defaultValues: { fromAccountId: "", toIban: presetIban ?? "", beneficiaryName: "", amount: "", description: "" },
  });

  const iban = normalizeIban(useWatch({ control, name: "toIban" }) ?? "");
  const ibanOk = isValidIban(iban);
  const resolved = useResolveIban(iban, ibanOk);
  const interbank = ibanOk && !isBfaIban(iban);

  const onSubmit = (v: Out) => {
    const from = accounts.data?.find((a) => a.id === v.fromAccountId);
    if (from && v.amount > from.balance) return setError("amount", { message: "Saldo insuficiente." });
    if (resolved.data && !resolved.data.valid) return setError("toIban", { message: "Conta de destino não encontrada." });
    transfer.reset();
    setPending(v);
  };

  const confirm = (pin: string) => {
    if (!pending) return;
    transfer.mutate(
      { fromAccountId: pending.fromAccountId, toIban: pending.toIban, beneficiaryName: pending.beneficiaryName || undefined, amount: pending.amount, description: pending.description || undefined, pin },
      {
        onSuccess: (r) => { const v = pending; setPending(null); onDone(r, v); },
        onError: (e) => { if (applyFieldErrors(e, setError, FIELDS)) setPending(null); },
      },
    );
  };

  const Wrapper = plain ? "div" : Card;
  return (
    <Wrapper className={plain ? undefined : "mx-auto max-w-xl"}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <AccountSelectField accounts={accounts.data} error={errors.fromAccountId?.message} onDefault={(id) => setValue("fromAccountId", id, { shouldValidate: false })} {...register("fromAccountId")} />

        {!!beneficiaries.data?.length && (
          <SelectField label="Beneficiário guardado" defaultValue="" onChange={(e) => {
            const b = beneficiaries.data?.find((x) => x.id === e.target.value);
            if (b) { setValue("toIban", b.iban, { shouldValidate: true }); setValue("beneficiaryName", isBfaIban(b.iban) ? "" : b.name); }
          }}>
            <option value="">Outro destinatário…</option>
            {beneficiaries.data.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </SelectField>
        )}

        <TextField label="IBAN de destino" placeholder="AO06 …" autoComplete="off" autoCapitalize="characters" spellCheck={false}
          error={errors.toIban?.message} {...register("toIban")} />
        {ibanOk && resolved.data?.valid && resolved.data.internalAccount && <Alert kind="success">Titular: <strong>{resolved.data.holderMasked}</strong> · BFA · sem comissão</Alert>}
        {ibanOk && resolved.data && !resolved.data.valid && <Alert kind="error">Não existe nenhuma conta BFA com este IBAN.</Alert>}
        {interbank && <Alert kind="info">Transferência para outro banco: é aplicada uma comissão e o nome do beneficiário é obrigatório.</Alert>}
        {interbank && <TextField label="Nome do beneficiário" error={errors.beneficiaryName?.message} {...register("beneficiaryName")} />}

        <MoneyField label="Montante" error={errors.amount?.message} {...register("amount")} />
        <TextField label="Descrição (opcional)" maxLength={140} error={errors.description?.message} {...register("description")} />
        <Button type="submit" full>Continuar</Button>
      </form>

      <PinConfirmDialog
        open={!!pending} pending={transfer.isPending} error={transfer.error && !applyable(transfer.error) ? errorMessage(transfer.error) : null}
        onCancel={() => setPending(null)} onConfirm={confirm}
        summary={pending && (
          <SummaryList rows={[
            ["Montante", <strong key="a">{formatMoney(pending.amount)}</strong>],
            ["Para", pending.beneficiaryName || resolved.data?.holderMasked],
            ["IBAN", formatIban(pending.toIban)],
            ["Comissão", isBfaIban(pending.toIban) ? "Sem comissão" : "Aplicável (interbancária)"],
            ["Descrição", pending.description],
          ]} />
        )}
      />
    </Wrapper>
  );
}

const applyable = (e: unknown) => !!(e as { fieldErrors?: Record<string, string[]> }).fieldErrors && Object.keys((e as { fieldErrors: object }).fieldErrors).length > 0;
