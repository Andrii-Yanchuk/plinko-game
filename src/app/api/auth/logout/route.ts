import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  API_BASE_URL,
  REFRESH_TOKEN_COOKIE,
  refreshTokenCookieOptions,
} from "@/lib/auth-config";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

  if (refreshToken) {
    await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    }).catch(() => null);
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(REFRESH_TOKEN_COOKIE, "", {
    ...refreshTokenCookieOptions,
    maxAge: 0,
  });

  return response;
}
