"use client";
import { PageHeader } from "@/components/features/PageHeader";
import { SessionList } from "@/components/features/SessionList";
import { ChangePasswordForm, ChangePinForm } from "@/components/features/forms/SecurityForms";
import { Button, Card, CardTitle } from "@/components/ui";
import { useLogoutAll } from "@/hooks/useAuth";

export default function SecurityPage() {
  const logoutAll = useLogoutAll();
  return (
    <div className="space-y-6">
      <PageHeader title="Segurança" back="/profile" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card><CardTitle>Alterar palavra-passe</CardTitle><ChangePasswordForm /></Card>
        <Card><CardTitle>Alterar PIN de operações</CardTitle><ChangePinForm /></Card>
        <Card className="lg:col-span-2">
          <CardTitle action={<Button variant="secondary" className="h-9 px-3" loading={logoutAll.isPending} onClick={() => logoutAll.mutate()}>Terminar todas</Button>}>Sessões activas</CardTitle>
          <SessionList />
        </Card>
      </div>
    </div>
  );
}
