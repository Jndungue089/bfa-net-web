import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "@bfa/shared";

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 15_000,
        refetchOnWindowFocus: true,
        // Never hammer the API on auth/validation problems; retry transient failures only.
        retry: (count, error) => !(error instanceof ApiError && error.status >= 400 && error.status < 500) && count < 2,
      },
      mutations: { retry: false },
    },
  });
}

let browserClient: QueryClient | undefined;
export const getQueryClient = () => (typeof window === "undefined" ? makeQueryClient() : (browserClient ??= makeQueryClient()));
