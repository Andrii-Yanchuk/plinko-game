import { API_BASE_URL } from "@/lib/auth-config";
import { proxyAuthenticatedRequest } from "@/lib/authenticated-api";

export async function GET(request: Request) {
  return proxyAuthenticatedRequest(request, (accessToken) =>
    fetch(`${API_BASE_URL}/api/v1/game/config`, {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }),
  );
}
