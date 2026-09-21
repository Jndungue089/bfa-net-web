import { createApiClient, createBankApi } from "@bfa/shared";
import { useSessionStore } from "@/stores/session";
import { getQueryClient } from "./query";

let expiring = false;

function handleExpired() {
  if (expiring) return;
  expiring = true;
  useSessionStore.getState().setAnonymous();
  getQueryClient().clear(); // drop all cached financial data
  // Hard navigation on purpose: it discards every in-memory store and cache along with the session.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) window.location.assign("/login?expired=1");
}

/** Same-origin client: cookies carry the session; `/api/*` is rewritten to the backend by Next. */
const client = createApiClient({
  baseUrl: "",
  clientKind: "web",
  refresh: async () => {
    try {
      await bankApi.auth.refresh();
      return true;
    } catch {
      return false;
    }
  },
  onSessionExpired: handleExpired,
});

export const bankApi = createBankApi(client);
export const resetExpiryGuard = () => { expiring = false; };
