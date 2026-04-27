import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.POPUP_MAP_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://popup-map-api.with-momo.com";

export async function GET(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  const keyword = request.nextUrl.searchParams.get("q");
  const query = new URLSearchParams();

  if (keyword) {
    query.set("q", keyword);
  }

  const targetUrl = query.toString()
    ? `${API_BASE_URL}/api/v1/admin/popups?${query.toString()}`
    : `${API_BASE_URL}/api/v1/admin/popups`;

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
}

export async function POST(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  const body = await request.text();

  const response = await fetch(`${API_BASE_URL}/api/v1/admin/popups`, {
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
}
