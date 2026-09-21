"use client";
import { formatDateTime } from "@bfa/shared";
import { Badge, Button, Skeleton } from "@/components/ui";
import { useRevokeSession, useSessions } from "@/hooks/useAuth";

export function SessionList() {
  const { data, isPending } = useSessions();
  const revoke = useRevokeSession();
  if (isPending) return <Skeleton className="h-20" />;
  return (
    <ul className="divide-y divide-slate-100">
      {data?.map((s) => (
        <li key={s.familyId} className="flex items-center justify-between gap-3 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-900">{s.device ?? "Dispositivo desconhecido"} {s.current && <Badge tone="success">Esta sessão</Badge>}</p>
            <p className="text-xs text-slate-500">{s.ipAddress ?? "IP desconhecido"} · desde {formatDateTime(s.createdAt)}</p>
          </div>
          {!s.current && <Button variant="secondary" className="h-9 px-3" loading={revoke.isPending && revoke.variables === s.familyId} onClick={() => revoke.mutate(s.familyId)}>Terminar</Button>}
        </li>
      ))}
    </ul>
  );
}
