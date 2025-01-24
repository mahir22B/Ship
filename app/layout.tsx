import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./provider";

let title = "AI Code Generator";

export const metadata: Metadata = {
  title,
  description: "",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="flex min-h-full flex-col bg-gray-100 text-gray-900 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}