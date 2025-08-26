import type { Metadata } from "next";
import NotesClient from "./Notes.client";

interface FilterPageProps {
  params: { slug: string[] };
}

export default function FilterPage({ params }: FilterPageProps) {
  const tag = params.slug?.[0] || "All";

  // fetchNotesClient вызывается только внутри NotesClient (клиент)
  return <NotesClient tag={tag} />;
}

export async function generateMetadata({
  params,
}: FilterPageProps): Promise<Metadata> {
  const tag = params.slug?.[0] || "All";

  const title =
    tag === "All"
      ? "Всі нотатки - NoteHub"
      : `Нотаток з тегом "${tag}" - NoteHub`;

  const description =
    tag === "All"
      ? "Переглядайте всі ваші нотатки в одному місці. Знайдіть потрібні нотатки швидко та ефективно."
      : `Переглядайте всі нотатки з тегом "${tag}". Організовані нотатки для швидкого пошуку по темі.`;

  const url = `https://notehub.com/notes/filter/${params.slug.join("/")}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      images: [
        {
          url: "https://ac.goit.global/fullstack/react/notehub-og-meta.jpg",
          width: 1200,
          height: 630,
          alt:
            tag === "All"
              ? "Всі нотатки - NoteHub"
              : `Нотаток з тегом ${tag} - NoteHub`,
        },
      ],
    },
  };
}
