import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "AI 你画我猜",
  description: "在线你画我猜：你画，AI 猜。",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
