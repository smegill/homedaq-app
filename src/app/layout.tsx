import "./globals.css";
import type { Metadata } from "next";
import NavBar from "../components/NavBar";
import BackgroundFX from "../components/BackgroundFX";

export const metadata: Metadata = {
  title: "HomeDAQ",
  description: "Skip the banks. Build equity together.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-800 min-h-screen">
        <BackgroundFX />
        <NavBar />
        <main>{children}</main>
      </body>
    </html>
  );
}
