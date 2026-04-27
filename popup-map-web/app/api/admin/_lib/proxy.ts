import { NextResponse } from "next/server";

export function createProxyErrorResponse(error: unknown, targetUrl: string) {
  const message =
    error instanceof Error
      ? `${error.name}: ${error.message}`
      : "관리자 API 프록시 중 알 수 없는 오류가 발생했습니다.";

  return NextResponse.json(
    {
      message: `관리자 API 호출 실패 (${targetUrl})`,
      detail: message
    },
    {
      status: 500
    }
  );
}
