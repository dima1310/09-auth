// components/NoteList/NoteList.tsx

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Note, NoteTag } from "@/types/note";
import { useNoteActions } from "@/lib/store/noteStore";
import { deleteNote } from "@/lib/api/clientApi";

interface NoteListProps {
  notes: Note[];
  onSearch?: (query: string) => void;
  onTagFilter?: (tag: string) => void;
  onCreateNote?: (noteData: {
    title: string;
    content: string;
    tag?: NoteTag;
  }) => void;
}

interface SearchFilters {
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

export default function NoteList({
  notes,
  onSearch,
  onTagFilter,
  onCreateNote,
}: NoteListProps) {
  const { removeNote } = useNoteActions();
  const queryClient = useQueryClient();

  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    title: "",
    content: "",
    tag: "",
  });

  // Используем useMutation для удаления заметок
  const deleteNoteMutation = useMutation({
    mutationFn: deleteNote,
    onSuccess: (_, noteId) => {
      // Инвалидируем кэш после успешного удаления
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      // Удаляем из локального store
      removeNote(noteId);
    },
    onError: (error) => {
      console.error("Failed to delete note:", error);
      alert("Failed to delete note. Please try again.");
    },
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      const query = `${searchFilters.title} ${searchFilters.content}`.trim();
      onSearch(query);
    }
  };

  const handleTagFilter = (tag: NoteTag | "") => {
    setSearchFilters((prev) => ({ ...prev, tag }));
    if (onTagFilter) {
      onTagFilter(tag);
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (confirm("Are you sure you want to delete this note?")) {
      deleteNoteMutation.mutate(id);
    }
  };

  const handleCreateNote = () => {
    if (onCreateNote && searchFilters.title && searchFilters.content) {
      const noteData = {
        title: searchFilters.title,
        content: searchFilters.content,
        ...(searchFilters.tag &&
        NOTE_TAGS.includes(searchFilters.tag as NoteTag)
          ? { tag: searchFilters.tag as NoteTag }
          : {}),
      };

      onCreateNote(noteData);

      // Reset form
      setSearchFilters({
        title: "",
        content: "",
        tag: "",
      });
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setSearchFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Search & Filter</h2>

        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Search by title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={searchFilters.title}
                onChange={handleInputChange}
                placeholder="Enter title..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="content"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Search by content
              </label>
              <input
                type="text"
                id="content"
                name="content"
                value={searchFilters.content}
                onChange={handleInputChange}
                placeholder="Enter content..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <div>
              <label
                htmlFor="tag"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Filter by tag
              </label>
              <select
                id="tag"
                name="tag"
                value={searchFilters.tag}
                onChange={handleInputChange}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All tags</option>
                {NOTE_TAGS.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end space-x-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Search
              </button>

              {onCreateNote && searchFilters.title && searchFilters.content && (
                <button
                  type="button"
                  onClick={handleCreateNote}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Create Note
                </button>
              )}
            </div>
          </div>
        </form>

        {/* Tag Filter Buttons */}
        <div className="mt-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleTagFilter("")}
              className={`px-3 py-1 rounded-full text-sm ${
                searchFilters.tag === ""
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              All
            </button>
            {NOTE_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagFilter(tag)}
                className={`px-3 py-1 rounded-full text-sm ${
                  searchFilters.tag === tag
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notes List */}
      <div className="space-y-4">
        {notes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No notes found</p>
            <p className="text-gray-400 mt-2">
              Create your first note to get started!
            </p>
          </div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {/* Используем Link для навигации к детальной странице заметки */}
                  <Link href={`/notes/${note.id}`}>
                    <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
                      {note.title}
                    </h3>
                  </Link>

                  <p className="text-gray-600 mt-2 line-clamp-3">
                    {note.content}
                  </p>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-4">
                      {note.tag && (
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {note.tag}
                        </span>
                      )}

                      <span className="text-sm text-gray-500">
                        {new Date(note.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex space-x-2">
                      <Link
                        href={`/notes/${note.id}/edit`}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                      >
                        Edit
                      </Link>

                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        disabled={deleteNoteMutation.isPending}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deleteNoteMutation.isPending
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
