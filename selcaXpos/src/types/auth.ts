export interface User {
  name: string;
  email: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}