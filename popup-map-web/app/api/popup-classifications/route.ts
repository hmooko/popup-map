import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.POPUP_MAP_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://popup-map-api.with-momo.com";

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type");
  const query = new URLSearchParams();

  if (type) {
    query.set("type", type);
  }

  const targetUrl = query.toString()
    ? `${API_BASE_URL}/api/v1/popup-classifications?${query.toString()}`
    : `${API_BASE_URL}/api/v1/popup-classifications`;

  try {
    const response = await fetch(targetUrl, {
      headers: {
        Accept: "application/json"
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
    const message =
      error instanceof Error
        ? `${error.name}: ${error.message}`
        : "분류 목록 프록시 중 알 수 없는 오류가 발생했습니다.";

    return NextResponse.json(
      {
        message: `분류 목록 API 호출 실패 (${targetUrl})`,
        detail: message
      },
      {
        status: 500
      }
    );
  }
}
