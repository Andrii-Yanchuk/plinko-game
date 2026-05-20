import { API_BASE_URL } from "@/lib/auth-config";
import { proxyAuthenticatedRequest } from "@/lib/authenticated-api";

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
