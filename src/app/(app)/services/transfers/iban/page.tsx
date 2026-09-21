"use client";
import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { isValidIban, normalizeIban } from "@bfa/shared";
import { FlowShell } from "@/components/features/FlowShell";
import { TransferForm } from "@/components/features/forms/TransferForm";
import { Icon } from "@/components/ui";

function Inner() {
  const preset = normalizeIban(useSearchParams().get("to") ?? "");
  return (
    <FlowShell title="Transferir por IBAN" back="/services/transfers">
      {(done) => (
        <div className="space-y-4">
          <Link href="/beneficiaries" className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:underline"><Icon name="users" className="size-4" />Beneficiários</Link>
          <TransferForm plain presetIban={isValidIban(preset) ? preset : undefined} onDone={(r) => done(r)} />
        </div>
      )}
    </FlowShell>
  );
}

export default function TransferByIban() {
  return <Suspense><Inner /></Suspense>;
}
