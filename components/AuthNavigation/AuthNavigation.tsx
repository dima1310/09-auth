// components/AuthNavigation/AuthNavigation.tsx

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/store/authStore';

export default function AuthNavigation() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  console.log(isAuthenticated);

  const clearIsAuthenticated = useAuth((state) => state.logout);

  const handleLogout = async () => {
    await logout();
    clearIsAuthenticated();
    router.push('/sign-in');
  };

  if (!isAuthenticated) {
    return (
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-800">
                Notes App
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/sign-in"
                className="text-gray-600 hover:text-gray-800 px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/notes" className="text-xl font-bold text-gray-800">
              Notes App
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/notes"
              className="text-gray-600 hover:text-gray-800 px-3 py-2 rounded-md text-sm font-medium"
            >
              My Notes
            </Link>
            <Link
              href="/notes/create"
              className="text-gray-600 hover:text-gray-800 px-3 py-2 rounded-md text-sm font-medium"
            >
              Create Note
            </Link>
            <Link
              href="/profile"
              className="text-gray-600 hover:text-gray-800 px-3 py-2 rounded-md text-sm font-medium"
            >
              Profile
            </Link>

            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">{user?.email || ''}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
