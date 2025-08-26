import Image from "next/image";
import Link from "next/link";
import css from "./ProfilePage.module.css";
import type { Metadata } from "next";
import { fetchUserServer } from "@/lib/api/serverApi";
import type { User } from "@/types/user";

export const metadata: Metadata = {
  title: "Profile Page - NoteHub",
  description: "View your profile information on NoteHub.",
};

export default async function ProfilePage() {
  const user: User | null = await fetchUserServer();

  if (!user) {
    return <p>User not found or not authenticated</p>;
  }

  return (
    <main className={css.mainContent}>
      <div className={css.profileCard}>
        <div className={css.header}>
          <h1 className={css.formTitle}>Profile Page</h1>
          <Link href="/profile/edit" className={css.editProfileButton}>
            Edit Profile
          </Link>
        </div>

        <div className={css.avatarWrapper}>
          <Image
            src={user.avatar ?? "/file.svg"} // используем существующий файл
            alt="User Avatar"
            width={120}
            height={120}
            className={css.avatar}
          />
        </div>

        <div className={css.profileInfo}>
          <p>Username: {user.username}</p>
          <p>Email: {user.email}</p>
        </div>
      </div>
    </main>
  );
}
