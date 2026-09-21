"use client";
import { useRef } from "react";
import { formatDate, formatDateTime, formatPhone } from "@bfa/shared";
import { Avatar } from "@/components/features/Avatar";
import { errorMessage } from "@/components/features/errors";
import { OptionRow } from "@/components/features/ServiceTile";
import { SummaryList } from "@/components/features/SummaryList";
import { Alert, Button, Card, CardTitle, Icon } from "@/components/ui";
import { AVATAR_ACCEPT, useRemoveAvatar, useUploadAvatar } from "@/hooks/useAvatar";
import { useLogout } from "@/hooks/useAuth";
import { useSessionStore } from "@/stores/session";

export default function ProfilePage() {
  const p = useSessionStore((s) => s.profile);
  const logout = useLogout();
  const upload = useUploadAvatar();
  const remove = useRemoveAvatar();
  const file = useRef<HTMLInputElement>(null);
  if (!p) return null;
  const busy = upload.isPending || remove.isPending;
  const err = upload.error ?? remove.error;

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-2 pt-2 text-center">
        <div className="relative">
          <Avatar name={p.fullName} version={p.avatarVersion} size={112} />
          <input ref={file} type="file" accept={AVATAR_ACCEPT} hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) upload.mutate(f); e.target.value = ""; }} />
          <button type="button" onClick={() => file.current?.click()} disabled={busy} aria-label="Alterar fotografia"
            className="absolute -bottom-1 -right-1 flex size-11 items-center justify-center rounded-full border-[3px] border-slate-50 bg-brand-500 text-white shadow hover:bg-brand-600 disabled:opacity-60">
            <Icon name="camera" />
          </button>
        </div>
        <h1 className="text-2xl font-bold text-navy-900">{p.fullName}</h1>
        <p className="text-sm text-slate-500">Adesão {p.customerNumber}</p>
        {p.avatarVersion != null && (
          <button type="button" onClick={() => remove.mutate()} disabled={busy} aria-label="Remover fotografia" className="flex size-10 items-center justify-center rounded-full text-red-600 hover:bg-red-50 disabled:opacity-50"><Icon name="trash" /></button>
        )}
      </div>
      {err && <Alert kind="error">{errorMessage(err)}</Alert>}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle action={<Icon name="lock" className="size-4.5 text-slate-400" />}>Os meus dados</CardTitle>
          <div className="text-sm"><SummaryList rows={[["Email", p.email], ["Telemóvel", formatPhone(p.phone)], ["BI", p.nationalId], ["Nascimento", formatDate(`${p.birthDate}T00:00:00Z`)], ["Último acesso", p.lastLoginAt ? formatDateTime(p.lastLoginAt) : "—"]]} /></div>
          <Alert kind="info" className="mt-4">Estes dados são geridos pelo banco. Para os alterar, dirija-se a um balcão BFA.</Alert>
        </Card>

        <Card className="!p-3">
          <OptionRow href="/profile/security" icon="shield" title="Segurança e sessões" subtitle="Palavra-passe, PIN e dispositivos" />
          <OptionRow href="/statement" icon="file" title="Extracto bancário" />
          <OptionRow href="/beneficiaries" icon="users" title="Beneficiários" />
          <OptionRow href="/about" icon="info" title="Sobre o BFA" />
          <OptionRow href="/contacts" icon="call" title="Contactos" />
        </Card>
      </div>

      <Button variant="danger" loading={logout.isPending} onClick={() => logout.mutate()}><Icon name="logout" className="size-4" />Terminar sessão</Button>
    </div>
  );
}
