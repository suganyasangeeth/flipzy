import type { Metadata, Viewport } from "next";
import "./globals.css";
import AuthProvider from "@/lib/auth/AuthProvider";

export const metadata: Metadata = {
  title: "Flipzy — Vocabulary Flashcards for Kids",
  description:
    "A fun, arcade-style vocabulary flashcard app that makes learning words exciting for kids.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FLIPZY",
  },
};

export const viewport: Viewport = {
  themeColor: "#071B37",
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
