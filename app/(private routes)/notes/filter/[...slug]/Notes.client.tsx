// app/(private-routes)/notes/filter/[...slug]/Notes.client.tsx

"use client";

import { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";
import { apiClient } from "@/lib/api/clientApi";
import { Note } from "@/lib/store/authStore";

interface NotesClientProps {
  initialNotes?: Note[];
  filter?: string;
  tag?: string;
}

export default function NotesClient({
  initialNotes = [],
  filter = "",
  tag = "",
}: NotesClientProps) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [searchQuery, setSearchQuery] = useState(filter);
  const [selectedTag, setSelectedTag] = useState(tag);
  const [loading, setLoading] = useState(false);

  // Debounce search query
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);

  // Load notes when filters change
  useEffect(() => {
    const loadNotes = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getNotes({
          search: debouncedSearchQuery || undefined,
          tag: selectedTag || undefined,
          limit: 20,
        });

        // Handle different response formats
        if (response && typeof response === "object" && "notes" in response) {
          setNotes(response.notes);
        } else if (Array.isArray(response)) {
          setNotes(response);
        } else {
          setNotes([]);
        }
      } catch (error) {
        console.error("Failed to load notes:", error);
        setNotes([]);
      } finally {
        setLoading(false);
      }
    };

    loadNotes();
  }, [debouncedSearchQuery, selectedTag]);

  return (
    <div className="notes-container">
      {/* Search and filter UI */}
      <div className="filters mb-6">
        <input
          type="text"
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 border rounded-md"
        />

        <select
          value={selectedTag}
          onChange={(e) => setSelectedTag(e.target.value)}
          className="mt-2 p-2 border rounded-md"
        >
          <option value="">All Tags</option>
          <option value="work">Work</option>
          <option value="personal">Personal</option>
          <option value="todo">Todo</option>
          <option value="meeting">Meeting</option>
        </select>
      </div>

      {/* Notes list */}
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : notes.length === 0 ? (
        <div className="text-center py-8">No notes found</div>
      ) : (
        <div className="grid gap-4">
          {notes.map((note) => (
            <div key={note.id} className="p-4 border rounded-md">
              <h3 className="font-semibold">{note.title}</h3>
              <p className="text-gray-600 mt-2">{note.content}</p>
              {note.tag && (
                <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                  {note.tag}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
