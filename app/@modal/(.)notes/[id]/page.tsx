// app/@modal/(.)notes/[id]/page.tsx

import { Suspense } from "react";
import NotePreviewClient from "./NotePreview.client";

interface ModalNotePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ModalNotePage({ params }: ModalNotePageProps) {
  const { id } = await params;

  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="text-center">Loading...</div>
          </div>
        </div>
      }
    >
      <NotePreviewClient noteId={id} />
    </Suspense>
  );
}

// Generate metadata for the modal
export async function generateMetadata({ params }: ModalNotePageProps) {
  const { id } = await params;

  return {
    title: `Note ${id} | Notes App`,
    description: "Note preview modal",
  };
}
