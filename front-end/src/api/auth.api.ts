import type {
  LoginCredentials,
  LoginResponse,
  RegisterCredentials,
  RegisterResponse
} from "../types/auth.types";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

export async function loginRequest(
  credentials: LoginCredentials
): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials)
  });

  const data: LoginResponse & { error?: string } = await res.json();

  if (!res.ok) {
    throw new Error(data.error ?? "Login failed");
  }

  return data;
}

export async function registerRequest(
  credentials: RegisterCredentials
): Promise<RegisterResponse> {
  const res = await fetch(`${API_BASE}/api/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials)
  });
  const data: RegisterResponse & { error?: string } = await res.json();

  if (!res.ok) {
    throw new Error(data.error ?? "Registration failed");
  }

  return data;
}
