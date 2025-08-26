import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { serverApiClient } from "../../../lib/api/serverApi";
import styles from "./ProfilePage.module.css";

export const metadata: Metadata = {
  title: "Profile - NoteHub",
  description: "View and manage your profile information on NoteHub",
  keywords: "profile, user, account, settings, NoteHub",
};

export default async function ProfilePage() {
  // Получаем данные пользователя через серверное API
  const user = await serverApiClient.users.getProfile();

  // Если пользователь не найден, перенаправляем на страницу входа
  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className={styles.profilePage}>
      <div className={styles.profileContainer}>
        <header className={styles.profileHeader}>
          <h1 className={styles.title}>My Profile</h1>
          <Link href="/profile/edit" className={styles.editLink}>
            Edit Profile
          </Link>
        </header>

        <div className={styles.profileContent}>
          <div className={styles.avatarSection}>
            <div className={styles.avatarContainer}>
              <Image
                src={user.avatar}
                alt={`${user.username}'s profile avatar`}
                width={120}
                height={120}
                className={styles.avatar}
                priority
              />
            </div>
            <h2 className={styles.username}>{user.username}</h2>
          </div>

          <div className={styles.userInfo}>
            <div className={styles.infoGroup}>
              <label className={styles.label}>Full Name</label>
              <div className={styles.value}>{user.username}</div>
            </div>

            <div className={styles.infoGroup}>
              <label className={styles.label}>Email Address</label>
              <div className={styles.value}>{user.email}</div>
            </div>

            <div className={styles.infoGroup}>
              <label className={styles.label}>User ID</label>
              <div className={styles.value}>{user.id}</div>
            </div>
          </div>

          <div className={styles.actions}>
            <Link href="/notes/filter" className={styles.actionButton}>
              View My Notes
            </Link>
            <Link href="/profile/edit" className={styles.actionButton}>
              Edit Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
