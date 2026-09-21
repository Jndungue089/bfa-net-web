"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiError, loginSchema, type LoginForm as LoginValues } from "@bfa/shared";
import { Alert, Button, DigitsField, PasswordField } from "@/components/ui";
import { useLogin } from "@/hooks/useAuth";

export function LoginForm() {
  const expired = useSearchParams().get("expired") === "1";
  const login = useLogin();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { customerNumber: "", password: "" },
  });

  const err = login.error;
  const message = err instanceof ApiError
    ? err.status === 429 ? "Demasiadas tentativas. Aguarde um minuto e tente novamente." : err.message
    : err ? "Ocorreu um erro inesperado." : null;

  return (
    <form onSubmit={handleSubmit((v) => login.mutate(v))} className="space-y-5" noValidate>
      {expired && <Alert kind="warning">A sua sessão terminou. Inicie sessão novamente.</Alert>}
      {message && <Alert kind="error">{message}</Alert>}
      <DigitsField
        label="Número de adesão" digits={8} autoComplete="username" autoFocus placeholder="8 dígitos"
        error={errors.customerNumber?.message} {...register("customerNumber")}
      />
      <PasswordField label="Palavra-passe" autoComplete="current-password" error={errors.password?.message} {...register("password")} />
      <Button type="submit" full loading={login.isPending}>Entrar</Button>
      <p className="text-center text-sm text-slate-500">
        Ainda não aderiu? <Link href="/register" className="font-semibold text-brand-600 hover:underline">Criar adesão</Link>
      </p>
    </form>
  );
}
