"use client";
import { useIdleTimeout } from "@/hooks/useIdleTimeout";
import { useLogout } from "@/hooks/useAuth";
import { Button, Modal } from "@/components/ui";

const IDLE_MS = 5 * 60_000;
const WARN_MS = 30_000;

export function IdleGuard() {
  const logout = useLogout();
  const { warning, secondsLeft, stay } = useIdleTimeout({ timeoutMs: IDLE_MS, warnMs: WARN_MS, onTimeout: () => logout.mutate() });
  return (
    <Modal open={warning} onClose={stay} title="Ainda aí?" dismissible={false}>
      <p className="text-sm text-slate-600">Por segurança, a sessão termina por inactividade em <strong>{secondsLeft}s</strong>.</p>
      <div className="mt-5 flex gap-3">
        <Button variant="secondary" full onClick={() => logout.mutate()}>Terminar sessão</Button>
        <Button full onClick={stay}>Continuar</Button>
      </div>
    </Modal>
  );
}
