import { API_BASE_URL } from "@/shared/api/config";
import { proxyAuthenticatedRequest } from "@/shared/api/authenticatedApi";

export async function POST(request: Request) {
  return proxyAuthenticatedRequest(request, (accessToken) =>
    fetch(`${API_BASE_URL}/api/v1/progression/daily/claim`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }),
  );
}
