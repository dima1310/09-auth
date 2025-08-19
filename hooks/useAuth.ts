// hooks/useAuth.ts

import React, {
  useState,
  useEffect,
  useContext,
  createContext,
  ReactNode,
} from "react";
import { apiClient, ApiError } from "@/lib/api/clientApi";
import {
  User,
  LoginCredentials,
  RegisterCredentials,
} from "@/lib/store/noteStore";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Перевіряємо сесію при завантаженні
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      setLoading(true);
      const sessionUser = await apiClient.checkSession();
      setUser(sessionUser);
    } catch (error) {
      console.error("Session check failed:", error);
      setUser(null);
      // Не выбрасываем ошибку для проверки сессии, просто логируем
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      const user = await apiClient.login(credentials);
      setUser(user);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw new Error(error instanceof Error ? error.message : "Login failed");
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      const user = await apiClient.register(credentials);
      setUser(user);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw new Error(
        error instanceof Error ? error.message : "Registration failed"
      );
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
      // Все одно очищаємо користувача локально
      setUser(null);
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      const updatedUser = await apiClient.updateUser(userData);
      setUser(updatedUser);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw new Error(
        error instanceof Error ? error.message : "User update failed"
      );
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
  };

  return React.createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Хук для перевірки авторизації
export function useRequireAuth() {
  const { user, loading } = useAuth();

  return {
    isAuthenticated: !!user,
    isLoading: loading,
    user,
  };
}
