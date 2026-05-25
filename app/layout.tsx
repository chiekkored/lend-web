import type { Metadata } from "next";
import type { ReactNode } from "react";

import { QueryProvider } from "@/components/providers/query-provider";

import "./globals.css";

export const metadata: Metadata = {
  title: "Lend",
  description: "Rental marketplace web experience and admin console.",
};

const themeInitScript = `
(() => {
  try {
    if (window.localStorage.getItem("lend:admin:theme") === "dark") {
      document.documentElement.classList.add("dark");
    }
  } catch {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
