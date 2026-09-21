import { BrandLockup } from "@/components/features/BrandLockup";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-navy-900 p-12 text-white lg:flex">
        <div className="absolute -right-24 -top-24 size-96 rounded-full bg-brand-500/20 blur-3xl" aria-hidden />
        <div className="absolute -bottom-32 -left-16 size-96 rounded-full bg-navy-700/60 blur-3xl" aria-hidden />
        <span aria-hidden />
        <div className="relative">
          <h1 className="text-4xl font-bold leading-tight">O seu banco,<br />sempre <span className="text-brand-400">consigo</span>.</h1>
          <p className="mt-4 max-w-md text-white/70">Consulte contas, transfira e pague com a segurança do BFA. Os seus dados são cifrados e cada operação exige o seu PIN.</p>
        </div>
        <p className="relative text-xs text-white/50">Projecto de demonstração · não é um serviço oficial do BFA.</p>
      </aside>
      <main className="flex items-center justify-center bg-white px-5 py-10">
        <div className="w-full max-w-md">
          <BrandLockup height={52} className="mb-8" />
          {children}
        </div>
      </main>
    </div>
  );
}
