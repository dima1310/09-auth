// app/(auth-routes)/sign-in/page.tsx

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "../../../lib/api/clientApi";
import { useAuthStore } from "../../../lib/store/noteStore";
import type { LoginCredentials } from "../../../lib/store/noteStore";

export default function SignInPage() {
  const router = useRouter();
  const authStore = useAuthStore();

  const [formData, setFormData] = useState<LoginCredentials>({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await loginUser(formData);

      // Используем правильный метод в зависимости от того, что доступно
      if (typeof authStore.login === "function") {
        authStore.login(user);
      } else if (typeof authStore.setUser === "function") {
        authStore.setUser(user);
      }

      router.push("/profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "2rem auto", padding: "1rem" }}>
      <h1>Sign In</h1>

      {error && (
        <div
          style={{
            color: "red",
            marginBottom: "1rem",
            padding: "0.5rem",
            border: "1px solid red",
            borderRadius: "4px",
            backgroundColor: "#ffebee",
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <label
            htmlFor="email"
            style={{ display: "block", marginBottom: "0.5rem" }}
          >
            Email:
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label
            htmlFor="password"
            style={{ display: "block", marginBottom: "0.5rem" }}
          >
            Password:
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "0.75rem",
            backgroundColor: loading ? "#ccc" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "1rem",
          }}
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>
      </form>

      <p style={{ textAlign: "center", marginTop: "1rem" }}>
        Don&apos;t have an account?{" "}
        <a href="/sign-up" style={{ color: "#007bff", textDecoration: "none" }}>
          Sign Up
        </a>
      </p>
    </div>
  );
}
