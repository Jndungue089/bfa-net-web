"use client";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { ApiError, applyFieldErrors, changePasswordSchema, changePinSchema } from "@bfa/shared";
import { Alert, Button, PasswordField, PinField } from "@/components/ui";
import { useChangePassword, useChangePin } from "@/hooks/useAuth";
import { errorMessage } from "../errors";
import { PasswordStrength } from "./PasswordStrength";

type PwIn = z.input<typeof changePasswordSchema>;
type PinIn = z.input<typeof changePinSchema>;

export function ChangePasswordForm() {
  const change = useChangePassword();
  const { register, handleSubmit, reset, setError, control, formState: { errors } } = useForm<PwIn>({
    resolver: zodResolver(changePasswordSchema), defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });
  const newPassword = useWatch({ control, name: "newPassword" }) ?? "";
  return (
    <form noValidate className="space-y-4" onSubmit={handleSubmit((v) => change.mutate({ currentPassword: v.currentPassword, newPassword: v.newPassword }, {
      onSuccess: () => reset(), onError: (e) => applyFieldErrors(e, setError, ["currentPassword", "newPassword"]),
    }))}>
      {change.isSuccess && <Alert kind="success">Palavra-passe alterada. As outras sessões foram terminadas.</Alert>}
      {change.error && !(change.error instanceof ApiError && Object.keys(change.error.fieldErrors).length) && <Alert kind="error">{errorMessage(change.error)}</Alert>}
      <PasswordField label="Palavra-passe actual" autoComplete="current-password" error={errors.currentPassword?.message} {...register("currentPassword")} />
      <PasswordField label="Nova palavra-passe" autoComplete="new-password" error={errors.newPassword?.message} {...register("newPassword")} />
      <PasswordStrength value={newPassword} />
      <PasswordField label="Confirmar nova palavra-passe" autoComplete="new-password" error={errors.confirmPassword?.message} {...register("confirmPassword")} />
      <Button type="submit" loading={change.isPending}>Alterar palavra-passe</Button>
    </form>
  );
}

export function ChangePinForm() {
  const change = useChangePin();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PinIn>({
    resolver: zodResolver(changePinSchema), defaultValues: { currentPin: "", newPin: "", confirmPin: "" },
  });
  return (
    <form noValidate className="space-y-4" onSubmit={handleSubmit((v) => change.mutate({ currentPin: v.currentPin, newPin: v.newPin }, { onSuccess: () => reset() }))}>
      {change.isSuccess && <Alert kind="success">PIN alterado com sucesso.</Alert>}
      {change.error && <Alert kind="error">{errorMessage(change.error)}</Alert>}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <PinField label="PIN actual" error={errors.currentPin?.message} {...register("currentPin")} />
        <PinField label="Novo PIN" error={errors.newPin?.message} {...register("newPin")} />
        <PinField label="Confirmar" error={errors.confirmPin?.message} {...register("confirmPin")} />
      </div>
      <Button type="submit" loading={change.isPending}>Alterar PIN</Button>
    </form>
  );
}
