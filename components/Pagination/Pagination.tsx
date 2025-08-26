"use client";

import React from "react";
import styles from "./Pagination.module.css";

// Типы для пропсов компонента
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  maxVisiblePages?: number;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
  showFirstLast = true,
  showPrevNext = true,
  maxVisiblePages = 5,
}: PaginationProps) {
  // Если только одна страница, не показываем пагинацию
  if (totalPages <= 1) {
    return null;
  }

  // Вычисляем диапазон видимых страниц
  const getVisiblePages = (): number[] => {
    const delta = Math.floor(maxVisiblePages / 2);
    let start = Math.max(1, currentPage - delta);
    let end = Math.min(totalPages, currentPage + delta);

    // Корректируем диапазон если он меньше maxVisiblePages
    if (end - start + 1 < maxVisiblePages) {
      if (start === 1) {
        end = Math.min(totalPages, start + maxVisiblePages - 1);
      } else if (end === totalPages) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }
    }

    const pages: number[] = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const visiblePages = getVisiblePages();
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  // Обработчики навигации
  const handlePrevPage = () => {
    if (!isFirstPage) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (!isLastPage) {
      onPageChange(currentPage + 1);
    }
  };

  const handleFirstPage = () => {
    if (!isFirstPage) {
      onPageChange(1);
    }
  };

  const handleLastPage = () => {
    if (!isLastPage) {
      onPageChange(totalPages);
    }
  };

  const handlePageClick = (page: number) => {
    if (page !== currentPage) {
      onPageChange(page);
    }
  };

  return (
    <nav
      className={`${styles.pagination} ${className}`}
      aria-label="Pagination navigation"
    >
      <ul className={styles.paginationList}>
        {/* Кнопка "Первая страница" */}
        {showFirstLast && !isFirstPage && (
          <li className={styles.paginationItem}>
            <button
              onClick={handleFirstPage}
              className={styles.paginationButton}
              aria-label="Go to first page"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="11,17 6,12 11,7" />
                <polyline points="18,17 13,12 18,7" />
              </svg>
            </button>
          </li>
        )}

        {/* Кнопка "Предыдущая страница" */}
        {showPrevNext && (
          <li className={styles.paginationItem}>
            <button
              onClick={handlePrevPage}
              disabled={isFirstPage}
              className={`${styles.paginationButton} ${isFirstPage ? styles.disabled : ""}`}
              aria-label="Go to previous page"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="15,18 9,12 15,6" />
              </svg>
            </button>
          </li>
        )}

        {/* Многоточие в начале */}
        {visiblePages[0] > 1 && (
          <>
            <li className={styles.paginationItem}>
              <button
                onClick={() => handlePageClick(1)}
                className={styles.paginationButton}
                aria-label="Go to page 1"
              >
                1
              </button>
            </li>
            {visiblePages[0] > 2 && (
              <li className={styles.paginationItem}>
                <span className={styles.ellipsis}>...</span>
              </li>
            )}
          </>
        )}

        {/* Видимые номера страниц */}
        {visiblePages.map((page) => (
          <li key={page} className={styles.paginationItem}>
            <button
              onClick={() => handlePageClick(page)}
              className={`${styles.paginationButton} ${
                page === currentPage ? styles.active : ""
              }`}
              aria-label={`Go to page ${page}`}
              aria-current={page === currentPage ? "page" : undefined}
            >
              {page}
            </button>
          </li>
        ))}

        {/* Многоточие в конце */}
        {visiblePages[visiblePages.length - 1] < totalPages && (
          <>
            {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
              <li className={styles.paginationItem}>
                <span className={styles.ellipsis}>...</span>
              </li>
            )}
            <li className={styles.paginationItem}>
              <button
                onClick={() => handlePageClick(totalPages)}
                className={styles.paginationButton}
                aria-label={`Go to page ${totalPages}`}
              >
                {totalPages}
              </button>
            </li>
          </>
        )}

        {/* Кнопка "Следующая страница" */}
        {showPrevNext && (
          <li className={styles.paginationItem}>
            <button
              onClick={handleNextPage}
              disabled={isLastPage}
              className={`${styles.paginationButton} ${isLastPage ? styles.disabled : ""}`}
              aria-label="Go to next page"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="9,18 15,12 9,6" />
              </svg>
            </button>
          </li>
        )}

        {/* Кнопка "Последняя страница" */}
        {showFirstLast && !isLastPage && (
          <li className={styles.paginationItem}>
            <button
              onClick={handleLastPage}
              className={styles.paginationButton}
              aria-label="Go to last page"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="13,17 18,12 13,7" />
                <polyline points="6,17 11,12 6,7" />
              </svg>
            </button>
          </li>
        )}
      </ul>

      {/* Информация о текущей странице */}
      <div className={styles.pageInfo}>
        Page {currentPage} of {totalPages}
      </div>
    </nav>
  );
}
