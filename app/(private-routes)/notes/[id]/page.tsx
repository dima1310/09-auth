import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { serverApiClient } from "../../../../lib/api/serverApi";
import NoteDetails from "./NoteDetails.client";
import Loader from "../../../../components/Loader/Loader";

// Типы для параметров страницы
interface NoteDetailsPageProps {
  params: Promise<{ id: string }>;
}

// Функция для генерации динамических метаданных
export async function generateMetadata({
  params,
}: NoteDetailsPageProps): Promise<Metadata> {
  try {
    // Асинхронно извлекаем id из params
    const resolvedParams = await params;
    const { id } = resolvedParams;

    // Получаем данные заметки для метаданных
    const note = await serverApiClient.notes.getById(id);

    if (!note) {
      return {
        title: "Note Not Found - NoteHub",
        description: "The requested note could not be found.",
      };
    }

    // Обрезаем содержание для description
    const description =
      note.content.length > 160
        ? `${note.content.slice(0, 160)}...`
        : note.content;

    // Формируем keywords из тегов
    const keywords = ["note", "NoteHub", ...(note.tags || [])].join(", ");

    return {
      title: `${note.title} - NoteHub`,
      description,
      keywords,
      openGraph: {
        title: note.title,
        description,
        type: "article",
        publishedTime: note.createdAt,
        modifiedTime: note.updatedAt,
        tags: note.tags,
      },
      twitter: {
        card: "summary",
        title: note.title,
        description,
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Note Details - NoteHub",
      description: "View note details on NoteHub",
    };
  }
}

export default async function NoteDetailsPage({
  params,
}: NoteDetailsPageProps) {
  try {
    // Асинхронно извлекаем id из awaitable params
    const resolvedParams = await params;
    const { id } = resolvedParams;

    // Проверяем валидность ID
    if (!id || typeof id !== "string") {
      notFound();
    }

    // Проверяем аутентификацию пользователя на сервере
    const user = await serverApiClient.auth.getCurrentUser();
    if (!user) {
      redirect("/sign-in");
    }

    // Получаем данные заметки на сервере для первоначальной загрузки
    const note = await serverApiClient.notes.getById(id);

    // Если заметка не найдена, показываем 404
    if (!note) {
      notFound();
    }

    return (
      <div className="note-details-page">
        <div className="note-details-container">
          {/* Используем Suspense для обработки состояния загрузки */}
          <Suspense fallback={<Loader />}>
            {/* Клиентский компонент получает noteId как проп */}
            <NoteDetails noteId={id} initialNote={note} user={user} />
          </Suspense>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error in NoteDetailsPage:", error);

    // В случае ошибки перенаправляем на страницу заметок
    redirect("/notes/filter/all");
  }
}
