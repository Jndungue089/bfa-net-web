"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Receipt as ReceiptData } from "@bfa/shared";
import { Card } from "@/components/ui";
import { PageHeader } from "./PageHeader";
import { Receipt } from "./Receipt";

/** Page frame for a money-moving flow: header with back link, the form in a card, then the receipt. */
export function FlowShell({ title, back, children, wide }: { title: string; back: string; wide?: boolean; children: (done: (r: ReceiptData) => void) => React.ReactNode }) {
  const router = useRouter();
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  return (
    <div className="space-y-6">
      <PageHeader title={title} back={receipt ? undefined : back} />
      {receipt ? <Receipt receipt={receipt} onDone={() => router.push("/services")} /> : <Card className={wide ? "mx-auto max-w-xl" : "mx-auto max-w-xl"}>{children(setReceipt)}</Card>}
    </div>
  );
}
