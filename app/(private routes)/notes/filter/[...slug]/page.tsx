// app/(private-routes)/notes/filter/[...slug]/page.tsx

import { Suspense } from "react";
import NotesClient from "./Notes.client";

interface NotesFilterPageProps {
  params: Promise<{
    slug: string[];
  }>;
  searchParams: Promise<{
    search?: string;
    tag?: string;
    page?: string;
  }>;
}

export default async function NotesFilterPage({
  params,
  searchParams,
}: NotesFilterPageProps) {
  // Parse filter parameters
  const { slug } = await params;
  const { tag, search } = await searchParams;

  const filter = slug?.[0] || "";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {tag ? `Notes: ${tag}` : search ? `Search: ${search}` : "All Notes"}
          </h1>
          {filter && <p className="text-gray-600 mt-2">Filter: {filter}</p>}
        </div>

        <Suspense
          fallback={
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          }
        >
          <NotesClient filter={search || ""} tag={tag || ""} />
        </Suspense>
      </div>
    </div>
  );
}

// Generate metadata for the page
export async function generateMetadata({ searchParams }: NotesFilterPageProps) {
  const { tag, search } = await searchParams;

  let title = "Notes";
  if (tag) title = `${tag} Notes`;
  if (search) title = `Search: ${search}`;

  return {
    title: `${title} | Notes App`,
    description: "Browse and manage your notes",
  };
}
