/**
 * Auth API - Login & Signup
 */

import api from './client';

export interface User {
  id: string;
  email: string;
  fullName: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }),

  signup: (email: string, password: string, fullName: string) =>
    api.post<AuthResponse>('/auth/signup', { email, password, fullName }),
};
