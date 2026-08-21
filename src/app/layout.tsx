import type { Metadata, Viewport } from "next";
import "./globals.css";
import AuthProvider from "@/lib/auth/AuthProvider";

export const metadata: Metadata = {
  title: "Flipzy — Vocabulary Flashcards for Kids",
  description:
    "A fun, arcade-style vocabulary flashcard app that makes learning words exciting for kids.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Flipzy",
  },
};

export const viewport: Viewport = {
  themeColor: "#A81D1D",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
