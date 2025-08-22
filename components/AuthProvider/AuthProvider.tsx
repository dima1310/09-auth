// components/AuthProvider/AuthProvider.tsx

'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/store/authStore';
import { checkSession, getMe } from '@/lib/api/clientApi';

interface AuthProviderProps {
  children: React.ReactNode;
}

function AuthProvider({ children }: AuthProviderProps) {
  const { setUser } = useAuth();

  const clearIsAuthenticated = useAuth((state) => state.logout);

  useEffect(() => {
    console.log('AuthProvider');

    const fetchUser = async () => {
      const isAuthenticated = await checkSession();
      if (isAuthenticated) {
        const user = await getMe();
        if (user) setUser(user);
      } else {
        clearIsAuthenticated();
      }
    };
    fetchUser();
  }, [setUser, clearIsAuthenticated]);

  return <>{children}</>;
}

export default AuthProvider;
