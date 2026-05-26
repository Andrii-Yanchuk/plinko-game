import type {
  PlayerProfile,
  UpdateProfilePayload,
} from "@/entities/profile/model/types";

async function readErrorMessage(response: Response, fallback: string) {
  const error = await response.json().catch(() => null);
  const message = error?.message ?? error?.error ?? fallback;

  return Array.isArray(message) ? message.join(", ") : message;
}

export async function getProfile() {
  const response = await fetch("/api/profile/me", {
    method: "GET",
    credentials: "same-origin",
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, "Unable to load profile"));
  }

  return response.json() as Promise<PlayerProfile>;
}

export async function updateProfile(payload: UpdateProfilePayload) {
  const response = await fetch("/api/profile/me", {
    method: "PATCH",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, "Unable to update profile"),
    );
  }

  return response.json() as Promise<PlayerProfile>;
}

export async function uploadProfileAvatar(image: File) {
  const formData = new FormData();

  formData.append("image", image);

  const response = await fetch("/api/profile/avatar", {
    method: "POST",
    credentials: "same-origin",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, "Unable to upload avatar"),
    );
  }

  return response.json() as Promise<PlayerProfile>;
}
