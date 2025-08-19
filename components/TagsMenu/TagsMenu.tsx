// components/TagsMenu/TagsMenu.tsx

import React, { useState } from "react";

// Локальний тип для тегів
type NoteTag = "Todo" | "Work" | "Personal" | "Meeting" | "Shopping";

const TAGS: (NoteTag | "All")[] = [
  "All",
  "Todo",
  "Work",
  "Personal",
  "Meeting",
  "Shopping",
];

interface TagsMenuProps {
  currentTag?: string;
  onTagSelect?: (tag: string) => void;
}

export default function TagsMenu({
  currentTag = "All",
  onTagSelect,
}: TagsMenuProps) {
  const [activeTag, setActiveTag] = useState<string>(currentTag);

  const handleTagClick = (tag: string) => {
    setActiveTag(tag);
    if (onTagSelect) {
      onTagSelect(tag === "All" ? "" : tag);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "0.5rem",
        flexWrap: "wrap",
        margin: "1rem 0",
      }}
    >
      {TAGS.map((tag) => (
        <button
          key={tag}
          onClick={() => handleTagClick(tag)}
          style={{
            padding: "0.5rem 1rem",
            border: "1px solid #ccc",
            borderRadius: "20px",
            backgroundColor: activeTag === tag ? "#007bff" : "white",
            color: activeTag === tag ? "white" : "#333",
            cursor: "pointer",
            fontSize: "0.9rem",
            transition: "all 0.2s",
          }}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
