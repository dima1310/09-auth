"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import { fetchNotesClient, FetchNotesResponse } from "@/lib/api/clientApi";
import NoteList from "@/components/NoteList/NoteList";
import Pagination from "@/components/Pagination/Pagination";
import SearchBox from "@/components/SearchBox/SearchBox";
import css from "./NotesPage.module.css";

interface NotesClientProps {
  tag: string;
}

export default function NotesClient({ tag }: NotesClientProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);

  const { data, isLoading, error, isFetching } = useQuery<FetchNotesResponse>({
    queryKey: ["notes", page, debouncedSearch, tag],
    queryFn: () =>
      fetchNotesClient({
        page,
        search: debouncedSearch,
        tag: tag === "All" ? undefined : tag,
      }),
    staleTime: 1000 * 60 * 5, // данные свежие 5 минут
  });

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handlePageChange = ({ selected }: { selected: number }) => {
    setPage(selected + 1);
  };

  return (
    <div className={css.app}>
      <header className={css.toolbar}>
        <SearchBox value={search} onChange={handleSearchChange} />
        <Link href="/notes/action/create" className={css.button}>
          Create note +
        </Link>
      </header>

      {isLoading && <p>Loading...</p>}

      {error && (
        <div className={css.error}>
          {error instanceof Error ? error.message : "Something went wrong"}
        </div>
      )}

      {data && data.notes.length > 0 ? (
        <>
          <NoteList notes={data.notes} />
          {data.totalPages > 1 && (
            <Pagination
              pageCount={data.totalPages}
              onPageChange={handlePageChange}
              currentPage={page - 1}
            />
          )}
        </>
      ) : (
        !isLoading && <div className={css.noNotes}>No notes found</div>
      )}

      {isFetching && !isLoading && <p>Updating...</p>}
    </div>
  );
}
