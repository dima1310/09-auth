"use client";

import React, { ReactNode, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

interface TanStackProviderProps {
  children: ReactNode;
}

export default function TanStackProvider({ children }: TanStackProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Время, в течение которого данные считаются свежими (не требуют повторного запроса)
            staleTime: 60 * 1000, // 1 минута
            // Время жизни кэша (сколько хранить неиспользуемые данные)
            gcTime: 5 * 60 * 1000, // 5 минут
            // Повторные попытки при ошибках
            retry: (failureCount, error) => {
              // Не повторяем 404 ошибки
              if (error instanceof Error && error.message.includes("404")) {
                return false;
              }
              // Максимум 2 повтора для других ошибок
              return failureCount < 2;
            },
            // Интервал между повторными попытками
            retryDelay: (attemptIndex) =>
              Math.min(1000 * 2 ** attemptIndex, 30000),
          },
          mutations: {
            // Повторные попытки для мутаций
            retry: (failureCount, error) => {
              // Не повторяем клиентские ошибки (4xx)
              if (error instanceof Error) {
                const errorWithStatus = error as Error & { status?: number };
                if (
                  errorWithStatus.status &&
                  errorWithStatus.status >= 400 &&
                  errorWithStatus.status < 500
                ) {
                  return false;
                }
              }
              return failureCount < 1;
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
