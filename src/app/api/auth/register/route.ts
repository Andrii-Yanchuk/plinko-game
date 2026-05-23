import { NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  API_BASE_URL,
  REFRESH_TOKEN_COOKIE,
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
} from "@/shared/api/config";

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

  const { accessToken, refreshToken, ...auth } = data;
  const response = NextResponse.json(auth);

  response.cookies.set(
    ACCESS_TOKEN_COOKIE,
    accessToken,
    accessTokenCookieOptions,
  );
  response.cookies.set(
    REFRESH_TOKEN_COOKIE,
    refreshToken,
    refreshTokenCookieOptions,
  );

  return response;
}
