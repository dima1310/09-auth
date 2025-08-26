"use client";

import React, { useEffect, ReactNode } from "react";
import { createPortal } from "react-dom";
import styles from "./Modal.module.css";

interface ModalProps {
  children: ReactNode;
  onClose?: () => void;
}

export default function Modal({ children, onClose }: ModalProps) {
  // Блокируем скролл body при открытии модального окна
  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  // Обработчик нажатия Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && onClose) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  // Рендерим модальное окно в портал
  if (typeof window === "undefined") {
    return null;
  }

  return createPortal(
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>{children}</div>
    </div>,
    document.body
  );
}
