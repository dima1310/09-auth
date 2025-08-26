import { create } from "zustand";
import { User } from "../../types/user";

// Интерфейс состояния аутентификации
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Интерфейс действий для управления состоянием
interface AuthActions {
  setUser: (user: User) => void;
  updateUser: (userData: Partial<User>) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
  setAuthenticated: (authenticated: boolean) => void;
}

// Комбинированный тип для магазина
type AuthStore = AuthState & AuthActions;

// Начальное состояние
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
};

// Создание магазина Zustand с правильным паттерном типизации
export const useAuthStore = create<AuthStore>()((set, get) => ({
  // Начальное состояние
  ...initialState,

  // Действие для установки пользователя и состояния аутентификации
  setUser: (user: User) =>
    set({
      user,
      isAuthenticated: true,
      isLoading: false,
    }),

  // Действие для обновления данных пользователя
  updateUser: (userData: Partial<User>) => {
    const currentUser = get().user;
    if (currentUser) {
      set({
        user: { ...currentUser, ...userData },
      });
    }
  },

  // Действие для очистки пользователя и сброса аутентификации
  clearUser: () =>
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    }),

  // Действие для управления состоянием загрузки
  setLoading: (loading: boolean) =>
    set({
      isLoading: loading,
    }),

  // Действие для явного управления состоянием аутентификации
  setAuthenticated: (authenticated: boolean) =>
    set({
      isAuthenticated: authenticated,
    }),
}));

// Селекторы для удобного доступа к отдельным частям состояния
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () =>
  useAuthStore((state) => state.isAuthenticated);
export const useIsLoading = () => useAuthStore((state) => state.isLoading);

// Действия без подписки на состояние
export const useAuthActions = () =>
  useAuthStore((state) => ({
    setUser: state.setUser,
    updateUser: state.updateUser,
    clearUser: state.clearUser,
    setLoading: state.setLoading,
    setAuthenticated: state.setAuthenticated,
  }));

export default useAuthStore;
