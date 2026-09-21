"use client";
import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ApiError, type LoginForm } from "@bfa/shared";
import { bankApi, resetExpiryGuard } from "@/lib/api";
import { useSessionStore } from "@/stores/session";

/** Loads the profile once per app shell mount and mirrors it into the session store. */
export function useSessionBootstrap() {
  const { setAuthenticated, setAnonymous } = useSessionStore.getState();
  const query = useQuery({ queryKey: ["me"], queryFn: () => bankApi.auth.me(), staleTime: 5 * 60_000 });

  useEffect(() => {
    if (query.data) setAuthenticated(query.data);
    else if (query.error instanceof ApiError && query.error.status === 401) setAnonymous();
  }, [query.data, query.error, setAuthenticated, setAnonymous]);

  return query;
}

export function useLogin() {
  const router = useRouter();
  return useMutation({
    mutationFn: (v: LoginForm) => bankApi.auth.login({ customerNumber: v.customerNumber.trim(), password: v.password }),
    onSuccess: (session) => {
      resetExpiryGuard();
      useSessionStore.getState().setAuthenticated(session.profile);
      const next = new URLSearchParams(window.location.search).get("next");
      // Only same-origin relative paths: closes open-redirect via ?next=https://evil.
      router.replace(next && /^\/(?!\/)[\w\-/]*$/.test(next) ? next : "/dashboard");
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => bankApi.auth.register(body),
    onSuccess: (session) => {
      resetExpiryGuard();
      useSessionStore.getState().setAuthenticated(session.profile);
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => bankApi.auth.logout().catch(() => undefined), // always end the local session
    onSettled: () => {
      useSessionStore.getState().setAnonymous();
      qc.clear();
      router.replace("/login");
    },
  });
}

export function useChangePassword() {
  return useMutation({ mutationFn: bankApi.auth.changePassword });
}

export function useChangePin() {
  return useMutation({ mutationFn: bankApi.auth.changePin });
}

export function useSessions() {
  return useQuery({ queryKey: ["sessions"], queryFn: () => bankApi.auth.sessions() });
}

export function useRevokeSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (familyId: string) => bankApi.auth.revokeSession(familyId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sessions"] }),
  });
}

export function useLogoutAll() {
  const router = useRouter();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => bankApi.auth.logoutAll(),
    onSuccess: () => {
      useSessionStore.getState().setAnonymous();
      qc.clear();
      router.replace("/login");
    },
  });
}
