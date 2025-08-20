// components/Header/Header.tsx

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/store/authStore";

function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      logout();
      router.push("/sign-in");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/notes" className="text-xl font-bold text-gray-800">
            Notes App
          </Link>

          <nav className="flex items-center space-x-4">
            <Link
              href="/notes"
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              My Notes
            </Link>
            <Link
              href="/notes/create"
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              Create Note
            </Link>

            <div className="flex items-center space-x-2 ml-4">
              {user && (
                <span className="text-sm text-gray-600">{user.email}</span>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;
export { Header };
