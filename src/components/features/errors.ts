import { ApiError } from "@bfa/shared";

/** Message safe to show to the user for any thrown value. */
export const errorMessage = (e: unknown): string =>
  e instanceof ApiError ? e.message : "Ocorreu um erro inesperado. Tente novamente.";
