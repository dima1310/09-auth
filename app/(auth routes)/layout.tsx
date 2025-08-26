"use client";

import React, { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const router = useRouter();

  useEffect(() => {
    // Обновляем роутер при монтировании компонента
    router.refresh();
  }, [router]);

  return (
    <div className="auth-layout">
      <div className="auth-container">{children}</div>
    </div>
  );
}
