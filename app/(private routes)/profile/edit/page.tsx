// app/(private routes)/profile/edit/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/lib/store/authStore";
import { updateUser as updateUserAPI } from "@/lib/api/clientApi";

export default function EditProfilePage() {
  const { user, updateUser } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!user) {
      // Якщо користувач не авторизований, перенаправляємо на сторінку входу
      router.push("/sign-in");
      return;
    }

    setFormData({
      username: user.username || user.email.split("@")[0],
      email: user.email,
    });
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Перевірка на null
    if (!user) {
      setError("User not found. Please log in again.");
      return;
    }

    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      // Використовуємо функцію updateUser з clientApi
      // Передаємо оновлені дані з форми
      const updatedUser = await updateUserAPI({
        email: formData.email,
        username: formData.username,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
          formData.username
        )}&size=120&background=3B82F6&color=fff&bold=true`,
      });

      // Оновлюємо користувача в store
      updateUser(updatedUser);

      setSuccess("Profile updated successfully!");

      // Перенаправляємо на сторінку профіля через 2 секунди
      setTimeout(() => {
        router.push("/profile");
      }, 2000);
    } catch (err) {
      console.error("Failed to update profile:", err);
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/profile");
  };

  // Перевірка авторизації
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to edit your profile.</p>
        </div>
      </div>
    );
  }

  // Генеруємо URL для аватара на основі username
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    formData.username
  )}&size=120&background=3B82F6&color=fff&bold=true`;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 text-white p-6">
            <h1 className="text-2xl font-bold">Edit Profile</h1>
            <p className="text-blue-100 mt-1">
              Update your profile information
            </p>
          </div>

          <div className="p-6">
            {/* Avatar Section з Next.js Image компонентом - ОБОВ'ЯЗКОВО */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative w-32 h-32 rounded-full overflow-hidden mb-4">
                <Image
                  src={avatarUrl}
                  alt={`${formData.username} avatar`}
                  width={128}
                  height={128}
                  className="object-cover"
                  priority
                />
              </div>
              <p className="text-sm text-gray-600">
                Your avatar is generated based on your username
              </p>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter your username"
                  required
                  minLength={3}
                  maxLength={30}
                />
                <p className="mt-1 text-sm text-gray-500">
                  This will be your display name across the platform
                </p>
              </div>

              {/* Email поле - ОБОВ'ЯЗКОВО READ-ONLY */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
                  disabled
                  readOnly
                />
                <p className="mt-1 text-sm text-gray-500">
                  Email cannot be changed
                </p>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  disabled={isLoading || !formData.username.trim()}
                  className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {isLoading ? "Updating..." : "Update Profile"}
                </button>

                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
