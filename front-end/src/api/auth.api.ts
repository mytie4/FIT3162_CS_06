import type {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
} from "../types/auth.types";
import { API_BASE, fetchWithTimeout, parseJsonSafe } from "./config";

export async function loginRequest(
  credentials: LoginCredentials
): Promise<AuthResponse> {
  const res = await fetchWithTimeout(`${API_BASE}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });

  return parseJsonSafe<AuthResponse>(res, 'Login failed');
}

export async function registerRequest(credentials: RegisterCredentials): Promise<AuthResponse> {
  const res = await fetchWithTimeout(`${API_BASE}/api/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });

  return parseJsonSafe<AuthResponse>(res, 'Registration failed');
}

export const validateName = (name: string) => {
  if (name.trim().length < 2 || name.trim().length > 30) throw new Error("Name must be between 2 and 30 characters");
  if (!/^[A-Za-z0-9\-_]+( [A-Za-z0-9\-_]+)*$/.test(name.trim())) {
  throw new Error("Name contains invalid characters, or has more than one space between words.");
}
  return null;
};
