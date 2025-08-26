"use client";

import React, { useState, useRef, useEffect } from "react";
import styles from "./SearchBox.module.css";

// Типы для пропсов компонента
interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

export default function SearchBox({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
  disabled = false,
  autoFocus = false,
}: SearchBoxProps) {
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Обработчик изменения значения
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  // Обработчик фокуса
  const handleFocus = () => {
    setIsFocused(true);
  };

  // Обработчик потери фокуса
  const handleBlur = () => {
    setIsFocused(false);
  };

  // Обработчик очистки поиска
  const handleClear = () => {
    onChange("");
    inputRef.current?.focus();
  };

  // Автофокус при необходимости
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  return (
    <div
      className={`${styles.searchBox} ${className} ${isFocused ? styles.focused : ""}`}
    >
      <div className={styles.searchIcon}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </div>

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={styles.searchInput}
        aria-label={placeholder}
      />

      {value && (
        <button
          type="button"
          onClick={handleClear}
          className={styles.clearButton}
          aria-label="Clear search"
          disabled={disabled}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
}
