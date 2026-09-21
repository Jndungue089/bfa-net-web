import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm } from "@/components/features/forms/LoginForm";

export const metadata: Metadata = { title: "Entrar" };

export default function LoginPage() {
  return (
    <>
      <h2 className="text-2xl font-bold text-navy-900">Entrar no BFA NET</h2>
      <p className="mb-7 mt-1 text-sm text-slate-500">Use o seu número de adesão e palavra-passe.</p>
      <Suspense><LoginForm /></Suspense>
    </>
  );
}
