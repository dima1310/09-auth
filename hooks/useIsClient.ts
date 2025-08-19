// hooks/useIsClient.ts

import { useEffect, useState } from "react";

/**
 * Хук для перевірки, чи код виконується на клієнті.
 * Використовується для уникнення проблем гідратації в Next.js
 */
export function useIsClient() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}
