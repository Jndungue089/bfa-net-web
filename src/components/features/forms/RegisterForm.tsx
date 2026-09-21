"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { applyFieldErrors, registerSchema } from "@bfa/shared";
import { Alert, Button, Card, PasswordField, PinField, TextField } from "@/components/ui";
import { useRegister } from "@/hooks/useAuth";
import { errorMessage } from "../errors";
import { PasswordStrength } from "./PasswordStrength";

type In = z.input<typeof registerSchema>;
type Out = z.output<typeof registerSchema>;
const FIELDS = ["fullName", "email", "phone", "nationalId", "taxId", "birthDate", "password", "pin", "acceptTerms"] as const;

export function RegisterForm() {
  const router = useRouter();
  const registerUser = useRegister();
  const [customerNumber, setCustomerNumber] = useState<string | null>(null);
  const { register, handleSubmit, setError, control, formState: { errors } } = useForm<In, unknown, Out>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: "", email: "", phone: "", nationalId: "", taxId: "", birthDate: "", password: "", confirmPassword: "", pin: "", confirmPin: "", acceptTerms: false },
  });

  const password = useWatch({ control, name: "password" }) ?? "";

  const onSubmit = (v: Out) => {
    const body = { ...v, confirmPassword: undefined, confirmPin: undefined };
    registerUser.mutate({ ...body, taxId: body.taxId || null }, {
      onSuccess: (s) => setCustomerNumber(s.profile.customerNumber),
      onError: (e) => applyFieldErrors(e, setError, FIELDS),
    });
  };

  if (customerNumber) {
    return (
      <Card className="text-center">
        <h2 className="text-lg font-semibold text-navy-900">Adesão concluída</h2>
        <p className="mt-2 text-sm text-slate-600">Este é o seu número de adesão. Precisa dele para entrar — guarde-o num local seguro.</p>
        <p className="my-5 rounded-xl bg-navy-50 py-4 text-3xl font-bold tracking-widest text-navy-900 tabular">{customerNumber}</p>
        <Button full onClick={() => router.replace("/dashboard")}>Ir para o resumo</Button>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {registerUser.error && <Alert kind="error">{errorMessage(registerUser.error)}</Alert>}
      <TextField label="Nome completo" autoComplete="name" error={errors.fullName?.message} {...register("fullName")} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
        <TextField label="Telemóvel" inputMode="tel" autoComplete="tel-national" placeholder="9XX XXX XXX" error={errors.phone?.message} {...register("phone")} />
        <TextField label="Nº do BI" autoCapitalize="characters" placeholder="005678901LA041" error={errors.nationalId?.message} {...register("nationalId")} />
        <TextField label="NIF (opcional)" inputMode="numeric" maxLength={10} error={errors.taxId?.message} {...register("taxId")} />
      </div>
      <TextField label="Data de nascimento" type="date" autoComplete="bday" error={errors.birthDate?.message} {...register("birthDate")} />
      <div className="space-y-2">
        <PasswordField label="Palavra-passe" autoComplete="new-password" error={errors.password?.message} {...register("password")} />
        <PasswordStrength value={password} />
      </div>
      <PasswordField label="Confirmar palavra-passe" autoComplete="new-password" error={errors.confirmPassword?.message} {...register("confirmPassword")} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <PinField label="PIN de operações" hint="6 dígitos, para autorizar pagamentos" error={errors.pin?.message} {...register("pin")} />
        <PinField label="Confirmar PIN" error={errors.confirmPin?.message} {...register("confirmPin")} />
      </div>
      <label className="flex items-start gap-3 text-sm text-slate-600">
        <input type="checkbox" className="mt-0.5 size-4 accent-brand-500" {...register("acceptTerms")} />
        <span>Li e aceito os termos e condições e a política de privacidade.</span>
      </label>
      {errors.acceptTerms && <p role="alert" className="text-xs text-red-600">{errors.acceptTerms.message}</p>}
      <Button type="submit" full loading={registerUser.isPending}>Criar adesão</Button>
      <p className="text-center text-sm text-slate-500">Já tem adesão? <Link href="/login" className="font-semibold text-brand-600 hover:underline">Entrar</Link></p>
    </form>
  );
}
