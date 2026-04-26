import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.POPUP_MAP_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://popup-map-api.with-momo.com";

interface RouteContext {
  params: Promise<{
    popupId: string;
  }>;
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const authorization = request.headers.get("authorization");
  const { popupId } = await context.params;

  const response = await fetch(
    `${API_BASE_URL}/api/v1/admin/popups/${encodeURIComponent(popupId)}`,
    {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        ...(authorization ? { Authorization: authorization } : {})
      },
      cache: "no-store"
    }
  );

  const responseBody = await response.text();

  return new NextResponse(responseBody, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("content-type") ?? "application/json"
    }
  });
}
