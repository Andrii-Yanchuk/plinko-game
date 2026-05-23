import { API_BASE_URL } from "@/shared/api/config";
import { proxyAuthenticatedRequest } from "@/shared/api/authenticatedApi";

export async function GET(request: Request) {
  const { search } = new URL(request.url);

  return proxyAuthenticatedRequest(request, (accessToken) =>
    fetch(`${API_BASE_URL}/api/v1/bets${search}`, {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }),
  );
}

export async function POST(request: Request) {
  const payload = await request.text();

  return proxyAuthenticatedRequest(request, (accessToken) =>
    fetch(`${API_BASE_URL}/api/v1/bets`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: payload,
    }).then(async (response) => {
      if (!response.ok) {
        const responseBody = await response.clone().text().catch(() => "");

        console.error("Failed to place bet", {
          payload,
          responseBody,
          status: response.status,
        });
      }

      return response;
    }),
  );
}
