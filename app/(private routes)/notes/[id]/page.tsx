// app/(private-routes)/notes/[id]/page.tsx

import { Suspense } from "react";
import NoteDetailsClient from "./NoteDetails.client";

interface NotePageProps {
  params: {
    id: string;
  };
}

export default function NotePage({ params }: NotePageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
          }
        >
          <NoteDetailsClient noteId={params.id} />
        </Suspense>
      </div>
    </div>
  );
}

// Generate metadata for the page
export async function generateMetadata({ params }: NotePageProps) {
  return {
    title: `Note ${params.id} | Notes App`,
    description: "View and manage your note",
  };
}
