"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { useLogout, useSessionBootstrap } from "@/hooks/useAuth";
import { usePrivacyStore } from "@/stores/privacy";
import { useSessionStore } from "@/stores/session";
import { Button, Icon, type IconName } from "@/components/ui";
import { BrandLockup } from "./BrandLockup";
import { IdleGuard } from "./IdleGuard";

const NAV: Array<{ href: string; label: string; icon: IconName; mobile?: boolean }> = [
  { href: "/dashboard", label: "Resumo", icon: "home", mobile: true },
  { href: "/services", label: "Serviços", icon: "grid", mobile: true },
  { href: "/cards", label: "Cartões", icon: "card", mobile: true },
  { href: "/statement", label: "Extracto", icon: "file", mobile: true },
  { href: "/beneficiaries", label: "Beneficiários", icon: "users" },
  { href: "/profile", label: "Perfil", icon: "user", mobile: true },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  useSessionBootstrap();
  const pathname = usePathname();
  const profile = useSessionStore((s) => s.profile);
  const { hideBalances, toggle } = usePrivacyStore();
  const logout = useLogout();
  const active = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="min-h-dvh lg:pl-64 print:pl-0">
      <aside className="fixed inset-y-0 left-0 hidden h-dvh w-64 flex-col bg-navy-900 p-5 text-white lg:flex print:!hidden">
        <Link href="/dashboard" className="mb-8 flex items-center gap-3" aria-label="BFA NET — Resumo">
          <span className="rounded-xl bg-white px-3 py-2"><BrandLockup height={26} /></span>
        </Link>
        <nav className="flex-1 space-y-1 overflow-y-auto" aria-label="Principal">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} aria-current={active(n.href) ? "page" : undefined}
              className={cn("flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition",
                active(n.href) ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white")}>
              <Icon name={n.icon} /> {n.label}
            </Link>
          ))}
        </nav>
        <button onClick={() => logout.mutate()} className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-500/15 hover:text-red-300">
          <Icon name="logout" /> Terminar sessão
        </button>
      </aside>

      <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white/85 px-4 backdrop-blur lg:px-8 print:hidden">
        <Link href="/dashboard" className="flex items-center lg:hidden" aria-label="BFA NET — Resumo"><BrandLockup height={26} /></Link>
        <p className="hidden truncate text-sm text-slate-500 lg:block">
          Adesão <span className="font-medium text-slate-800 tabular">{profile?.customerNumber ?? "········"}</span>
        </p>
        <div className="flex items-center gap-2">
          <Button variant="ghost" className="h-10 px-3" onClick={toggle} aria-pressed={hideBalances} aria-label={hideBalances ? "Mostrar saldos" : "Ocultar saldos"}>
            <Icon name={hideBalances ? "eyeOff" : "eye"} />
          </Button>
          <span className="hidden max-w-48 truncate text-sm font-medium text-navy-900 sm:block">{profile?.fullName}</span>
          <Button variant="ghost" className="h-10 px-3 text-red-600 hover:bg-red-50 lg:hidden" onClick={() => logout.mutate()} aria-label="Terminar sessão"><Icon name="logout" /></Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-28 pt-6 lg:px-8 lg:pb-10 print:p-0">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden print:!hidden" aria-label="Principal">
        {NAV.filter((n) => n.mobile).map((n) => (
          <Link key={n.href} href={n.href} aria-current={active(n.href) ? "page" : undefined}
            className={cn("flex flex-col items-center gap-0.5 py-2.5 text-[0.7rem] font-medium", active(n.href) ? "text-brand-600" : "text-slate-500")}>
            <Icon name={n.icon} className="size-5" /> {n.label}
          </Link>
        ))}
      </nav>
      <IdleGuard />
    </div>
  );
}
