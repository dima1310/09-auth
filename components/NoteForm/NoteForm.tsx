"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createNote } from "../../lib/api/clientApi";
import type { CreateNoteData } from "../../types/note";
import css from "./NoteForm.module.css";

interface NoteFormProps {
  onClose?: () => void;
  initialData?: {
    title?: string;
    content?: string;
    tag?: string;
  };
}

export default function NoteForm({ onClose, initialData }: NoteFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Видалено невикористану змінну user

  const [localDraft, setLocalDraft] = useState({
    title: initialData?.title || "",
    content: initialData?.content || "",
    tag: initialData?.tag || "Todo",
  });

  const handleTitleChange = (value: string) => {
    setLocalDraft((prev) => ({ ...prev, title: value }));
  };

  const handleContentChange = (value: string) => {
    setLocalDraft((prev) => ({ ...prev, content: value }));
  };

  const handleTagChange = (value: string) => {
    setLocalDraft((prev) => ({ ...prev, tag: value }));
  };

  const { mutate: createNoteMutation } = useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      setLocalDraft({
        title: "",
        content: "",
        tag: "Todo",
      });

      queryClient.invalidateQueries({
        queryKey: ["notes"],
        exact: false,
      });

      if (onClose) {
        onClose();
      } else {
        router.back();
      }
    },
    onError: (error) => {
      console.error("Error creating note:", error);
      setFormErrors({
        submit: "Failed to create note",
      });
      setIsSubmitting(false);
    },
  });

  const validateForm = (): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!localDraft.title || localDraft.title.trim().length < 3) {
      errors.title = "Title must be at least 3 characters";
    } else if (localDraft.title.trim().length > 50) {
      errors.title = "Title must be at most 50 characters";
    }

    if (!localDraft.tag) {
      errors.tag = "Tag is required";
    }

    if (localDraft.content && localDraft.content.length > 500) {
      errors.content = "Content must be at most 500 characters";
    }

    return errors;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormErrors({});

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setIsSubmitting(false);
      return;
    }

    try {
      const noteData: CreateNoteData = {
        title: localDraft.title.trim(),
        content: localDraft.content.trim(),
        tag: localDraft.tag,
      };

      createNoteMutation(noteData);
    } catch (error) {
      console.error("Error submitting form:", error);
      setFormErrors({ submit: "Failed to submit form" });
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    // Тимчасово збереження в localStorage
    localStorage.setItem("noteDraft", JSON.stringify(localDraft));

    const draftButton = document.querySelector(
      '[data-action="draft"]'
    ) as HTMLButtonElement;
    if (draftButton) {
      const originalText = draftButton.textContent;
      draftButton.textContent = "Saved!";
      draftButton.style.background = "#10b981";

      setTimeout(() => {
        draftButton.textContent = originalText;
        draftButton.style.background = "";
      }, 2000);
    }
  };

  const handleCancel = () => {
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  };

  // Завантаження draft з localStorage при монтуванні
  useEffect(() => {
    if (!initialData) {
      try {
        const savedDraft = localStorage.getItem("noteDraft");
        if (savedDraft) {
          const parsed = JSON.parse(savedDraft);
          setLocalDraft(parsed);
        }
      } catch (error) {
        console.error("Failed to load draft:", error);
      }
    }
  }, [initialData]);

  return (
    <div className={css.formContainer}>
      <form onSubmit={handleSubmit} className={css.form}>
        <div className={css.formGroup}>
          <label htmlFor="title">Title</label>
          <input
            id="title"
            name="title"
            type="text"
            value={localDraft.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className={css.input}
            placeholder="Enter note title..."
          />
          {formErrors.title && (
            <span className={css.error}>{formErrors.title}</span>
          )}
        </div>

        <div className={css.formGroup}>
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            name="content"
            rows={8}
            value={localDraft.content}
            onChange={(e) => handleContentChange(e.target.value)}
            className={css.textarea}
            placeholder="Write your note content here..."
          />
          {formErrors.content && (
            <span className={css.error}>{formErrors.content}</span>
          )}
        </div>

        <div className={css.formGroup}>
          <label htmlFor="tag">Tag</label>
          <select
            id="tag"
            name="tag"
            value={localDraft.tag}
            onChange={(e) => handleTagChange(e.target.value)}
            className={css.select}
          >
            <option value="Todo">Todo</option>
            <option value="Work">Work</option>
            <option value="Personal">Personal</option>
            <option value="Meeting">Meeting</option>
            <option value="Shopping">Shopping</option>
          </select>
          {formErrors.tag && (
            <span className={css.error}>{formErrors.tag}</span>
          )}
        </div>

        {formErrors.submit && (
          <div className={css.error}>{formErrors.submit}</div>
        )}

        <div className={css.actions}>
          <button
            type="button"
            className={css.cancelButton}
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>

          <button
            type="button"
            className={css.draftButton}
            onClick={handleSaveDraft}
            disabled={isSubmitting}
            data-action="draft"
          >
            Save Draft
          </button>

          <button
            type="submit"
            className={css.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create note"}
          </button>
        </div>
      </form>
    </div>
  );
}
