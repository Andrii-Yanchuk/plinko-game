import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/auth-config";

export async function GET(request: Request) {
  const authorization = request.headers.get("authorization");

  if (!authorization) {
    return NextResponse.json(
      { message: "Missing authorization header" },
      { status: 401 },
    );
  }

  const backendResponse = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
    method: "GET",
    cache: "no-store",
    headers: {
      Accept: "application/json",
      Authorization: authorization,
    },
  });

  const data = await backendResponse.json();

  return NextResponse.json(data, { status: backendResponse.status });
}
