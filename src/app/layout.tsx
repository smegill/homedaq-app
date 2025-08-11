import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import NavBar from "../components/NavBar";

export const metadata: Metadata = {
  title: "HomeDAQ",
  description: "Skip the banks. Build equity together.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <NavBar />
        <main>{children}</main>
      </body>
    </html>
  );
}
