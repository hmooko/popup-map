import { NextRequest, NextResponse } from "next/server";
import { createProxyErrorResponse } from "../../../_lib/proxy";

const API_BASE_URL =
  process.env.POPUP_MAP_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://popup-map-api.with-momo.com";

interface RouteContext {
  params: Promise<{
    popupId: string;
  }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const authorization = request.headers.get("authorization");
  const body = await request.text();
  const { popupId } = await context.params;
  const targetUrl = `${API_BASE_URL}/api/v1/admin/popups/${encodeURIComponent(popupId)}/visibility`;

  try {
    const response = await fetch(targetUrl, {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(authorization ? { Authorization: authorization } : {})
      },
      body,
      cache: "no-store"
    });

    const responseBody = await response.text();

    return new NextResponse(responseBody, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") ?? "application/json"
      }
    });
  } catch (error) {
    return createProxyErrorResponse(error, targetUrl);
  }
}
