"use client";

import { useState } from "react";
import { Note, CreateNoteData, NotesQuery } from "../../types/note";
import css from "./NoteList.module.css";

interface NotesListProps {
  notes: Note[];
  onSearch: (search: string) => void;
  onTagFilter: (tag: string) => void;
  onCreateNote: (noteData: CreateNoteData) => Promise<void>;
  onDeleteNote: (id: string) => Promise<void>;
  isCreating: boolean;
  currentQuery: NotesQuery;
}

export default function NotesList({
  notes,
  onSearch,
  onTagFilter,
  onCreateNote,
  onDeleteNote,
  isCreating,
  currentQuery,
}: NotesListProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchValue, setSearchValue] = useState(currentQuery.search || "");
  const [tagValue, setTagValue] = useState(currentQuery.tag || "");
  const [newNote, setNewNote] = useState<CreateNoteData>({
    title: "",
    content: "",
    tag: "",
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchValue);
  };

  const handleTagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onTagFilter(tagValue);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onCreateNote(newNote);
      setNewNote({ title: "", content: "", tag: "" });
      setShowCreateForm(false);
    } catch (error) {
      console.error("Failed to create note:", error);
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (confirm("Are you sure you want to delete this note?")) {
      await onDeleteNote(id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className={css.notesContainer}>
      {/* Search and Filter */}
      <div className={css.controls}>
        <form onSubmit={handleSearchSubmit} className={css.searchForm}>
          <input
            type="text"
            placeholder="Search notes..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className={css.searchInput}
          />
          <button type="submit" className={css.searchButton}>
            Search
          </button>
        </form>

        <form onSubmit={handleTagSubmit} className={css.filterForm}>
          <input
            type="text"
            placeholder="Filter by tag..."
            value={tagValue}
            onChange={(e) => setTagValue(e.target.value)}
            className={css.filterInput}
          />
          <button type="submit" className={css.filterButton}>
            Filter
          </button>
        </form>

        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className={css.createButton}
        >
          {showCreateForm ? "Cancel" : "Create Note"}
        </button>
      </div>

      {/* Create Note Form */}
      {showCreateForm && (
        <form onSubmit={handleCreateSubmit} className={css.createForm}>
          <h3>Create New Note</h3>
          <input
            type="text"
            placeholder="Title"
            value={newNote.title}
            onChange={(e) =>
              setNewNote((prev) => ({ ...prev, title: e.target.value }))
            }
            className={css.input}
            required
          />
          <textarea
            placeholder="Content"
            value={newNote.content}
            onChange={(e) =>
              setNewNote((prev) => ({ ...prev, content: e.target.value }))
            }
            className={css.textarea}
            rows={4}
            required
          />
          <input
            type="text"
            placeholder="Tag"
            value={newNote.tag}
            onChange={(e) =>
              setNewNote((prev) => ({ ...prev, tag: e.target.value }))
            }
            className={css.input}
            required
          />
          <button
            type="submit"
            className={css.submitButton}
            disabled={isCreating}
          >
            {isCreating ? "Creating..." : "Create Note"}
          </button>
        </form>
      )}

      {/* Notes List */}
      {notes.length === 0 ? (
        <div className={css.empty}>
          <p>No notes found</p>
          {(currentQuery.search || currentQuery.tag) && (
            <p>Try adjusting your search or filter criteria.</p>
          )}
        </div>
      ) : (
        <div className={css.notesList}>
          {(Array.isArray(notes) ? notes : []).map((note) => (
            <div key={note.id} className={css.noteCard}>
              <div className={css.noteHeader}>
                <h3 className={css.noteTitle}>{note.title}</h3>
                <button
                  onClick={() => handleDeleteNote(note.id)}
                  className={css.deleteButton}
                  title="Delete note"
                >
                  ✕
                </button>
              </div>
              <p className={css.noteContent}>{note.content}</p>
              <div className={css.noteFooter}>
                <span className={css.noteTag}>{note.tag}</span>
                <span className={css.noteDate}>
                  {formatDate(note.createdAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
