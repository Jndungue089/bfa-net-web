import type { Metadata } from "next";
import { RegisterForm } from "@/components/features/forms/RegisterForm";

export const metadata: Metadata = { title: "Criar adesão" };

export default function RegisterPage() {
  return (
    <>
      <h2 className="text-2xl font-bold text-navy-900">Criar adesão</h2>
      <p className="mb-7 mt-1 text-sm text-slate-500">Preencha os seus dados para aderir ao BFA NET.</p>
      <RegisterForm />
    </>
  );
}
