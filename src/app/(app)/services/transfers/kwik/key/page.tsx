"use client";
import { FlowShell } from "@/components/features/FlowShell";
import { KwikForm } from "@/components/features/forms/KwikForm";

export default function KwikByKey() {
  return <FlowShell title="Chave KWiK" back="/services/transfers/kwik">{(done) => <KwikForm onDone={done} />}</FlowShell>;
}
