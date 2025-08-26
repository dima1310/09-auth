"use client";

import React, { useState } from "react";
import styles from "./TagsMenu.module.css";

// Типы для пропсов компонента
interface TagsMenuProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  className?: string;
  availableTags?: string[];
}

// Предустановленные теги
const DEFAULT_TAGS = [
  "work",
  "personal",
  "ideas",
  "todo",
  "important",
  "project",
  "meeting",
  "research",
  "notes",
  "learning",
];

export default function TagsMenu({
  selectedTags,
  onTagsChange,
  className = "",
  availableTags = DEFAULT_TAGS,
}: TagsMenuProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Обработчик переключения тега
  const handleTagToggle = (tag: string) => {
    const isSelected = selectedTags.includes(tag);
    let newTags: string[];

    if (isSelected) {
      // Убираем тег из выбранных
      newTags = selectedTags.filter((t) => t !== tag);
    } else {
      // Добавляем тег к выбранным
      newTags = [...selectedTags, tag];
    }

    onTagsChange(newTags);
  };

  // Обработчик очистки всех тегов
  const handleClearAll = () => {
    onTagsChange([]);
  };

  // Переключение открытого состояния меню
  const handleToggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`${styles.tagsMenu} ${className}`}>
      {/* Кнопка открытия меню */}
      <button
        type="button"
        onClick={handleToggleMenu}
        className={`${styles.menuButton} ${isOpen ? styles.active : ""}`}
        aria-label="Filter by tags"
        aria-expanded={isOpen}
      >
        <span className={styles.buttonText}>
          Tags {selectedTags.length > 0 && `(${selectedTags.length})`}
        </span>
        <svg
          className={`${styles.chevron} ${isOpen ? styles.rotated : ""}`}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6,9 12,15 18,9" />
        </svg>
      </button>

      {/* Выпадающее меню */}
      {isOpen && (
        <div className={styles.menuDropdown}>
          <div className={styles.menuHeader}>
            <span className={styles.menuTitle}>Filter by tags</span>
            {selectedTags.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className={styles.clearButton}
              >
                Clear all
              </button>
            )}
          </div>

          <div className={styles.tagsList}>
            {availableTags.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <label key={tag} className={styles.tagOption}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleTagToggle(tag)}
                    className={styles.tagCheckbox}
                  />
                  <span
                    className={`${styles.tagLabel} ${isSelected ? styles.selected : ""}`}
                  >
                    #{tag}
                  </span>
                </label>
              );
            })}
          </div>

          {selectedTags.length === 0 && (
            <div className={styles.emptyState}>
              <span>No tags selected</span>
            </div>
          )}
        </div>
      )}

      {/* Отображение выбранных тегов */}
      {selectedTags.length > 0 && (
        <div className={styles.selectedTags}>
          {selectedTags.map((tag) => (
            <span key={tag} className={styles.selectedTag}>
              #{tag}
              <button
                type="button"
                onClick={() => handleTagToggle(tag)}
                className={styles.removeTagButton}
                aria-label={`Remove ${tag} tag`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
