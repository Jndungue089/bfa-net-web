import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PrivacyState {
  hideBalances: boolean;
  toggle: () => void;
}

/** "Ocultar saldos" — a display preference only, safe to persist. */
export const usePrivacyStore = create<PrivacyState>()(
  persist((set) => ({ hideBalances: false, toggle: () => set((s) => ({ hideBalances: !s.hideBalances })) }), {
    name: "bfanet-privacy",
    partialize: (s) => ({ hideBalances: s.hideBalances }),
  }),
);
