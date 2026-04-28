import { NextRequest, NextResponse } from "next/server";
import { createProxyErrorResponse } from "../_lib/proxy";

const API_BASE_URL =
  process.env.POPUP_MAP_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://popup-map-api.with-momo.com";

export async function GET(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  const type = request.nextUrl.searchParams.get("type");
  const activeOnly = request.nextUrl.searchParams.get("activeOnly");
  const query = new URLSearchParams();

  if (type) {
    query.set("type", type);
  }

  if (activeOnly) {
    query.set("activeOnly", activeOnly);
  }

  const targetUrl = query.toString()
    ? `${API_BASE_URL}/api/v1/admin/popup-classifications?${query.toString()}`
    : `${API_BASE_URL}/api/v1/admin/popup-classifications`;

  try {
    const response = await fetch(targetUrl, {
      headers: {
        Accept: "application/json",
        ...(authorization ? { Authorization: authorization } : {})
      },
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

export async function POST(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  const body = await request.text();
  const targetUrl = `${API_BASE_URL}/api/v1/admin/popup-classifications`;

  try {
    const response = await fetch(targetUrl, {
      method: "POST",
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
