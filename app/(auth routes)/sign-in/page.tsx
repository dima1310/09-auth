"use client";

import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiClient } from "../../../lib/api/clientApi";
import { useAuthStore } from "../../../lib/store/authStore";
import styles from "./SignInPage.module.css";

export default function SignInPage() {
  const router = useRouter();
  const { setUser, setLoading } = useAuthStore();

  // Состояние формы
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Состояние для ошибок и загрузки
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Обработчик изменения полей формы
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Очищаем ошибку при изменении полей
    if (error) {
      setError("");
    }
  };

  // Обработчик отправки формы
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Валидация полей
    if (!formData.email || !formData.password) {
      setError("Email and password are required");
      return;
    }

    try {
      setIsSubmitting(true);
      setLoading(true);
      setError("");

      // Аутентификация пользователя через API
      const response = await apiClient.auth.login({
        email: formData.email,
        password: formData.password,
      });

      // Сохраняем пользователя в глобальном состоянии
      setUser(response.user);

      // Перенаправляем на страницу профиля после успешной аутентификации
      router.push("/profile");
    } catch (err: unknown) {
      console.error("Login failed:", err);

      // Обработка ошибок
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Login failed. Please check your credentials and try again.");
      }
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  return (
    <div className={styles.signinPage}>
      <div className={styles.signinContainer}>
        <h1 className={styles.title}>Sign In</h1>
        <p className={styles.subtitle}>
          Welcome back! Please sign in to your account
        </p>

        <form onSubmit={handleSubmit} className={styles.signinForm}>
          {error && <div className={styles.errorMessage}>{error}</div>}

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={styles.submitButton}
          >
            {isSubmitting ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className={styles.signupLink}>
          <p>
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className={styles.link}>
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
