import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/contexts/AppContext";
import AuthOverlay from "@/components/AuthOverlay";
import React from 'react';

export const metadata: Metadata = {
  title: "Dawith Copy | 내가 카피한 모든 것 저장",
  description: "링크 관리와 공유를 손쉽게. 클립보드에 복사한 모든 것을 다루세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <AppProvider>
          <AuthOverlay />
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
