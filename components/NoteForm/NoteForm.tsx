"use client";

import React, { useState, useEffect, FormEvent, KeyboardEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiClient } from "../../lib/api/clientApi";
import { useNoteDraftStore } from "../../lib/store/noteStore";
import { Note } from "../../types/note";
import styles from "./NoteForm.module.css";

// Типы для пропсов компонента
interface NoteFormProps {
  mode: "create" | "edit";
  existingNote?: Note;
  onCancel?: () => void;
  onSuccess?: (note: Note) => void;
}

// Типы для данных формы
interface FormData {
  title: string;
  content: string;
  tags: string[];
}

export default function NoteForm({
  mode = "create",
  existingNote,
  onCancel,
  onSuccess,
}: NoteFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Глобальное состояние черновика
  const { draft, updateDraft, clearDraft, saveDraft } = useNoteDraftStore();

  // Локальное состояние формы
  const [formData, setFormData] = useState<FormData>({
    title: "",
    content: "",
    tags: [],
  });

  const [tagInput, setTagInput] = useState<string>("");
  const [error, setError] = useState<string>("");

  // Инициализация формы
  useEffect(() => {
    if (mode === "edit" && existingNote) {
      // Режим редактирования - используем существующую заметку
      setFormData({
        title: existingNote.title,
        content: existingNote.content,
        tags: existingNote.tags || [],
      });
    } else if (mode === "create" && draft) {
      // Режим создания - восстанавливаем черновик
      setFormData({
        title: draft.title || "",
        content: draft.content || "",
        tags: draft.tags || [],
      });
    }
  }, [mode, existingNote, draft]);

  // Автосохранение черновика при изменении (только для режима создания)
  useEffect(() => {
    if (mode === "create") {
      const timeoutId = setTimeout(() => {
        saveDraft(formData);
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [formData, mode, saveDraft]);

  // Мутация для создания заметки
  const createNoteMutation = useMutation({
    mutationFn: (data: { title: string; content: string; tags?: string[] }) =>
      apiClient.notes.create(data),
    onSuccess: (newNote) => {
      // Инвалидируем кэш заметок
      queryClient.invalidateQueries({ queryKey: ["notes"] });

      // Очищаем черновик после успешного создания
      clearDraft();

      // Вызываем callback успеха
      if (onSuccess) {
        onSuccess(newNote);
      } else {
        router.push(`/notes/${newNote.id}`);
      }
    },
    onError: (err: unknown) => {
      console.error("Failed to create note:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to create note. Please try again.");
      }
    },
  });

  // Мутация для обновления заметки
  const updateNoteMutation = useMutation({
    mutationFn: (data: { title: string; content: string; tags?: string[] }) =>
      apiClient.notes.update(existingNote!.id, data),
    onSuccess: (updatedNote) => {
      // Инвалидируем кэш заметок
      queryClient.invalidateQueries({ queryKey: ["notes"] });

      // Вызываем callback успеха
      if (onSuccess) {
        onSuccess(updatedNote);
      } else {
        router.push(`/notes/${updatedNote.id}`);
      }
    },
    onError: (err: unknown) => {
      console.error("Failed to update note:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to update note. Please try again.");
      }
    },
  });

  // Обработчики изменения полей формы
  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setFormData((prev) => ({ ...prev, title: value }));
    setError("");
  };

  const handleContentChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const { value } = event.target;
    setFormData((prev) => ({ ...prev, content: value }));
    setError("");
  };

  const handleTagInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(event.target.value);
  };

  // Обработчик добавления тега
  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, trimmedTag],
      }));
      setTagInput("");
    }
  };

  // Обработчик нажатия Enter в поле тега
  const handleTagKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAddTag();
    }
  };

  // Обработчик удаления тега
  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  // Обработчик отправки формы
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Валидация
    if (!formData.title.trim()) {
      setError("Title is required");
      return;
    }

    if (!formData.content.trim()) {
      setError("Content is required");
      return;
    }

    // Подготавливаем данные для отправки
    const noteData = {
      title: formData.title.trim(),
      content: formData.content.trim(),
      tags: formData.tags.length > 0 ? formData.tags : undefined,
    };

    // Отправляем в зависимости от режима
    if (mode === "create") {
      createNoteMutation.mutate(noteData);
    } else if (mode === "edit") {
      updateNoteMutation.mutate(noteData);
    }
  };

  // Обработчик отмены
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  const isSubmitting =
    createNoteMutation.isPending || updateNoteMutation.isPending;

  return (
    <div className={styles.noteForm}>
      <div className={styles.formContainer}>
        <h1 className={styles.title}>
          {mode === "create" ? "Create New Note" : "Edit Note"}
        </h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.errorMessage}>{error}</div>}

          {/* Поле заголовка */}
          <div className={styles.formGroup}>
            <label htmlFor="title" className={styles.label}>
              Title <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleTitleChange}
              className={styles.input}
              placeholder="Enter note title..."
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Поле содержания */}
          <div className={styles.formGroup}>
            <label htmlFor="content" className={styles.label}>
              Content <span className={styles.required}>*</span>
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleContentChange}
              className={styles.textarea}
              placeholder="Write your note content..."
              rows={10}
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Секция тегов */}
          <div className={styles.formGroup}>
            <label htmlFor="tags" className={styles.label}>
              Tags
            </label>
            <div className={styles.tagInputContainer}>
              <input
                type="text"
                id="tags"
                value={tagInput}
                onChange={handleTagInputChange}
                onKeyPress={handleTagKeyPress}
                className={styles.tagInput}
                placeholder="Add a tag and press Enter..."
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={handleAddTag}
                className={styles.addTagButton}
                disabled={isSubmitting || !tagInput.trim()}
              >
                Add
              </button>
            </div>

            {/* Отображение тегов */}
            {formData.tags.length > 0 && (
              <div className={styles.tagsContainer}>
                {formData.tags.map((tag) => (
                  <span key={tag} className={styles.tag}>
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className={styles.removeTagButton}
                      disabled={isSubmitting}
                      aria-label={`Remove tag ${tag}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Кнопки действий */}
          <div className={styles.actions}>
            <button
              type="button"
              onClick={handleCancel}
              className={styles.cancelButton}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? mode === "create"
                  ? "Creating..."
                  : "Saving..."
                : mode === "create"
                  ? "Create Note"
                  : "Save Changes"}
            </button>
          </div>
        </form>

        {/* Индикатор автосохранения черновика */}
        {mode === "create" && draft && (
          <div className={styles.draftIndicator}>
            <span>Draft saved automatically</span>
          </div>
        )}
      </div>
    </div>
  );
}
