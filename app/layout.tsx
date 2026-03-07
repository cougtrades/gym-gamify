import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthCallbackHandler } from "@/components/auth-callback-handler";
import { BottomNav } from "@/components/bottom-nav";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gym Gamify — Duolingo for Fitness",
  description: "Track workouts, build streaks, compete with friends. The gamified fitness tracker that makes consistency addictive.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Gym Gamify",
  },
  openGraph: {
    title: "Gym Gamify — Duolingo for Fitness",
    description: "Track workouts, build streaks, compete with friends.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gym Gamify — Duolingo for Fitness",
    description: "Track workouts, build streaks, compete with friends.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#09090b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthCallbackHandler />
        {children}
        <BottomNav />
      </body>
    </html>
  );
}