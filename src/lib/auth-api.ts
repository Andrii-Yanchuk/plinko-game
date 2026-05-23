import type {
  AuthPayload,
  AuthResponse,
} from "@/entities/user/model/types";

export { getCurrentUser } from "@/entities/user/api/userApi";

async function requestAuth(path: string, payload: AuthPayload) {
  const response = await fetch(path, {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    const message =
      error?.message ?? error?.error ?? "Authentication request failed";

    throw new Error(Array.isArray(message) ? message.join(", ") : message);
  }

  return response.json() as Promise<AuthResponse>;
}

export function login(payload: AuthPayload) {
  return requestAuth("/api/auth/login", payload);
}

export function register(payload: AuthPayload) {
  return requestAuth("/api/auth/register", payload);
}

export async function refreshAuth() {
  const response = await fetch("/api/auth/refresh", {
    method: "POST",
    credentials: "same-origin",
  });

  if (!response.ok) {
    throw new Error("Unable to refresh auth session");
  }

  return response.json() as Promise<AuthResponse>;
}

export async function logout() {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "same-origin",
  });

  if (!response.ok) {
    throw new Error("Unable to sign out");
  }
}
