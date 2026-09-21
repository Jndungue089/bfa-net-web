"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@bfa/shared";
import { bankApi } from "@/lib/api";
import { useSessionStore } from "@/stores/session";

const ACCEPT = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 10 * 1024 * 1024; // must match IAvatarService.MaxUploadBytes
export const AVATAR_ACCEPT = ACCEPT.join(",");

/**
 * The original file goes to the backend untouched: it validates the real type from the bytes, crops to a square,
 * resizes and re-encodes (stripping EXIF). The checks below are only to fail fast without a round trip.
 */
export function useUploadAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      if (!ACCEPT.includes(file.type)) throw new ApiError(0, "invalid_type", "Use uma imagem JPEG, PNG ou WebP.");
      if (file.size > MAX_BYTES) throw new ApiError(0, "too_large", "A imagem excede 10 MB.");
      const form = new FormData();
      form.append("file", file, "avatar");
      await bankApi.auth.uploadAvatar(form);
      const me = await bankApi.auth.me();
      useSessionStore.getState().setAuthenticated(me);
      await qc.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

export function useRemoveAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await bankApi.auth.deleteAvatar();
      useSessionStore.getState().setAuthenticated(await bankApi.auth.me());
      await qc.invalidateQueries({ queryKey: ["me"] });
    },
  });
}
