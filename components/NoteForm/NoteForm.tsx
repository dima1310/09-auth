"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiClient } from "../../lib/api/clientApi";
import { useNoteDraftStore } from "../../lib/store/noteStore";
import { Note } from "../../types/note";
import styles from "./NoteForm.module.css";

interface NoteFormProps {
  mode: "create" | "edit";
  existingNote?: Note;
  onCancel?: () => void;
  onSuccess?: (note: Note) => void;
}

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
  const { draft, saveDraft, clearDraft } = useNoteDraftStore();

  const [formData, setFormData] = useState<FormData>({
    title: "",
    content: "",
    tags: [],
  });
  const [tagInput, setTagInput] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (mode === "edit" && existingNote) {
      setFormData({
        title: existingNote.title,
        content: existingNote.content,
        tags: existingNote.tags || [],
      });
    } else if (mode === "create" && draft) {
      setFormData({
        title: draft.title || "",
        content: draft.content || "",
        tags: draft.tags || [],
      });
    }
  }, [mode, existingNote, draft]);

  useEffect(() => {
    if (mode === "create") {
      const timeoutId = setTimeout(() => saveDraft(formData), 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [formData, mode, saveDraft]);

  const createNoteMutation = useMutation<
    Note,
    unknown,
    { title: string; content: string; tags?: string[] }
  >({
    mutationFn: (data) => apiClient.notes.create(data),
    onSuccess: (newNote) => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      clearDraft();
      if (onSuccess) onSuccess(newNote);
      else router.push(`/notes/${newNote.id}`);
    },
    onError: (err: unknown) => {
      if (err instanceof Error) setError(err.message);
      else setError("Failed to create note. Please try again.");
    },
  });

  const updateNoteMutation = useMutation<
    Note,
    unknown,
    { title: string; content: string; tags?: string[] }
  >({
    mutationFn: (data) => {
      if (!existingNote) throw new Error("No note to update");
      return apiClient.notes.update(existingNote.id, data);
    },
    onSuccess: (updatedNote) => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      if (onSuccess) onSuccess(updatedNote);
      else router.push(`/notes/${updatedNote.id}`);
    },
    onError: (err: unknown) => {
      if (err instanceof Error) setError(err.message);
      else setError("Failed to update note. Please try again.");
    },
  });

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setTagInput(e.target.value);

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !formData.tags.includes(trimmed)) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, trimmed] }));
      setTagInput("");
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError("Title is required");
      return;
    }
    if (!formData.content.trim()) {
      setError("Content is required");
      return;
    }

    const noteData = {
      title: formData.title.trim(),
      content: formData.content.trim(),
      tags: formData.tags.length ? formData.tags : undefined,
    };

    if (mode === "create") {
      createNoteMutation.mutate(noteData);
    } else if (mode === "edit") {
      updateNoteMutation.mutate(noteData);
    }
  };

  const handleCancel = () => (onCancel ? onCancel() : router.back());

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

          <div className={styles.formGroup}>
            <label htmlFor="title" className={styles.label}>
              Title <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className={styles.input}
              placeholder="Enter note title..."
              disabled={isSubmitting}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="content" className={styles.label}>
              Content <span className={styles.required}>*</span>
            </label>
            <textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleChange("content", e.target.value)}
              className={styles.textarea}
              placeholder="Write your note content..."
              rows={10}
              disabled={isSubmitting}
              required
            />
          </div>

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
                onKeyDown={handleTagKeyDown}
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

        {mode === "create" && draft && (
          <div className={styles.draftIndicator}>
            <span>Draft saved automatically</span>
          </div>
        )}
      </div>
    </div>
  );
}
