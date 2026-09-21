"use client";
import { useEffect, useRef } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  /** When false, Esc / backdrop cannot dismiss (e.g. while a payment is in flight). */
  dismissible?: boolean;
}

/** Native <dialog>: focus trap, Esc handling, inert background and top-layer stacking for free. */
export function Modal({ open, onClose, title, children, dismissible = true }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label={title}
      onCancel={(e) => { e.preventDefault(); if (dismissible) onClose(); }}
      onClick={(e) => { if (dismissible && e.target === ref.current) onClose(); }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white p-0 shadow-2xl"
    >
      {open && (
        <div className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-navy-900">{title}</h2>
          {children}
        </div>
      )}
    </dialog>
  );
}
