"use client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { pinConfirmSchema } from "@bfa/shared";
import { Alert, Button, Modal, PinField } from "@/components/ui";

interface Props {
  open: boolean;
  title?: string;
  summary: React.ReactNode;
  pending: boolean;
  error?: string | null;
  onCancel: () => void;
  onConfirm: (pin: string) => void;
}

/** Step-up authorisation shared by every money-moving operation: review the summary, then enter the operations PIN. */
export function PinConfirmDialog({ open, title = "Confirmar operação", summary, pending, error, onCancel, onConfirm }: Props) {
  const { register, handleSubmit, reset, setFocus, formState: { errors } } = useForm<{ pin: string }>({
    resolver: zodResolver(pinConfirmSchema),
    defaultValues: { pin: "" },
  });

  // The PIN must not linger in memory/DOM after the dialog closes or after a rejected attempt.
  useEffect(() => { if (!open) reset({ pin: "" }); else setTimeout(() => setFocus("pin"), 50); }, [open, reset, setFocus]);
  useEffect(() => { if (error) reset({ pin: "" }); }, [error, reset]);

  return (
    <Modal open={open} onClose={onCancel} title={title} dismissible={!pending}>
      <form onSubmit={handleSubmit((v) => onConfirm(v.pin))} className="space-y-4" noValidate>
        <div className="rounded-xl bg-slate-50 p-4 text-sm ring-1 ring-slate-200">{summary}</div>
        <PinField label="PIN de operações" error={errors.pin?.message} {...register("pin")} />
        {error && <Alert kind="error">{error}</Alert>}
        <div className="flex gap-3">
          <Button variant="secondary" full onClick={onCancel} disabled={pending}>Cancelar</Button>
          <Button type="submit" full loading={pending}>Confirmar</Button>
        </div>
      </form>
    </Modal>
  );
}
