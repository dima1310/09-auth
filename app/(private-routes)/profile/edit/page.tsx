"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuthStore } from "../../../../lib/store/authStore";
import { apiClient } from "../../../../lib/api/clientApi";
import styles from "./EditProfilePage.module.css";

export default function EditProfilePage() {
  const router = useRouter();
  const { user, setUser, updateUser } = useAuthStore();

  // Состояние формы
  const [formData, setFormData] = useState({
    username: "",
    email: "",
  });

  // Состояние для ошибок и загрузки
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");

  // Инициализация формы данными пользователя
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
      });
    }
  }, [user]);

  // Обработчик изменения поля имени пользователя
  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setFormData((prev) => ({
      ...prev,
      username: value,
    }));

    // Очищаем сообщения при изменении полей
    if (error) setError("");
    if (successMessage) setSuccessMessage("");
  };

  // Обработчик отправки формы
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) {
      setError("User not found");
      return;
    }

    // Валидация
    if (!formData.username.trim()) {
      setError("Username is required");
      return;
    }

    // Проверяем, есть ли изменения
    if (formData.username === user.username) {
      setSuccessMessage("No changes to save");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      setSuccessMessage("");

      // Обновляем профиль пользователя через API
      const updatedUser = await apiClient.users.updateProfile({
        name: formData.username,
      });

      // Обновляем глобальное состояние аутентификации
      updateUser(updatedUser);

      setSuccessMessage("Profile updated successfully!");

      // Перенаправляем на страницу профиля через 2 секунды
      setTimeout(() => {
        router.push("/profile");
      }, 2000);
    } catch (err: unknown) {
      console.error("Profile update failed:", err);

      // Обработка ошибок
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to update profile. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Обработчик кнопки отмены
  const handleCancel = () => {
    router.push("/profile");
  };

  // Если пользователь не загружен
  if (!user) {
    return (
      <div className={styles.loading}>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className={styles.editProfilePage}>
      <div className={styles.editContainer}>
        <h1 className={styles.title}>Edit Profile</h1>

        <form onSubmit={handleSubmit} className={styles.editForm}>
          {/* Отображение аватара */}
          <div className={styles.avatarSection}>
            <div className={styles.avatarContainer}>
              <Image
                src={user.avatar}
                alt={`${user.username}'s avatar`}
                width={100}
                height={100}
                className={styles.avatar}
              />
            </div>
            <p className={styles.avatarNote}>Avatar cannot be changed</p>
          </div>

          {/* Сообщения об ошибках и успехе */}
          {error && <div className={styles.errorMessage}>{error}</div>}

          {successMessage && (
            <div className={styles.successMessage}>{successMessage}</div>
          )}

          {/* Поле имени пользователя (редактируемое) */}
          <div className={styles.formGroup}>
            <label htmlFor="username" className={styles.label}>
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleUsernameChange}
              className={styles.input}
              placeholder="Enter your username"
              required
            />
          </div>

          {/* Поле email (только для чтения) */}
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              className={`${styles.input} ${styles.readOnly}`}
              readOnly
              disabled
            />
            <p className={styles.fieldNote}>Email address cannot be changed</p>
          </div>

          {/* Кнопки действий */}
          <div className={styles.actions}>
            <button
              type="button"
              onClick={handleCancel}
              className={styles.cancelButton}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={styles.saveButton}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
