"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { apiClient } from "../../../../../lib/api/clientApi";
import { Note } from "../../../../../types/note";
import { User } from "../../../../../types/user";
import NoteList from "../../../../../components/NoteList/NoteList";
import SearchBox from "../../../../../components/SearchBox/SearchBox";
import TagsMenu from "../../../../../components/TagsMenu/TagsMenu";
import Pagination from "../../../../../components/Pagination/Pagination";
import styles from "./NotesPage.module.css";

// Кастомный хук для дебаунса
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Типы для пропсов компонента
interface NotesClientProps {
  initialNotes: Note[];
  initialTotal: number;
  initialPage: number;
  initialLimit: number;
  filterParams: {
    type: string;
    value: string;
    search: string;
    page: number;
    limit: number;
  };
  user: User;
}

export default function NotesClient({
  initialNotes,
  initialTotal,
  initialPage,
  initialLimit,
  filterParams,
  user,
}: NotesClientProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Состояние для поиска, тегов и пагинации
  const [searchTerm, setSearchTerm] = useState<string>(
    filterParams.search || ""
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(
    filterParams.type === "tag" && filterParams.value
      ? [filterParams.value]
      : []
  );
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [limit] = useState<number>(initialLimit);

  // Дебаунс для поискового запроса
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Конструируем параметры для API запроса
  const queryParams = useMemo(
    () => ({
      page: currentPage,
      limit,
      search: debouncedSearchTerm || undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
    }),
    [currentPage, limit, debouncedSearchTerm, selectedTags]
  );

  // Конструируем ключ запроса для TanStack Query
  const queryKey = useMemo(
    () => [
      "notes",
      queryParams.page,
      queryParams.limit,
      queryParams.search,
      queryParams.tags?.join(","),
    ],
    [queryParams]
  );

  // TanStack Query для загрузки заметок
  const {
    data: notesData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey,
    queryFn: () => apiClient.notes.getAll(queryParams),
    placeholderData: (previousData) => {
      // Используем предыдущие данные для бесшовной пагинации
      if (previousData) {
        return previousData;
      }
      // Используем начальные данные только для первого запроса
      if (
        currentPage === initialPage &&
        !debouncedSearchTerm &&
        selectedTags.length === 0
      ) {
        return {
          notes: initialNotes,
          total: initialTotal,
          page: initialPage,
          limit: initialLimit,
        };
      }
      return undefined;
    },
    staleTime: 30000, // 30 секунд
    gcTime: 300000, // 5 минут
  });

  // Сброс страницы при изменении поиска или тегов
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [debouncedSearchTerm, selectedTags]);

  // Обработчик изменения поискового запроса
  const handleSearchChange = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
  };

  // Обработчик изменения выбранных тегов
  const handleTagsChange = (tags: string[]) => {
    setSelectedTags(tags);
  };

  // Обработчик изменения страницы
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Обработчик создания новой заметки
  const handleCreateNote = () => {
    router.push("/notes/action/create");
  };

  // Получаем данные для отображения
  const notes = notesData?.notes || [];
  const total = notesData?.total || 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className={styles.notesClient}>
      {/* Заголовок с действиями */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.welcomeSection}>
            <h2>Welcome back, {user.username}!</h2>
            <p>Manage and organize your notes</p>
          </div>
          <div className={styles.actions}>
            <Link href="/notes/action/create" className={styles.createButton}>
              + Create New Note
            </Link>
          </div>
        </div>
      </div>

      {/* Панель поиска и фильтров */}
      <div className={styles.controlsPanel}>
        <div className={styles.searchSection}>
          <SearchBox
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search notes..."
            className={styles.searchBox}
          />
        </div>
        <div className={styles.filtersSection}>
          <TagsMenu
            selectedTags={selectedTags}
            onTagsChange={handleTagsChange}
            className={styles.tagsMenu}
          />
        </div>
      </div>

      {/* Статистика и результаты */}
      <div className={styles.resultsInfo}>
        {isLoading ? (
          <p>Loading notes...</p>
        ) : (
          <p>
            {total > 0
              ? `Showing ${notes.length} of ${total} ${total === 1 ? "note" : "notes"}`
              : "No notes found"}
            {debouncedSearchTerm && ` for "${debouncedSearchTerm}"`}
            {selectedTags.length > 0 &&
              ` with tags: ${selectedTags.join(", ")}`}
          </p>
        )}
      </div>

      {/* Основной контент */}
      <div className={styles.content}>
        {isError ? (
          <div className={styles.errorState}>
            <h3>Failed to load notes</h3>
            <p>
              {error instanceof Error ? error.message : "An error occurred"}
            </p>
            <button
              onClick={() => window.location.reload()}
              className={styles.retryButton}
            >
              Try Again
            </button>
          </div>
        ) : notes.length === 0 && !isLoading ? (
          <div className={styles.emptyState}>
            <h3>No notes found</h3>
            {debouncedSearchTerm || selectedTags.length > 0 ? (
              <div>
                <p>Try adjusting your search or filters</p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedTags([]);
                  }}
                  className={styles.clearFiltersButton}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div>
                <p>Get started by creating your first note</p>
                <button
                  onClick={handleCreateNote}
                  className={styles.createFirstButton}
                >
                  Create Your First Note
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <NoteList
              notes={notes}
              isLoading={isLoading}
              className={styles.notesList}
            />

            {/* Пагинация */}
            {totalPages > 1 && (
              <div className={styles.paginationSection}>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  className={styles.pagination}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
