import type { CurrentUser } from "@/entities/user/model/types";

export async function getCurrentUser() {
  const response = await fetch("/api/users/me", {
    method: "GET",
    credentials: "same-origin",
  });

  if (!response.ok) {
    throw new Error("Unable to load user profile");
  }

  return response.json() as Promise<CurrentUser>;
}
