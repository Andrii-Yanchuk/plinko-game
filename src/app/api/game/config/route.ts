import { API_BASE_URL } from "@/shared/api/config";
import { proxyAuthenticatedRequest } from "@/shared/api/authenticatedApi";

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
