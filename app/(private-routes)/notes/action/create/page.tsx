"use client";

import React from "react";
import { useRouter } from "next/navigation";
import NoteForm from "../../../../../components/NoteForm/NoteForm";
import { Note } from "../../../../../types/note";
import styles from "./page.module.css";

export default function CreateNotePage() {
  const router = useRouter();

  // Обработчик отмены создания заметки
  const handleCancel = () => {
    router.push("/notes/filter/all");
  };

  // Обработчик успешного создания заметки
  const handleSuccess = (note: Note) => {
    router.push(`/notes/${note.id}`);
  };

  return (
    <main className={styles.createNotePage}>
      <div className={styles.container}>
        <NoteForm
          mode="create"
          onCancel={handleCancel}
          onSuccess={handleSuccess}
        />
      </div>
    </main>
  );
}
