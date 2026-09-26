import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { AnimatedBackground } from "@/components/layout/AnimatedBackground";
import { DirectionManager } from "@/components/layout/DirectionManager";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F5F0" },
    { media: "(prefers-color-scheme: dark)", color: "#141312" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "Alee Tools – 156 Free, Fast Online Utility Tools",
    template: "%s | Alee Tools",
  },
  description:
    "156 free, instant utility tools for creators, students, and developers. Image resizers, PDF tools, JSON formatters, QR code generators with zero paywalls and zero sign-ups.",
  metadataBase: new URL("https://alee.software"),
  alternates: {
    canonical: "https://alee.software",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Alee Tools",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="min-h-screen flex flex-col relative"
        style={{ background: "var(--bg)", color: "var(--ink)" }}
      >
        <ThemeProvider>
          <DirectionManager />
          <AnimatedBackground />
          <Header />
          <main className="flex-1 relative z-10">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}

