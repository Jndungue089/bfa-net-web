"use client";
import { FlowShell } from "@/components/features/FlowShell";
import { ServicePaymentForm } from "@/components/features/forms/ServicePaymentForm";

export default function ReferencePayment() {
  return <FlowShell title="Pagamento por referência" back="/services/payments">{(done) => <ServicePaymentForm onDone={done} />}</FlowShell>;
}
