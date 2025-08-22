// app/(private routes)/profile/page.tsx

import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { checkSession } from "@/lib/api/serverApi";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "My Profile",
  description: "View and manage your user profile information",
};

// Server Action для logout винесена окремо
async function handleLogout() {
  "use server";

  // Видаляємо auth cookies
  const cookieStore = await cookies();
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");

  // Перенаправляємо на сторінку входу
  redirect("/sign-in");
}

export default async function ProfilePage() {
  // Отримуємо дані користувача через серверну функцію
  const sessionResponse = await checkSession();

  // Якщо користувач не авторизований, перенаправляємо на сторінку входу
  if (!sessionResponse) {
    redirect("/sign-in");
  }

  // Витягуємо користувача з відповіді
  const user = sessionResponse.data?.user;
  if (!user) {
    redirect("/sign-in");
  }
  // Використовуємо username з об'єкта User або витягуємо з email як fallback
  const username = user.username || user.email.split("@")[0];

  // Генеруємо URL для аватара або використовуємо існуючий
  const avatarUrl =
    user.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      username
    )}&size=80&background=3B82F6&color=fff&bold=true`;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 text-white p-6">
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="text-blue-100 mt-2">
              Manage your account information
            </p>
          </div>

          {/* Profile Content */}
          <div className="p-6">
            <div className="flex items-center space-x-6 mb-8">
              {/* Profile Avatar using Next.js Image component */}
              <div className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src={avatarUrl}
                  alt={`${username} avatar`}
                  width={80}
                  height={80}
                  className="object-cover"
                  priority
                />
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  {username}
                </h2>
                <p className="text-gray-600">{user.email}</p>
              </div>
            </div>

            {/* Account Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Account Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500 block">
                      Username:
                    </span>
                    <p className="text-gray-900">{username}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 block">
                      Email:
                    </span>
                    <p className="text-gray-900">{user.email}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Quick Stats
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500 block">
                      Account Status:
                    </span>
                    <p className="text-green-600 font-medium">Active</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 block">
                      Member Since:
                    </span>
                    <p className="text-gray-900">Recently joined</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 block">
                      Total Notes:
                    </span>
                    <p className="text-gray-900">0</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <Link
                href="/profile/edit"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 inline-block text-center"
              >
                Edit Profile
              </Link>

              <Link
                href="/notes"
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 inline-block text-center"
              >
                My Notes
              </Link>

              {/* Logout form with Server Action */}
              <form action={handleLogout} className="inline-block">
                <button
                  type="submit"
                  className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
                >
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
