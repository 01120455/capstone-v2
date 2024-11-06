import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

const fontSans = FontSans({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "3R Shane",
  description: "Rice Mill Inventory Management System",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background font-inter antialiased bg-customColors-lightPastelGreen",
          fontSans.variable
        )}
      >
        <div>{children}</div>
      </body>
    </html>
  );
}
