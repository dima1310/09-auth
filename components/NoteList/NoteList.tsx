"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Note } from "../../types/note";
import { apiClient } from "../../lib/api/clientApi";
import styles from "./NoteList.module.css";

// Типы для пропсов компонента
interface NoteListProps {
  notes: Note[];
  isLoading?: boolean;
  className?: string;
}

// Компонент для отдельной заметки
interface NoteItemProps {
  note: Note;
  onDeleteSuccess: () => void;
}

function NoteItem({ note, onDeleteSuccess }: NoteItemProps) {
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Мутация для удаления заметки
  const deleteNoteMutation = useMutation({
    mutationFn: () => apiClient.notes.delete(note.id),
    onSuccess: () => {
      // Инвалидируем кэш запросов заметок
      queryClient.invalidateQueries({ queryKey: ["notes"] });

      // Вызываем callback успешного удаления
      onDeleteSuccess();
    },
    onError: (error: unknown) => {
      console.error("Failed to delete note:", error);
      setIsDeleting(false);

      // Можно добавить toast уведомление об ошибке
      alert("Failed to delete note. Please try again.");
    },
  });

  // Обработчик удаления заметки
  const handleDelete = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (window.confirm(`Are you sure you want to delete "${note.title}"?`)) {
      setIsDeleting(true);
      deleteNoteMutation.mutate();
    }
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
    maxLength: number = 150
  ): string => {
    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength) + "...";
  };

  return (
    <div className={styles.noteItem}>
      <Link href={`/notes/${note.id}`} className={styles.noteLink}>
        <article className={styles.noteCard}>
          {/* Заголовок заметки */}
          <header className={styles.noteHeader}>
            <h3 className={styles.noteTitle}>{note.title}</h3>
            <div className={styles.noteMeta}>
              {note.createdAt && (
                <span className={styles.noteDate}>
                  {formatDate(note.createdAt)}
                </span>
              )}
            </div>
          </header>

          {/* Содержание заметки */}
          <div className={styles.noteContent}>
            <p className={styles.noteText}>{truncateContent(note.content)}</p>
          </div>

          {/* Теги */}
          {note.tags && note.tags.length > 0 && (
            <div className={styles.noteTags}>
              {note.tags.map((tag) => (
                <span key={tag} className={styles.tag}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Метаинформация */}
          <footer className={styles.noteFooter}>
            <div className={styles.noteStats}>
              <span className={styles.contentLength}>
                {note.content.length} characters
              </span>
              {note.updatedAt && note.updatedAt !== note.createdAt && (
                <span className={styles.updatedDate}>
                  Updated {formatDate(note.updatedAt)}
                </span>
              )}
            </div>
          </footer>
        </article>
      </Link>

      {/* Кнопка удаления */}
      <div className={styles.noteActions}>
        <button
          onClick={handleDelete}
          className={styles.deleteButton}
          disabled={isDeleting || deleteNoteMutation.isPending}
          aria-label={`Delete note "${note.title}"`}
          title="Delete note"
        >
          {isDeleting || deleteNoteMutation.isPending ? (
            <span className={styles.deleteSpinner}>⟳</span>
          ) : (
            <span className={styles.deleteIcon}>🗑️</span>
          )}
        </button>
      </div>
    </div>
  );
}

// Основной компонент списка заметок
export default function NoteList({
  notes,
  isLoading = false,
  className = "",
}: NoteListProps) {
  // Обработчик успешного удаления
  const handleDeleteSuccess = () => {
    // Можно добавить уведомление об успешном удалении
    console.log("Note deleted successfully");
  };

  // Состояние загрузки
  if (isLoading) {
    return (
      <div className={`${styles.noteList} ${className}`}>
        <div className={styles.loadingState}>
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className={styles.noteSkeleton}>
              <div className={styles.skeletonTitle}></div>
              <div className={styles.skeletonContent}></div>
              <div className={styles.skeletonTags}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Пустое состояние
  if (!notes || notes.length === 0) {
    return (
      <div className={`${styles.noteList} ${className}`}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📝</div>
          <h3 className={styles.emptyTitle}>No notes found</h3>
          <p className={styles.emptyText}>
            Your notes will appear here once you create them.
          </p>
        </div>
      </div>
    );
  }

  // Отображение списка заметок
  return (
    <div className={`${styles.noteList} ${className}`}>
      <div className={styles.notesGrid}>
        {notes.map((note) => (
          <NoteItem
            key={note.id}
            note={note}
            onDeleteSuccess={handleDeleteSuccess}
          />
        ))}
      </div>
    </div>
  );
}
