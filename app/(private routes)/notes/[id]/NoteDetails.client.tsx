// app/(private-routes)/notes/[id]/NoteDetails.client.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNote, deleteNote } from "@/lib/api/clientApi";
import type { Note } from "@/types/note";

interface NoteDetailsClientProps {
  noteId: string;
}

export default function NoteDetailsClient({ noteId }: NoteDetailsClientProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  // Используем useQuery для получения данных заметки
  const {
    data: note,
    isLoading,
    error,
    isError,
  } = useQuery({
    queryKey: ["note", noteId],
    queryFn: () => getNote(noteId),
    enabled: !!noteId, // Запрос выполняется только если noteId существует
  });

  // Используем useMutation для удаления заметки
  const deleteNoteMutation = useMutation({
    mutationFn: deleteNote,
    onMutate: () => {
      setIsDeleting(true);
    },
    onSuccess: () => {
      // Инвалидируем кэш заметок после успешного удаления
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.removeQueries({ queryKey: ["note", noteId] });
      router.push("/notes");
    },
    onError: (error) => {
      console.error("Failed to delete note:", error);
      alert("Failed to delete note. Please try again.");
    },
    onSettled: () => {
      setIsDeleting(false);
    },
  });

  const handleDelete = async () => {
    if (!note || !confirm("Are you sure you want to delete this note?")) {
      return;
    }

    deleteNoteMutation.mutate(note.id);
  };

  const handleEdit = () => {
    if (note) {
      router.push(`/notes/${note.id}/edit`);
    }
  };

  const handleBack = () => {
    router.push("/notes");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isError || !note) {
    const errorMessage =
      error instanceof Error ? error.message : "Note not found";

    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">{errorMessage}</p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Notes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {note.title}
          </h1>
          <div className="text-sm text-gray-500">
            Created: {new Date(note.createdAt).toLocaleDateString()} at{" "}
            {new Date(note.createdAt).toLocaleTimeString()}
          </div>
          {note.updatedAt !== note.createdAt && (
            <div className="text-sm text-gray-500">
              Updated: {new Date(note.updatedAt).toLocaleDateString()} at{" "}
              {new Date(note.updatedAt).toLocaleTimeString()}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex space-x-2 ml-4">
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Back
          </button>
          <button
            onClick={handleEdit}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting || deleteNoteMutation.isPending}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
          >
            {isDeleting || deleteNoteMutation.isPending
              ? "Deleting..."
              : "Delete"}
          </button>
        </div>
      </div>

      {/* Tag */}
      {note.tag && (
        <div className="mb-6">
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
            {note.tag}
          </span>
        </div>
      )}

      {/* Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="prose max-w-none">
          <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
            {note.content}
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-6 text-sm text-gray-500 border-t pt-4">
        <div className="flex justify-between items-center">
          <div>Note ID: {note.id}</div>
          <div>Author: {note.userId}</div>
        </div>
      </div>
    </div>
  );
}
