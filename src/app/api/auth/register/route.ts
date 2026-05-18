import { NextResponse } from "next/server";
import {
  API_BASE_URL,
  REFRESH_TOKEN_COOKIE,
  refreshTokenCookieOptions,
} from "@/lib/auth-config";

export async function POST(request: Request) {
  const payload = await request.json();

  const backendResponse = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await backendResponse.json();

  if (!backendResponse.ok) {
    return NextResponse.json(data, { status: backendResponse.status });
  }

  const { refreshToken, ...auth } = data;
  const response = NextResponse.json(auth);

  response.cookies.set(
    REFRESH_TOKEN_COOKIE,
    refreshToken,
    refreshTokenCookieOptions,
  );

  return response;
}
