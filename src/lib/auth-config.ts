export const API_BASE_URL =
  process.env.API_URL ?? "https://plinko-be-stanish.fly.dev";

export const REFRESH_TOKEN_COOKIE = "refreshToken";

export const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};
