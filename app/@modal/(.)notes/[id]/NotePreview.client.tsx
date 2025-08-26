"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getNoteById } from "@/lib/api/clientApi";
import Modal from "@/components/Modal/Modal";
import css from "./NotePreview.module.css";

interface NotePreviewModalProps {
  noteId: string;
}

export default function NotePreviewModal({ noteId }: NotePreviewModalProps) {
  const router = useRouter();

  const {
    data: note,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["note", noteId],
    queryFn: () => getNoteById(noteId),
    enabled: !!noteId,
    refetchOnMount: false,
  });

  const handleClose = () => {
    router.back();
  };

  if (!noteId) return null;

  return (
    <Modal onClose={handleClose}>
      <div className={css.container}>
        {isLoading && <p>Loading note...</p>}

        {error && (
          <div className={css.error}>
            <p>Could not load note details.</p>
          </div>
        )}

        {note && (
          <div className={css.noteContent}>
            <div className={css.header}>
              <h2 className={css.title}>{note.title}</h2>
              {note.tag && <span className={css.tag}>{note.tag}</span>}
            </div>
            <p className={css.content}>{note.content}</p>
            <p className={css.date}>
              Created: {new Date(note.createdAt).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
