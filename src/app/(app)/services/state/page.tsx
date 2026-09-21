"use client";
import { FlowShell } from "@/components/features/FlowShell";
import { StatePaymentForm } from "@/components/features/forms/PaymentForms";

export default function StatePayment() {
  return <FlowShell title="Pagamentos ao Estado" back="/services">{(done) => <StatePaymentForm onDone={done} />}</FlowShell>;
}
