"use client";

import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiClient } from "../../../lib/api/clientApi";
import { useAuthStore } from "../../../lib/store/authStore";
import styles from "./SignUpPage.module.css";

export default function SignUpPage() {
  const router = useRouter();
  const { setUser, setLoading } = useAuthStore();

  // Состояние формы
  const [formData, setFormData] = useState({
    name: "",
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
    if (!formData.name || !formData.email || !formData.password) {
      setError("All fields are required");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    try {
      setIsSubmitting(true);
      setLoading(true);
      setError("");

      // Регистрация пользователя через API
      const response = await apiClient.auth.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      // Сохраняем пользователя в глобальном состоянии
      setUser(response.user);

      // Перенаправляем на страницу профиля после успешной регистрации
      router.push("/profile");
    } catch (err: unknown) {
      console.error("Registration failed:", err);

      // Обработка ошибок
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  return (
    <div className={styles.signupPage}>
      <div className={styles.signupContainer}>
        <h1 className={styles.title}>Sign Up</h1>
        <p className={styles.subtitle}>Create your account to get started</p>

        <form onSubmit={handleSubmit} className={styles.signupForm}>
          {error && <div className={styles.errorMessage}>{error}</div>}

          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="Enter your full name"
              required
            />
          </div>

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
              placeholder="Create a password"
              minLength={6}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={styles.submitButton}
          >
            {isSubmitting ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <div className={styles.loginLink}>
          <p>
            Already have an account?{" "}
            <Link href="/sign-in" className={styles.link}>
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
