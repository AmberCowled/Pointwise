"use client";

import { useNotifications } from "@pointwise/app/components/ui/NotificationProvider";
import { useCallback } from "react";
import { authApi } from "./auth";
import type { ApiRequestOptions } from "./client";

export function useApi() {
  const { showNotification } = useNotifications();

  // Memoize options creation to avoid recreating on every render
  const createOptions = useCallback(
    (): ApiRequestOptions => ({
      onError: (message, variant = "error") => {
        showNotification({
          message,
          variant,
        });
      },
    }),
    [showNotification],
  );

  return {
    auth: {
      signup: (
        data: Parameters<typeof authApi.signup>[0],
        options?: ApiRequestOptions,
      ) => authApi.signup(data, { ...createOptions(), ...options }),
    },
  };
}

export { authApi as authApiRaw } from "./auth";
// Export raw API functions (for use outside React components)
export * from "./errors";
// Export types
export * from "./types";
