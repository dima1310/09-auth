// app/(private-routes)/notes/[id]/page.tsx
import type { Metadata } from "next";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import NoteDetailsClient from "./NoteDetails.client";
import { getNoteByIdServer } from "@/lib/api/serverApi"; // серверное API

// Полный интерфейс Note с необходимыми полями
interface Note {
  id: string;
  title?: string;
  content?: string;
  description?: string;
  excerpt?: string;
  tag?: string;
  createdAt?: string;
}

function createExcerpt(content: string, maxLength: number = 160): string {
  if (!content) return "Переглянути деталі нотатки";

  const plainText = content
    .replace(/[#*_`]/g, "")
    .replace(/<[^>]*>/g, "")
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (plainText.length <= maxLength) return plainText;

  const truncated = plainText.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  return lastSpace > 0
    ? truncated.substring(0, lastSpace) + "..."
    : truncated + "...";
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const { id } = params;

  try {
    const note: Note | null = await getNoteByIdServer(id);

    if (!note) {
      return {
        title: "Нотатку не знайдено - NoteHub",
        description:
          "Запитувана нотатка не існує або була видалена. Поверніться до списку нотаток.",
        openGraph: {
          title: "Нотатку не знайдено - NoteHub",
          description: "Запитувана нотатка не існує або була видалена.",
          url: `https://notehub.com/notes/${id}`,
          images: [
            {
              url: "https://ac.goit.global/fullstack/react/notehub-og-meta.jpg",
              width: 1200,
              height: 630,
              alt: "Нотатку не знайдено - NoteHub",
            },
          ],
        },
      };
    }

    const noteTitle = note.title || "Без назви";
    const description =
      note.excerpt ||
      createExcerpt(note.content || "") ||
      createExcerpt(note.description || "") ||
      "Переглянути деталі цієї нотатки в NoteHub";

    return {
      title: `${noteTitle} | NoteHub`,
      description,
      openGraph: {
        title: `${noteTitle} | NoteHub`,
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
  params: { id: string };
}) {
  const { id } = params;
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["note", id],
    queryFn: async () => {
      const note: Note | null = await getNoteByIdServer(id);
      return note;
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NoteDetailsClient noteId={id} />
    </HydrationBoundary>
  );
}
