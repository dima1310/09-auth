import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { serverApiClient } from "../../../../../lib/api/serverApi";
import Notes from "./Notes.client";

// Типы для параметров страницы
interface NotesFilterPageProps {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Функция для генерации динамических метаданных
export async function generateMetadata({
  params,
  searchParams,
}: NotesFilterPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  // Извлекаем параметры фильтра из URL
  const filterType = resolvedParams.slug[0] || "all";
  const filterValue = resolvedParams.slug[1] || "";

  // Создаем динамическое описание на основе фильтров
  let title = "My Notes - NoteHub";
  let description = "View and manage your notes";

  switch (filterType) {
    case "tag":
      title = `Notes tagged with "${filterValue}" - NoteHub`;
      description = `View all notes tagged with "${filterValue}"`;
      break;
    case "search":
      title = `Search results for "${filterValue}" - NoteHub`;
      description = `Search results for "${filterValue}" in your notes`;
      break;
    case "all":
    default:
      title = "All Notes - NoteHub";
      description = "View all your notes";
      break;
  }

  return {
    title,
    description,
    keywords: "notes, filter, search, tags, organization, NoteHub",
  };
}

export default async function NotesFilterPage({
  params,
  searchParams,
}: NotesFilterPageProps) {
  // Разрешаем промисы для получения параметров
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  // Проверяем аутентификацию пользователя
  const user = await serverApiClient.auth.getCurrentUser();
  if (!user) {
    redirect("/sign-in");
  }

  // Извлекаем параметры фильтра из catch-all сегмента
  const filterType = resolvedParams.slug[0] || "all";
  const filterValue = resolvedParams.slug[1] || "";

  // Извлекаем дополнительные параметры из query string
  const page =
    typeof resolvedSearchParams.page === "string"
      ? parseInt(resolvedSearchParams.page, 10)
      : 1;
  const limit =
    typeof resolvedSearchParams.limit === "string"
      ? parseInt(resolvedSearchParams.limit, 10)
      : 10;
  const search =
    typeof resolvedSearchParams.search === "string"
      ? resolvedSearchParams.search
      : "";

  // Подготавливаем параметры для API запроса
  const apiParams: {
    page: number;
    limit: number;
    search?: string;
    tags?: string[];
  } = {
    page,
    limit,
  };

  // Добавляем параметры фильтрации на основе типа фильтра
  switch (filterType) {
    case "search":
      if (filterValue) {
        apiParams.search = filterValue;
      }
      break;
    case "tag":
      if (filterValue) {
        apiParams.tags = [filterValue];
      }
      break;
    case "all":
    default:
      // Используем search из query parameters если есть
      if (search) {
        apiParams.search = search;
      }
      break;
  }

  // Получаем заметки с сервера на основе параметров фильтра
  const notesData = await serverApiClient.notes.getAll(apiParams);

  // Подготавливаем данные для отображения
  const filterParams = {
    type: filterType,
    value: filterValue,
    search,
    page,
    limit,
  };

  return (
    <div className="notes-filter-page">
      <div className="notes-container">
        {/* Заголовок страницы с информацией о текущем фильтре */}
        <header className="notes-header">
          <h1>
            {filterType === "tag" &&
              filterValue &&
              `Notes tagged with "${filterValue}"`}
            {filterType === "search" &&
              filterValue &&
              `Search results for "${filterValue}"`}
            {filterType === "all" && "All Notes"}
            {!filterType && "My Notes"}
          </h1>
          <p className="notes-count">
            {notesData.total > 0
              ? `Found ${notesData.total} ${notesData.total === 1 ? "note" : "notes"}`
              : "No notes found"}
          </p>
        </header>

        {/* Клиентский компонент для отображения заметок */}
        <Notes
          initialNotes={notesData.notes}
          initialTotal={notesData.total}
          initialPage={notesData.page}
          initialLimit={notesData.limit}
          filterParams={filterParams}
          user={user}
        />
      </div>
    </div>
  );
}
