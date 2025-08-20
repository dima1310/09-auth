// app/(private routes)/notes/filter/[...slug]/Notes.client.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import { getNotes } from "@/lib/api/clientApi";
import { Note } from "@/types/note";
import Pagination from "@/components/Pagination/Pagination";

interface NotesClientProps {
  initialNotes?: Note[];
  searchQuery?: string;
  tagFilter?: string;
}

export default function NotesClient({
  initialNotes = [],
  searchQuery = "",
  tagFilter = "",
}: NotesClientProps) {
  const [searchTerm, setSearchTerm] = useState(searchQuery);
  const [selectedTag, setSelectedTag] = useState(tagFilter);
  const [currentPage, setCurrentPage] = useState(1);
  const notesPerPage = 10;

  // Debounce search term to avoid too many API calls
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

  // Використовуємо useQuery з TanStack Query для отримання даних
  const { data, isLoading, isError } = useQuery({
    queryKey: ["notes", debouncedSearchTerm, selectedTag, currentPage],
    queryFn: async () => {
      const response = await getNotes({
        search: debouncedSearchTerm || undefined,
        tag: selectedTag || undefined,
        page: currentPage,
        limit: notesPerPage,
      });
      return response;
    },
    placeholderData: keepPreviousData, // Для безперервної пагінації
    staleTime: 5000,
  });

  const notes = data?.notes || initialNotes;
  const totalNotes = data?.total || initialNotes.length;
  const totalPages = Math.ceil(totalNotes / notesPerPage);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Скидаємо на першу сторінку при новому пошуку
  };

  const handleTagChange = (tag: string) => {
    setSelectedTag(tag);
    setCurrentPage(1); // Скидаємо на першу сторінку при зміні фільтра
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-6">
      {/* Header with Create Note Link */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">My Notes</h1>
        <Link
          href="/notes/action/create"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Create New Note
        </Link>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Search & Filter</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Search notes
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by title or content..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="tag-filter"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Filter by tag
            </label>
            <select
              id="tag-filter"
              value={selectedTag}
              onChange={(e) => handleTagChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All tags</option>
              <option value="Todo">Todo</option>
              <option value="Work">Work</option>
              <option value="Personal">Personal</option>
              <option value="Meeting">Meeting</option>
              <option value="Shopping">Shopping</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading notes...</p>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          Failed to load notes. Please try again later.
        </div>
      )}

      {/* Notes List */}
      {!isLoading && !isError && (
        <div className="space-y-4">
          {notes.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-gray-500 text-lg mt-4">No notes found</p>
              <p className="text-gray-400 mt-2">
                Try adjusting your search criteria or create a new note.
              </p>
              <Link
                href="/notes/action/create"
                className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Create Your First Note
              </Link>
            </div>
          ) : (
            <>
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <Link href={`/notes/${note.id}`} className="group">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {note.title}
                        </h3>
                      </Link>
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {note.content}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {note.tag && (
                            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                              {note.tag}
                            </span>
                          )}
                          <span className="text-sm text-gray-500">
                            {new Date(note.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/notes/action/edit/${note.id}`}
                            className="text-gray-400 hover:text-blue-600 transition-colors"
                            title="Edit note"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Pagination Component */}
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
