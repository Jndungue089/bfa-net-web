"use client";
import { useEffect, useRef } from "react";
import { Icon } from "./Icon";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  /** false while an operation is in flight: Esc / backdrop / X are disabled. */
  dismissible?: boolean;
}

/**
 * Drawer that slides up from the bottom edge (native <dialog>: focus trap, Esc, inert background).
 * Height is capped with `dvh`, so mobile browser toolbars never push the close button off-screen;
 * on wide screens it is a centred bottom panel.
 */
export function Sheet({ open, onClose, title, children, dismissible = true }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref} aria-label={title} data-sheet
      onCancel={(e) => { e.preventDefault(); if (dismissible) onClose(); }}
      onClick={(e) => { if (dismissible && e.target === ref.current) onClose(); }}
      className="fixed inset-x-0 bottom-0 top-auto m-0 mx-auto max-h-[88dvh] w-full max-w-xl overflow-hidden rounded-t-3xl bg-white p-0 shadow-2xl"
    >
      {open && (
        <div className="flex max-h-[88dvh] flex-col">
          <div className="mx-auto mt-2.5 h-1 w-11 shrink-0 rounded-full bg-slate-200" aria-hidden />
          <div className="flex shrink-0 items-center justify-between gap-3 px-6 pb-2 pt-3">
            <h2 className="text-lg font-semibold text-navy-900">{title}</h2>
            {dismissible && (
              <button type="button" onClick={onClose} aria-label="Fechar" className="flex size-10 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100">
                <Icon name="x" />
              </button>
            )}
          </div>
          <div className="space-y-4 overflow-y-auto overscroll-contain px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">{children}</div>
        </div>
      )}
    </dialog>
  );
}
