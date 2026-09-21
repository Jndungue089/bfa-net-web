"use client";
import type { Contact } from "@bfa/shared";
import { PageHeader } from "@/components/features/PageHeader";
import { Alert, Card, Icon, Skeleton, type IconName } from "@/components/ui";
import { useContacts } from "@/hooks/useBank";

const ICONS: Record<Contact["kind"], IconName> = { phone: "call", email: "mail", web: "globe", branch: "pin" };
// Rendered as links, so only the schemes a contact can legitimately need are ever allowed.
const SAFE_URL = /^(tel:[+\d ]{3,20}|mailto:[^\s@]+@[^\s@]+|https:\/\/www\.bfa\.ao(\/[^\s]*)?)$/;

export default function ContactsPage() {
  const contacts = useContacts();
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <PageHeader title="Contactos" back="/profile" />
      {contacts.isPending ? <Skeleton className="h-56" /> : contacts.isError ? <Alert kind="error">Não foi possível carregar os contactos.</Alert> : (
        <Card className="!p-2">
          <ul className="divide-y divide-slate-100">
            {contacts.data.filter((c) => SAFE_URL.test(c.url)).map((c) => (
              <li key={c.url}>
                <a href={c.url} {...(c.url.startsWith("https:") ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="flex items-center gap-4 rounded-xl px-3 py-3.5 hover:bg-slate-50">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600"><Icon name={ICONS[c.kind]} /></span>
                  <span className="min-w-0 flex-1"><span className="block text-sm text-slate-500">{c.label}</span><span className="block font-semibold text-navy-900">{c.value}</span></span>
                  <Icon name="link" className="size-4.5 text-slate-400" />
                </a>
              </li>
            ))}
          </ul>
        </Card>
      )}
      <p className="text-center text-sm text-slate-500">Pode ainda dirigir-se a qualquer balcão BFA.</p>
    </div>
  );
}
