import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.POPUP_MAP_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://popup-map-api.with-momo.com";

export async function GET(request: NextRequest) {
  const query = new URLSearchParams();

  for (const key of [
    "page",
    "size",
    "region",
    "category",
    "reservationRequired",
    "freeOnly",
    "openOnDate",
    "startDateFrom",
    "dateFrom",
    "dateTo"
  ]) {
    const value = request.nextUrl.searchParams.get(key);
    if (value) {
      query.set(key, value);
    }
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/popups?${query.toString()}`, {
    headers: {
      Accept: "application/json"
    },
    cache: "no-store"
  });

  const body = await response.text();

  return new NextResponse(body, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("content-type") ?? "application/json"
    }
  });
}
