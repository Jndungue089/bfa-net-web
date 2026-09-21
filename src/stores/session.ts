import { create } from "zustand";
import type { Profile } from "@bfa/shared";

type Status = "unknown" | "authenticated" | "anonymous";

interface SessionState {
  status: Status;
  profile: Profile | null;
  setAuthenticated: (profile: Profile) => void;
  setAnonymous: () => void;
}

/** Holds only the non-secret profile. Tokens live in HttpOnly cookies and are never readable from JS. */
export const useSessionStore = create<SessionState>((set) => ({
  status: "unknown",
  profile: null,
  setAuthenticated: (profile) => set({ status: "authenticated", profile }),
  setAnonymous: () => set({ status: "anonymous", profile: null }),
}));
