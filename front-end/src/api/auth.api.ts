import type {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
} from "../types/auth.types";

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

export async function loginRequest(
  credentials: LoginCredentials
): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });

  const data: AuthResponse & { error?: string } = await res.json();

  if (!res.ok) {
    throw new Error(data.error ?? 'Login failed');
  }

  return data;
}

export async function registerRequest(credentials: RegisterCredentials): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/api/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  const data: AuthResponse & { error?: string } = await res.json();

  if (!res.ok) {
    throw new Error(data.error ?? 'Registration failed');
  }
  return data;
}

export const validateName = (name: string) => {
  if (name.trim().length < 2 || name.trim().length > 30) throw new Error("Name must be between 2 and 30 characters");
  if (!/^[A-Za-z0-9\-_]+( [A-Za-z0-9\-_]+)*$/.test(name)) {
  throw new Error("Name contains invalid characters");
}
  return null;
};
