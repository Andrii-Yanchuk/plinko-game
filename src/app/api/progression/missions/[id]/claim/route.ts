import { API_BASE_URL } from "@/shared/api/config";
import { proxyAuthenticatedRequest } from "@/shared/api/authenticatedApi";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;

  return proxyAuthenticatedRequest(request, (accessToken) =>
    fetch(
      `${API_BASE_URL}/api/v1/progression/missions/${encodeURIComponent(
        id,
      )}/claim`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      },
    ),
  );
}
