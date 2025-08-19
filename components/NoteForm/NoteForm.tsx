// components/NoteForm/NoteForm.tsx

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createNote } from "@/lib/api/clientApi";
import type { NoteTag } from "@/types/note";
import { useNoteStore } from "@/lib/store/noteStore";

interface CreateNotePayload {
  title: string;
  content: string;
  tag?: NoteTag;
}

interface NoteDraft {
  title: string;
  content: string;
  tag: NoteTag | "";
}

const NOTE_TAGS: NoteTag[] = [
  "Todo",
  "Work",
  "Personal",
  "Meeting",
  "Shopping",
];

export default function NoteForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { addNote } = useNoteStore();

  const [localDraft, setLocalDraft] = useState<NoteDraft>({
    title: "",
    content: "",
    tag: "",
  });

  const [error, setError] = useState<string | null>(null);

  const createNoteMutation = useMutation({
    mutationFn: createNote,
    onSuccess: (newNote) => {
      // Add to note store
      addNote(newNote);

      // Invalidate and refetch notes
      queryClient.invalidateQueries({ queryKey: ["notes"] });

      // Navigate to the new note
      router.push(`/notes/${newNote.id}`);

      // Reset form
      setLocalDraft({
        title: "",
        content: "",
        tag: "",
      });
      setError(null);
    },
    onError: (error) => {
      console.error("Failed to create note:", error);
      setError(
        error instanceof Error ? error.message : "Failed to create note"
      );
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setLocalDraft((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!localDraft.title.trim()) {
      setError("Title is required");
      return;
    }

    if (!localDraft.content.trim()) {
      setError("Content is required");
      return;
    }

    // Prepare note data
    const noteData: CreateNotePayload = {
      title: localDraft.title.trim(),
      content: localDraft.content.trim(),
      // Only include tag if it's not empty and is a valid NoteTag
      ...(localDraft.tag && NOTE_TAGS.includes(localDraft.tag as NoteTag)
        ? { tag: localDraft.tag as NoteTag }
        : {}),
    };

    createNoteMutation.mutate(noteData);
  };

  const handleCancel = () => {
    router.push("/notes");
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Create New Note
        </h2>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={localDraft.title}
              onChange={handleInputChange}
              required
              placeholder="Enter note title..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Tag */}
          <div>
            <label
              htmlFor="tag"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Tag
            </label>
            <select
              id="tag"
              name="tag"
              value={localDraft.tag}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a tag (optional)</option>
              {NOTE_TAGS.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>

          {/* Content */}
          <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Content *
            </label>
            <textarea
              id="content"
              name="content"
              value={localDraft.content}
              onChange={handleInputChange}
              required
              rows={10}
              placeholder="Write your note content here..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-vertical"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              disabled={createNoteMutation.isPending}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createNoteMutation.isPending}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createNoteMutation.isPending ? "Creating..." : "Create Note"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
