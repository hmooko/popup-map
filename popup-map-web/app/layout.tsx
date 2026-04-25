import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Popup Map",
  description: "서울 주요 상권의 팝업스토어를 지도와 리스트로 탐색하는 서비스"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
