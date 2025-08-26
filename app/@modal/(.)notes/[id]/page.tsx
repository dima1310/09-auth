import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { serverApiClient } from "../../../../lib/api/serverApi";
import NotePreview from "./NotePreview.client";
import Modal from "../../../../components/Modal/Modal";
import Loader from "../../../../components/Loader/Loader";

// Типы для параметров страницы
interface ModalNotePageProps {
  params: Promise<{ id: string }>;
}

// Функция для генерации динамических метаданных
export async function generateMetadata({
  params,
}: ModalNotePageProps): Promise<Metadata> {
  try {
    // Асинхронно извлекаем id из params
    const resolvedParams = await params;
    const { id } = resolvedParams;

    // Получаем данные заметки для метаданных
    const note = await serverApiClient.notes.getById(id);

    if (!note) {
      return {
        title: "Note Preview - NoteHub",
        description: "Preview note in modal window.",
      };
    }

    // Обрезаем содержание для description
    const description =
      note.content.length > 120
        ? `${note.content.slice(0, 120)}...`
        : note.content;

    return {
      title: `Preview: ${note.title} - NoteHub`,
      description: `Preview of "${note.title}": ${description}`,
      keywords: `note, preview, modal, ${(note.tags || []).join(", ")}`,
      robots: "noindex", // Не индексируем модальные окна
    };
  } catch (error) {
    console.error("Error generating modal metadata:", error);
    return {
      title: "Note Preview - NoteHub",
      description: "Preview note in modal window.",
      robots: "noindex",
    };
  }
}

// Компонент загрузки для модального окна
function ModalLoadingFallback() {
  return (
    <Modal>
      <div className="modal-loading">
        <Loader />
        <p>Loading note preview...</p>
      </div>
    </Modal>
  );
}

export default async function ModalNotePage({ params }: ModalNotePageProps) {
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
      <Modal>
        {/* Используем Suspense для обработки состояния загрузки модального интерфейса */}
        <Suspense
          fallback={
            <div className="modal-loading">
              <Loader />
              <p>Loading note preview...</p>
            </div>
          }
        >
          {/* Клиентский компонент предварительного просмотра заметки */}
          <NotePreview noteId={id} initialNote={note} user={user} />
        </Suspense>
      </Modal>
    );
  } catch (error) {
    console.error("Error in ModalNotePage:", error);

    // В случае ошибки показываем модальное окно с ошибкой
    return (
      <Modal>
        <div className="modal-error">
          <h2>Error Loading Note</h2>
          <p>Something went wrong while loading the note preview.</p>
          <p>Please try again or view the full note page.</p>
        </div>
      </Modal>
    );
  }
}
