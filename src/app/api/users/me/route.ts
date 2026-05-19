import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  API_BASE_URL,
  REFRESH_TOKEN_COOKIE,
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
} from "@/lib/auth-config";

async function fetchCurrentUser(accessToken: string) {
  return fetch(`${API_BASE_URL}/api/v1/users/me`, {
    method: "GET",
    cache: "no-store",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

async function refreshTokens(refreshToken: string) {
  return fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  });
}

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
  const authorization = request.headers.get("authorization")?.replace(
    "Bearer ",
    "",
  );
  const token = authorization ?? accessToken;

  if (!token && !refreshToken) {
    return NextResponse.json(
      { message: "Missing access token" },
      { status: 401 },
    );
  }

  if (token) {
    const backendResponse = await fetchCurrentUser(token);
    const data = await backendResponse.json();

    if (backendResponse.ok || !refreshToken) {
      return NextResponse.json(data, { status: backendResponse.status });
    }
  }

  if (!refreshToken) {
    return NextResponse.json(
      { message: "Missing refresh token" },
      { status: 401 },
    );
  }

  const refreshResponse = await refreshTokens(refreshToken);
  const refreshData = await refreshResponse.json();

  if (!refreshResponse.ok) {
    return NextResponse.json(refreshData, { status: refreshResponse.status });
  }

  const {
    accessToken: nextAccessToken,
    refreshToken: nextRefreshToken,
  } = refreshData;
  const backendResponse = await fetchCurrentUser(nextAccessToken);
  const data = await backendResponse.json();
  const response = NextResponse.json(data, { status: backendResponse.status });

  response.cookies.set(
    ACCESS_TOKEN_COOKIE,
    nextAccessToken,
    accessTokenCookieOptions,
  );
  response.cookies.set(
    REFRESH_TOKEN_COOKIE,
    nextRefreshToken,
    refreshTokenCookieOptions,
  );

  return response;
}
