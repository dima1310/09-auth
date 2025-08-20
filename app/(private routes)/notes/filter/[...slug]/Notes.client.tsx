// app/(private routes)/notes/filter/[...slug]/Notes.client.tsx

"use client";

import { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";
import { getNotes } from "@/lib/api/clientApi";
import { Note } from "@/types/note";

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
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [searchTerm, setSearchTerm] = useState(searchQuery);
  const [selectedTag, setSelectedTag] = useState(tagFilter);
  const [loading, setLoading] = useState(false);

  // Debounce search term to avoid too many API calls
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

  useEffect(() => {
    if (debouncedSearchTerm !== searchQuery || selectedTag !== tagFilter) {
      searchNotes();
    }
  }, [debouncedSearchTerm, selectedTag]);

  const searchNotes = async () => {
    try {
      setLoading(true);

      // Используем функцию getNotes с параметрами поиска
      const response = await getNotes({
        search: debouncedSearchTerm || undefined,
        tag: selectedTag || undefined,
      });

      setNotes(response.notes || []);
    } catch (error) {
      console.error("Failed to search notes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleTagChange = (tag: string) => {
    setSelectedTag(tag);
  };

  return (
    <div className="space-y-6">
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
      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Searching...</p>
        </div>
      )}

      {/* Notes List */}
      <div className="space-y-4">
        {notes.length === 0 && !loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No notes found</p>
            <p className="text-gray-400 mt-2">
              Try adjusting your search criteria or create a new note.
            </p>
          </div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {note.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {note.content}
                  </p>

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
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
