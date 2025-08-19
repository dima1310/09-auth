// app/(private-routes)/notes/page.tsx

"use client";

import React, { useState, useEffect } from "react";
import { getNotes, createNote, deleteNote } from "../../../lib/api/clientApi";
import { useAuthStore } from "../../../lib/store/authStore";
import type { Note } from "../../../lib/store/authStore";

// Компоненты (предполагаем, что они существуют)
// import NotesList from "../../../components/NotesList/NotesList";
// import CreateNoteForm from "../../../components/CreateNoteForm/CreateNoteForm";

export default function NotesPage() {
  const authStore = useAuthStore();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Загрузка заметок
  const loadNotes = async (page = 1, search = "", tag = "") => {
    try {
      setLoading(true);
      const response = await getNotes({
        page,
        limit: 10,
        ...(search && { search }),
        ...(tag && { tag }),
      });

      // Проверяем, что response содержит notes
      if (response && typeof response === "object" && "notes" in response) {
        setNotes(response.notes);
        setTotalPages(Math.ceil(response.total / 10));
      } else if (Array.isArray(response)) {
        // Если API возвращает просто массив
        setNotes(response);
      } else {
        setNotes([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notes");
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  // Загружаем заметки при монтировании
  useEffect(() => {
    loadNotes(currentPage, searchQuery, selectedTag);
  }, [currentPage, searchQuery, selectedTag]);

  // Поиск
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  // Фильтр по тегам
  const handleTagFilter = (tag: string) => {
    setSelectedTag(tag);
    setCurrentPage(1);
  };

  // Создание заметки
  const handleCreateNote = async (noteData: {
    title: string;
    content: string;
    tag?: string;
  }) => {
    try {
      const newNote = await createNote(noteData);
      // Добавляем новую заметку в начало списка
      setNotes((prev) => [newNote, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create note");
    }
  };

  // Удаление заметки
  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteNote(noteId);
      setNotes((prev) => prev.filter((note) => note.id !== noteId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete note");
    }
  };

  // Пагинация
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (!authStore.user) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <h1>Please log in to view your notes</h1>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "1rem" }}>
      <h1>My Notes</h1>

      {error && (
        <div
          style={{
            color: "red",
            padding: "1rem",
            marginBottom: "1rem",
            border: "1px solid red",
            borderRadius: "4px",
            backgroundColor: "#ffebee",
          }}
        >
          {error}
        </div>
      )}

      {/* Форма создания заметки */}
      <div
        style={{
          marginBottom: "2rem",
          padding: "1rem",
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      >
        <h2>Create New Note</h2>
        <CreateNoteForm onSubmit={handleCreateNote} />
      </div>

      {/* Поиск и фильтры */}
      <div
        style={{
          marginBottom: "1rem",
          display: "flex",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <input
          type="text"
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          style={{
            padding: "0.5rem",
            border: "1px solid #ccc",
            borderRadius: "4px",
            minWidth: "200px",
          }}
        />

        <select
          value={selectedTag}
          onChange={(e) => handleTagFilter(e.target.value)}
          style={{
            padding: "0.5rem",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        >
          <option value="">All Tags</option>
          <option value="work">Work</option>
          <option value="personal">Personal</option>
          <option value="todo">Todo</option>
          <option value="meeting">Meeting</option>
          <option value="shopping">Shopping</option>
        </select>
      </div>

      {/* Список заметок */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          Loading notes...
        </div>
      ) : notes.length === 0 ? (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p>No notes found. Create your first note!</p>
        </div>
      ) : (
        <div>
          <NotesList notes={notes} onDelete={handleDeleteNote} />

          {/* Пагинация */}
          {totalPages > 1 && (
            <div style={{ marginTop: "2rem", textAlign: "center" }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    style={{
                      margin: "0 0.25rem",
                      padding: "0.5rem 1rem",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      backgroundColor:
                        currentPage === page ? "#007bff" : "white",
                      color: currentPage === page ? "white" : "#333",
                      cursor: "pointer",
                    }}
                  >
                    {page}
                  </button>
                )
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Простой компонент для создания заметки (если его нет)
function CreateNoteForm({
  onSubmit,
}: {
  onSubmit: (data: { title: string; content: string; tag: string }) => void;
}) {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    tag: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim() && formData.content.trim()) {
      onSubmit(formData);
      setFormData({ title: "", content: "", tag: "" });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Note title..."
          value={formData.title}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, title: e.target.value }))
          }
          style={{
            width: "100%",
            padding: "0.5rem",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <textarea
          placeholder="Note content..."
          value={formData.content}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, content: e.target.value }))
          }
          rows={4}
          style={{
            width: "100%",
            padding: "0.5rem",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />
      </div>

      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <select
          value={formData.tag}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, tag: e.target.value }))
          }
          style={{
            padding: "0.5rem",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        >
          <option value="">No tag</option>
          <option value="work">Work</option>
          <option value="personal">Personal</option>
          <option value="todo">Todo</option>
          <option value="meeting">Meeting</option>
          <option value="shopping">Shopping</option>
        </select>

        <button
          type="submit"
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Create Note
        </button>
      </div>
    </form>
  );
}

// Простой компонент списка заметок (если его нет)
function NotesList({
  notes,
  onDelete,
}: {
  notes: Note[];
  onDelete: (id: string) => void;
}) {
  return (
    <div>
      {notes.map((note) => (
        <div
          key={note.id}
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "1rem",
            marginBottom: "1rem",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: "0 0 0.5rem 0" }}>{note.title}</h3>
              <p style={{ margin: "0 0 0.5rem 0", color: "#666" }}>
                {note.content}
              </p>
              {note.tag && (
                <span
                  style={{
                    display: "inline-block",
                    padding: "0.25rem 0.5rem",
                    backgroundColor: "#e9ecef",
                    borderRadius: "12px",
                    fontSize: "0.8rem",
                  }}
                >
                  {note.tag}
                </span>
              )}
            </div>
            <button
              onClick={() => onDelete(note.id)}
              style={{
                marginLeft: "1rem",
                padding: "0.25rem 0.5rem",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
