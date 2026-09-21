"use client";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { applyFieldErrors, formatMoney, formatPhone, kwikSchema, normalizePhone, RX, type Receipt } from "@bfa/shared";
import { Alert, Button, MoneyField, TextField } from "@/components/ui";
import { useAccounts, useKwikTransfer, useResolveKwik } from "@/hooks/useBank";
import { errorMessage } from "../errors";
import { PinConfirmDialog } from "../PinConfirmDialog";
import { SummaryList } from "../SummaryList";
import { AccountSelectField } from "./AccountSelectField";

type In = z.input<typeof kwikSchema>;
type Out = z.output<typeof kwikSchema>;
const FIELDS = ["fromAccountId", "key", "amount", "description"] as const;

/** Instant transfer to a mobile number (chave KWiK). `initial` comes from a scanned QR. */
export function KwikForm({ initial, onDone }: { initial?: { key?: string; amount?: number; name?: string }; onDone: (r: Receipt) => void }) {
  const accounts = useAccounts();
  const kwik = useKwikTransfer();
  const [pending, setPending] = useState<Out | null>(null);
  const { register, handleSubmit, setValue, setError, control, formState: { errors } } = useForm<In, unknown, Out>({
    resolver: zodResolver(kwikSchema),
    defaultValues: { fromAccountId: "", key: initial?.key ?? "", amount: initial?.amount ? String(initial.amount).replace(".", ",") : "", description: "" },
  });
  const key = normalizePhone(useWatch({ control, name: "key" }) ?? "");
  const keyOk = RX.phone.test(key);
  const resolved = useResolveKwik(key, keyOk);

  const onSubmit = (v: Out) => {
    const from = accounts.data?.find((a) => a.id === v.fromAccountId);
    if (from && v.amount > from.balance) return setError("amount", { message: "Saldo insuficiente." });
    if (resolved.data && !resolved.data.found) return setError("key", { message: "Chave KWiK não encontrada." });
    kwik.reset(); setPending(v);
  };
  const fieldErr = kwik.error && (kwik.error as { fieldErrors?: Record<string, string[]> }).fieldErrors;
  const hasField = !!fieldErr && Object.keys(fieldErr).length > 0;

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <AccountSelectField accounts={accounts.data} error={errors.fromAccountId?.message} onDefault={(id) => setValue("fromAccountId", id)} {...register("fromAccountId")} />
        <TextField label="Chave KWiK" hint="Número de telemóvel do destinatário" inputMode="tel" placeholder="9XX XXX XXX" autoComplete="off" error={errors.key?.message} {...register("key")} />
        {initial?.name && <Alert kind="info">Indicado no QR: {initial.name} (não verificado)</Alert>}
        {keyOk && resolved.data?.found && <Alert kind="success">Titular: <strong>{resolved.data.holderMasked}</strong></Alert>}
        {keyOk && resolved.data && !resolved.data.found && <Alert kind="error">Nenhum cliente BFA com esta chave KWiK.</Alert>}
        <MoneyField label="Montante" error={errors.amount?.message} {...register("amount")} />
        <TextField label="Descrição (opcional)" maxLength={140} error={errors.description?.message} {...register("description")} />
        <Button type="submit" full>Continuar</Button>
      </form>
      <PinConfirmDialog open={!!pending} pending={kwik.isPending} error={kwik.error && !hasField ? errorMessage(kwik.error) : null} onCancel={() => setPending(null)}
        onConfirm={(pin) => pending && kwik.mutate({ fromAccountId: pending.fromAccountId, key: pending.key, amount: pending.amount, description: pending.description || undefined, pin }, {
          onSuccess: (r) => { setPending(null); onDone(r); }, onError: (e) => { if (applyFieldErrors(e, setError, FIELDS)) setPending(null); },
        })}
        summary={pending && <SummaryList rows={[["Montante", <strong key="a">{formatMoney(pending.amount)}</strong>], ["Para", resolved.data?.holderMasked], ["Chave KWiK", formatPhone(pending.key)], ["Descrição", pending.description]]} />} />
    </>
  );
}
