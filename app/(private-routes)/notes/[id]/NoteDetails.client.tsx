"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiClient } from "../../../../lib/api/clientApi";
import { Note } from "../../../../types/note";
import { User } from "../../../../types/user";
import Loader from "../../../../components/Loader/Loader";
import styles from "./NoteDetails.module.css";

// Типы для пропсов компонента
interface NoteDetailsProps {
  noteId: string;
  initialNote?: Note;
  user: User;
}

export default function NoteDetails({
  noteId,
  initialNote,
  user,
}: NoteDetailsProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

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

  // Мутация для удаления заметки
  const deleteNoteMutation = useMutation({
    mutationFn: () => apiClient.notes.delete(noteId),
    onSuccess: () => {
      // Инвалидируем кэш заметок
      queryClient.invalidateQueries({ queryKey: ["notes"] });

      // Перенаправляем на список заметок
      router.push("/notes/filter/all");
    },
    onError: (error: unknown) => {
      console.error("Failed to delete note:", error);
      setIsDeleting(false);

      // Показываем ошибку пользователю
      alert("Failed to delete note. Please try again.");
    },
  });

  // Обработчик удаления заметки
  const handleDelete = () => {
    if (
      note &&
      window.confirm(`Are you sure you want to delete "${note.title}"?`)
    ) {
      setIsDeleting(true);
      deleteNoteMutation.mutate();
    }
  };

  // Обработчик редактирования заметки
  const handleEdit = () => {
    router.push(`/notes/${noteId}/edit`);
  };

  // Обработчик повторной попытки загрузки
  const handleRetry = () => {
    refetch();
  };

  // Обработчик возврата к списку
  const handleBackToList = () => {
    router.push("/notes/filter/all");
  };

  // Форматирование даты
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Unknown date";
    }
  };

  // Состояние загрузки
  if (isLoading) {
    return (
      <div className={styles.noteDetails}>
        <div className={styles.loadingState}>
          <Loader />
          <p>Loading note details...</p>
        </div>
      </div>
    );
  }

  // Состояние ошибки
  if (isError) {
    return (
      <div className={styles.noteDetails}>
        <div className={styles.errorState}>
          <h2>Failed to load note</h2>
          <p className={styles.errorMessage}>
            {error instanceof Error
              ? error.message
              : "An unexpected error occurred"}
          </p>
          <div className={styles.errorActions}>
            <button onClick={handleRetry} className={styles.retryButton}>
              Try Again
            </button>
            <button onClick={handleBackToList} className={styles.backButton}>
              Back to Notes
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Если заметка не найдена
  if (!note) {
    return (
      <div className={styles.noteDetails}>
        <div className={styles.notFoundState}>
          <h2>Note not found</h2>
          <p>
            The note you&apos;re looking for doesn&apos;t exist or may have been
            deleted.
          </p>
          <button onClick={handleBackToList} className={styles.backButton}>
            Back to Notes
          </button>
        </div>
      </div>
    );
  }

  // Основное отображение деталей заметки
  return (
    <div className={styles.noteDetails}>
      {/* Навигационная панель */}
      <nav className={styles.navigation}>
        <button
          onClick={handleBackToList}
          className={styles.backLink}
          aria-label="Back to notes list"
        >
          ← Back to Notes
        </button>
        <div className={styles.actions}>
          <button
            onClick={handleEdit}
            className={styles.editButton}
            disabled={isDeleting}
          >
            Edit Note
          </button>
          <button
            onClick={handleDelete}
            className={styles.deleteButton}
            disabled={isDeleting || deleteNoteMutation.isPending}
          >
            {isDeleting || deleteNoteMutation.isPending
              ? "Deleting..."
              : "Delete"}
          </button>
        </div>
      </nav>

      {/* Заголовок заметки */}
      <header className={styles.noteHeader}>
        <h1 className={styles.noteTitle}>{note.title}</h1>
        <div className={styles.noteMeta}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Created:</span>
            <span className={styles.metaValue}>
              {note.createdAt ? formatDate(note.createdAt) : "Unknown"}
            </span>
          </div>
          {note.updatedAt && note.updatedAt !== note.createdAt && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Updated:</span>
              <span className={styles.metaValue}>
                {formatDate(note.updatedAt)}
              </span>
            </div>
          )}
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Author:</span>
            <span className={styles.metaValue}>{user.username}</span>
          </div>
        </div>
      </header>

      {/* Теги */}
      {note.tags && note.tags.length > 0 && (
        <div className={styles.tagsSection}>
          <h3 className={styles.tagsTitle}>Tags:</h3>
          <div className={styles.tagsList}>
            {note.tags.map((tag) => (
              <Link
                key={tag}
                href={`/notes/filter/tag/${encodeURIComponent(tag)}`}
                className={styles.tag}
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Содержание заметки */}
      <main className={styles.noteContent}>
        <h2 className={styles.contentTitle}>Content:</h2>
        <div className={styles.contentBody}>
          {note.content.split("\n").map((paragraph, index) => (
            <p key={index} className={styles.paragraph}>
              {paragraph || "\u00A0"} {/* Non-breaking space for empty lines */}
            </p>
          ))}
        </div>
      </main>

      {/* Статистика заметки */}
      <footer className={styles.noteFooter}>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{note.content.length}</span>
            <span className={styles.statLabel}>Characters</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>
              {note.content.split(/\s+/).length}
            </span>
            <span className={styles.statLabel}>Words</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>
              {note.content.split("\n").length}
            </span>
            <span className={styles.statLabel}>Lines</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
