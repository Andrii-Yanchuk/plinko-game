import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  API_BASE_URL,
  REFRESH_TOKEN_COOKIE,
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
} from "@/shared/api/config";

type AuthenticatedRequest = (accessToken: string) => Promise<Response>;

async function readResponseJson(response: Response) {
  return response.json().catch(() => null);
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

function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice("Bearer ".length);
}

export async function proxyAuthenticatedRequest(
  request: Request,
  fetchBackend: AuthenticatedRequest,
) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
  const token = getBearerToken(request) ?? accessToken;

  if (!token && !refreshToken) {
    return NextResponse.json(
      { message: "Missing access token" },
      { status: 401 },
    );
  }

  if (token) {
    const backendResponse = await fetchBackend(token);
    const data = await readResponseJson(backendResponse);

    if (backendResponse.status !== 401 || !refreshToken) {
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
  const refreshData = await readResponseJson(refreshResponse);

  if (!refreshResponse.ok) {
    return NextResponse.json(refreshData, { status: refreshResponse.status });
  }

  const {
    accessToken: nextAccessToken,
    refreshToken: nextRefreshToken,
  } = refreshData;
  const backendResponse = await fetchBackend(nextAccessToken);
  const data = await readResponseJson(backendResponse);
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
