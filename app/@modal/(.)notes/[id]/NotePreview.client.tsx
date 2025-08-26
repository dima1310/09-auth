"use client";

import React, { useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiClient } from "../../../../lib/api/clientApi";
import { Note } from "../../../../types/note";
import { User } from "../../../../types/user";
import Loader from "../../../../components/Loader/Loader";
import styles from "./NotePreview.module.css";

// Типы для пропсов компонента
interface NotePreviewProps {
  noteId: string;
  initialNote?: Note;
  user: User;
}

export default function NotePreview({
  noteId,
  initialNote,
  user,
}: NotePreviewProps) {
  const router = useRouter();

  // Query для получения данных заметки
  const {
    data: note,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["notes", noteId],
    queryFn: () => apiClient.notes.getById(noteId),
    initialData: initialNote,
    staleTime: 300000, // 5 минут
    gcTime: 600000, // 10 минут
    retry: (failureCount, error) => {
      // Не ретраим если заметка не найдена
      if (error instanceof Error && error.message.includes("404")) {
        return false;
      }
      return failureCount < 3;
    },
  });

  // Обработчик закрытия модального окна
  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  // Обработчик клика по фону модального окна
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    // Закрываем модальное окно при клике по фону
    if (event.target === event.currentTarget) {
      handleClose();
    }
  };

  // Обработчик нажатия Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Обработчик перехода к полной странице заметки
  const handleViewFullNote = () => {
    router.push(`/notes/${noteId}`);
  };

  // Обработчик редактирования заметки
  const handleEditNote = () => {
    router.push(`/notes/${noteId}/edit`);
  };

  // Обработчик повторной попытки загрузки
  const handleRetry = () => {
    refetch();
  };

  // Форматирование даты
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Unknown date";
    }
  };

  // Обрезка контента для превью
  const truncateContent = (
    content: string,
    maxLength: number = 300
  ): string => {
    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength) + "...";
  };

  // Состояние загрузки
  if (isLoading) {
    return (
      <div className={styles.modalOverlay} onClick={handleBackdropClick}>
        <div className={styles.modalContent} role="dialog" aria-modal="true">
          <div className={styles.modalHeader}>
            <h2>Loading Note Preview</h2>
            <button
              onClick={handleClose}
              className={styles.closeButton}
              aria-label="Close modal"
            >
              ×
            </button>
          </div>
          <div className={styles.loadingState}>
            <Loader />
            <p>Loading note preview...</p>
          </div>
        </div>
      </div>
    );
  }

  // Состояние ошибки
  if (isError) {
    return (
      <div className={styles.modalOverlay} onClick={handleBackdropClick}>
        <div className={styles.modalContent} role="dialog" aria-modal="true">
          <div className={styles.modalHeader}>
            <h2>Error Loading Preview</h2>
            <button
              onClick={handleClose}
              className={styles.closeButton}
              aria-label="Close modal"
            >
              ×
            </button>
          </div>
          <div className={styles.errorState}>
            <p className={styles.errorMessage}>
              {error instanceof Error
                ? error.message
                : "Failed to load note preview"}
            </p>
            <div className={styles.errorActions}>
              <button onClick={handleRetry} className={styles.retryButton}>
                Try Again
              </button>
              <button onClick={handleClose} className={styles.cancelButton}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Если заметка не найдена
  if (!note) {
    return (
      <div className={styles.modalOverlay} onClick={handleBackdropClick}>
        <div className={styles.modalContent} role="dialog" aria-modal="true">
          <div className={styles.modalHeader}>
            <h2>Note Not Found</h2>
            <button
              onClick={handleClose}
              className={styles.closeButton}
              aria-label="Close modal"
            >
              ×
            </button>
          </div>
          <div className={styles.notFoundState}>
            <p>
              The note you&apos;re trying to preview doesn&apos;t exist or may
              have been deleted.
            </p>
            <button onClick={handleClose} className={styles.closeModalButton}>
              Close Preview
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Основное отображение превью заметки
  return (
    <div className={styles.modalOverlay} onClick={handleBackdropClick}>
      <div className={styles.modalContent} role="dialog" aria-modal="true">
        {/* Заголовок модального окна */}
        <div className={styles.modalHeader}>
          <div className={styles.titleSection}>
            <h2 className={styles.modalTitle}>Note Preview</h2>
            <span className={styles.authorInfo}>by {user.username}</span>
          </div>
          <button
            onClick={handleClose}
            className={styles.closeButton}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {/* Содержание превью */}
        <div className={styles.modalBody}>
          {/* Заголовок заметки */}
          <header className={styles.noteHeader}>
            <h3 className={styles.noteTitle}>{note.title}</h3>
            <div className={styles.noteMeta}>
              {note.createdAt && (
                <span className={styles.noteDate}>
                  Created: {formatDate(note.createdAt)}
                </span>
              )}
              {note.updatedAt && note.updatedAt !== note.createdAt && (
                <span className={styles.noteDate}>
                  Updated: {formatDate(note.updatedAt)}
                </span>
              )}
            </div>
          </header>

          {/* Теги */}
          {note.tags && note.tags.length > 0 && (
            <div className={styles.tagsSection}>
              <div className={styles.tagsList}>
                {note.tags.map((tag) => (
                  <span key={tag} className={styles.tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Превью содержания */}
          <div className={styles.contentPreview}>
            <div className={styles.contentText}>
              {truncateContent(note.content)
                .split("\n")
                .map((paragraph, index) => (
                  <p key={index} className={styles.paragraph}>
                    {paragraph || "\u00A0"}{" "}
                    {/* Non-breaking space for empty lines */}
                  </p>
                ))}
            </div>

            {note.content.length > 300 && (
              <div className={styles.contentTruncated}>
                <p>Content has been truncated for preview...</p>
              </div>
            )}
          </div>

          {/* Статистика */}
          <div className={styles.noteStats}>
            <div className={styles.stat}>
              <span className={styles.statValue}>{note.content.length}</span>
              <span className={styles.statLabel}>characters</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>
                {note.content.split(/\s+/).length}
              </span>
              <span className={styles.statLabel}>words</span>
            </div>
            {note.tags && (
              <div className={styles.stat}>
                <span className={styles.statValue}>{note.tags.length}</span>
                <span className={styles.statLabel}>tags</span>
              </div>
            )}
          </div>
        </div>

        {/* Действия в модальном окне */}
        <div className={styles.modalFooter}>
          <div className={styles.actions}>
            <button
              onClick={handleViewFullNote}
              className={styles.viewFullButton}
            >
              View Full Note
            </button>
            <button onClick={handleEditNote} className={styles.editButton}>
              Edit Note
            </button>
            <button onClick={handleClose} className={styles.closeModalButton}>
              Close Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
