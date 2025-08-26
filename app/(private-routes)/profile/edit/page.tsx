// app/(private-routes)/profile/edit/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { useEffect, useState } from "react";
import { updateUserProfile } from "@/lib/api/clientApi"; // исправлено
import Image from "next/image";
import css from "./EditProfilePage.module.css";

export default function EditProfilePage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setUsername(user.username);
    } else {
      router.push("/sign-in");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      // заменяем updateMe на updateUserProfile
      const updatedUser = await updateUserProfile({ username });
      if (updatedUser) setUser(updatedUser);
      router.push("/profile");
    } catch (err) {
      setError("Failed to update profile. Please try again.");
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (!user) return null;

  return (
    <main className={css.mainContent}>
      <div className={css.profileCard}>
        <h1 className={css.formTitle}>Edit Profile</h1>

        <Image
          src={user.avatar ?? "/file.svg"} // используем существующий файл
          alt="User Avatar"
          width={120}
          height={120}
          className={css.avatar}
        />

        <form className={css.profileInfo} onSubmit={handleSubmit}>
          <div className={css.usernameWrapper}>
            <label htmlFor="username">Username:</label>
            <input
              id="username"
              type="text"
              className={css.input}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <p>Email: {user.email}</p>

          <div className={css.actions}>
            <button
              type="button"
              className={css.cancelButton}
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button type="submit" className={css.saveButton}>
              Save
            </button>
          </div>
        </form>

        {error && <p className={css.error}>{error}</p>}
      </div>
    </main>
  );
}
