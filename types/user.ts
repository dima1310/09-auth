// types/user.ts

export interface User {
  id: string;
  email: string;
  username?: string;
  name?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
}

export interface UpdateUserData {
  username?: string;
  name?: string;
  email?: string;
}
