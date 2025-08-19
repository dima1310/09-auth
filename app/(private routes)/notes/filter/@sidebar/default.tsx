// app/(private-routes)/notes/filter/@sidebar/default.tsx

import Link from "next/link";
import { NoteTag } from "@/types/note";

const TAGS: (NoteTag | "All")[] = [
  "All",
  "Todo",
  "Work",
  "Personal",
  "Meeting",
  "Shopping",
];

export default function SidebarDefault() {
  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4">
      <h2 className="text-lg font-semibold mb-4">Filter by Tags</h2>

      <nav className="space-y-2">
        {TAGS.map((tag) => (
          <Link
            key={tag}
            href={
              tag === "All"
                ? "/notes"
                : `/notes/filter/tag?tag=${tag.toLowerCase()}`
            }
            className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          >
            {tag}
          </Link>
        ))}
      </nav>

      <div className="mt-8">
        <h3 className="text-sm font-medium text-gray-500 mb-3">
          Quick Actions
        </h3>
        <div className="space-y-2">
          <Link
            href="/notes/action/create"
            className="block w-full px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
          >
            New Note
          </Link>
          <Link
            href="/notes"
            className="block w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50"
          >
            All Notes
          </Link>
        </div>
      </div>
    </div>
  );
}
