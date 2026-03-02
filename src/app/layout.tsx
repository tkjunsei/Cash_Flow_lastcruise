import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ワリカン - 共有型家計簿アプリ",
  description:
    "ログイン不要でURLを共有するだけ。みんなの支出をかんたんに管理できる共有型家計簿アプリ。",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${inter.variable} font-sans antialiased min-h-screen bg-background`}
      >
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
