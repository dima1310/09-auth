import type { Metadata } from "next";
import {
  HydrationBoundary,
  dehydrate,
  QueryClient,
} from "@tanstack/react-query";
import { fetchNoteById } from "@/lib/api";
import NoteDetailsClient from "./NoteDetails.client";

// Типізація для нотатки (адаптуйте під вашу API структуру)
interface Note {
  id: string;
  title?: string;
  content?: string;
  description?: string;
  excerpt?: string;
  // Додайте інші поля згідно з вашою API структурою
}

// Функція для створення короткого опису з контенту нотатки
function createExcerpt(content: string, maxLength: number = 160): string {
  if (!content) return "Переглянути деталі нотатки";

  // Видаляємо Markdown розмітку та HTML теги
  const plainText = content
    .replace(/[#*_`]/g, "") // Видаляємо Markdown символи
    .replace(/<[^>]*>/g, "") // Видаляємо HTML теги
    .replace(/\n/g, " ") // Замінюємо переноси рядків на пробіли
    .replace(/\s+/g, " ") // Об'єднуємо множинні пробіли
    .trim();

  if (plainText.length <= maxLength) {
    return plainText;
  }

  const truncated = plainText.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");

  return lastSpace > 0
    ? truncated.substring(0, lastSpace) + "..."
    : truncated + "...";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  try {
    // Отримуємо дані нотатки
    const note = (await fetchNoteById(id)) as Note | null;

    if (!note) {
      // Якщо нотатка не знайдена
      return {
        title: "нотатку не знайдено - NoteHub",
        description:
          "Запитувана нотатка не існує або була видалена. Поверніться до списку нотаток для пошуку потрібної інформації.",
        openGraph: {
          title: "нотатку не знайдено - NoteHub",
          description: "Запитувана нотатка не існує або була видалена.",
          url: `https://notehub.com/notes/${id}`,
          images: [
            {
              url: "https://ac.goit.global/fullstack/react/notehub-og-meta.jpg",
              width: 1200,
              height: 630,
              alt: "нотатку не знайдено - NoteHub",
            },
          ],
        },
      };
    }

    // Безпечне отримання заголовка
    const noteTitle = note.title || "Без назви";

    // Формуємо title та description на основі даних нотатки
    const title = `${noteTitle} | NoteHub`;

    // Пріоритет: excerpt -> content -> description -> fallback
    const description =
      note.excerpt ||
      createExcerpt(note.content || "") ||
      createExcerpt(note.description || "") ||
      "Переглянути деталі цієї нотатки в NoteHub";

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `https://notehub.com/notes/${id}`,
        images: [
          {
            url: "https://ac.goit.global/fullstack/react/notehub-og-meta.jpg",
            width: 1200,
            height: 630,
            alt: noteTitle,
          },
        ],
      },
    };
  } catch (error) {
    // Обробка помилок при отриманні нотатки
    console.error("Error fetching note for metadata:", error);

    return {
      title: "Помилка завантаження нотатки - NoteHub",
      description:
        "Сталася помилка при завантаженні нотатки. Спробуйте пізніше або поверніться до списку нотаток.",
      openGraph: {
        title: "Помилка завантаження нотатки - NoteHub",
        description: "Сталася помилка при завантаженні нотатки.",
        url: `https://notehub.com/notes/${id}`,
        images: [
          {
            url: "https://ac.goit.global/fullstack/react/notehub-og-meta.jpg",
            width: 1200,
            height: 630,
            alt: "Помилка завантаження - NoteHub",
          },
        ],
      },
    };
  }
}

export default async function NoteDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["note", id],
    queryFn: () => fetchNoteById(id),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NoteDetailsClient noteId={id} />
    </HydrationBoundary>
  );
}
