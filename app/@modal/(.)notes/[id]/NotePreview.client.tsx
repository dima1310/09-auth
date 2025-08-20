// app/@modal/(.)notes/[id]/NotePreview.client.tsx

"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getNote } from "@/lib/api/clientApi";
import type { Note } from "@/types/note";

interface NotePreviewProps {
  noteId: string;
}

export default function NotePreviewClient({ noteId }: NotePreviewProps) {
  const router = useRouter();

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

  const handleClose = () => {
    router.back();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (isLoading) {
    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={handleBackdropClick}
      >
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (isError || !note) {
    const errorMessage =
      error instanceof Error ? error.message : "Note not found";

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={handleBackdropClick}
      >
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
          <div className="text-center text-red-600">{errorMessage}</div>
          <button
            onClick={handleClose}
            className="mt-4 w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-2xl font-bold">{note.title}</h1>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="mb-4">
          <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
        </div>

        {/* Tag */}
        {note.tag && (
          <div className="mb-4">
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
              {note.tag}
            </span>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-500">
            Created: {new Date(note.createdAt).toLocaleDateString()}
          </div>
          <div className="space-x-2">
            <button
              onClick={() => router.push(`/notes/${note.id}/edit`)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Edit
            </button>
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
