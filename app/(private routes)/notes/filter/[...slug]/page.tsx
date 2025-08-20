// app/(private routes)/notes/filter/[...slug]/page.tsx

import { Suspense } from "react";
import NotesClient from "./Notes.client";

interface FilterPageProps {
  params: Promise<{
    slug: string[];
  }>;
  searchParams: Promise<{
    search?: string;
    tag?: string;
  }>;
}

export default async function FilterPage({
  params,
  searchParams,
}: FilterPageProps) {
  const { slug } = await params;
  const { search, tag } = await searchParams;

  // Extract filter type from slug
  const filterType = slug?.[0] || "";
  const filterValue = slug?.[1] || "";

  // Determine search query and tag filter based on URL structure
  let searchQuery = search || "";
  let tagFilter = tag || "";

  // If filtering by tag via URL slug, use that as tag filter
  if (filterType === "tag" && filterValue) {
    tagFilter = filterValue;
  }

  // If filtering by search via URL slug, use that as search query
  if (filterType === "search" && filterValue) {
    searchQuery = decodeURIComponent(filterValue);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {filterType === "tag" && tagFilter
              ? `Notes tagged with "${tagFilter}"`
              : filterType === "search" && searchQuery
              ? `Search results for "${searchQuery}"`
              : "Filtered Notes"}
          </h1>
          <p className="text-gray-600">
            {searchQuery || tagFilter
              ? "Showing filtered results. Adjust filters to see different notes."
              : "Use the search and filter options to find specific notes."}
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
          }
        >
          <NotesClient searchQuery={searchQuery} tagFilter={tagFilter} />
        </Suspense>
      </div>
    </div>
  );
}

// Generate metadata for the page
export async function generateMetadata({
  params,
  searchParams,
}: FilterPageProps) {
  const { slug } = await params;
  const { search, tag } = await searchParams;

  const filterType = slug?.[0] || "";
  const filterValue = slug?.[1] || "";

  let title = "Filtered Notes | Notes App";

  if (filterType === "tag" && (filterValue || tag)) {
    const tagName = tag || filterValue;
    title = `Notes tagged "${tagName}" | Notes App`;
  } else if (filterType === "search" && (filterValue || search)) {
    const searchTerm = search || decodeURIComponent(filterValue);
    title = `Search "${searchTerm}" | Notes App`;
  }

  return {
    title,
    description: "View filtered and searched notes",
  };
}
