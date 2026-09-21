"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { applyFieldErrors, beneficiarySchema } from "@bfa/shared";
import { Alert, Button, TextField } from "@/components/ui";
import { useAddBeneficiary } from "@/hooks/useBank";
import { errorMessage } from "../errors";

type In = z.input<typeof beneficiarySchema>;
type Out = z.output<typeof beneficiarySchema>;

export function BeneficiaryForm({ onAdded }: { onAdded?: () => void }) {
  const add = useAddBeneficiary();
  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm<In, unknown, Out>({
    resolver: zodResolver(beneficiarySchema),
    defaultValues: { name: "", iban: "" },
  });
  return (
    <form
      noValidate className="space-y-4"
      onSubmit={handleSubmit((v) => add.mutate(v, {
        onSuccess: () => { reset(); onAdded?.(); },
        onError: (e) => applyFieldErrors(e, setError, ["name", "iban"]),
      }))}
    >
      {add.error && !Object.keys((add.error as { fieldErrors?: object }).fieldErrors ?? {}).length && <Alert kind="error">{errorMessage(add.error)}</Alert>}
      <TextField label="Nome" error={errors.name?.message} {...register("name")} />
      <TextField label="IBAN" autoCapitalize="characters" spellCheck={false} placeholder="AO06 …" error={errors.iban?.message} {...register("iban")} />
      <Button type="submit" full loading={add.isPending}>Guardar beneficiário</Button>
    </form>
  );
}
