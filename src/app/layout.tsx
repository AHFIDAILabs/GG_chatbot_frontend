import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Providers from "../components/Providers";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Amara – GGCL Green Girls Academy",
  description:
    "Your safe space to ask anything about periods, digital skills, the environment and life skills.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Amara",
  },
};

export const viewport: Viewport = {
   themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#4ade80" },
    { media: "(prefers-color-scheme: light)", color: "#c2522a" },
  ],
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={dmSans.variable}>
      <head>
        <link rel="apple-touch-icon" href="/Green Girl.png" />
      </head>
      <body style={{ fontFamily: "var(--font-dm-sans), DM Sans, sans-serif" }}>
        <Providers>{children}</Providers>

        {/* Register service worker for PWA / offline support */}
        <Script id="sw-register" strategy="afterInteractive">{`
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch(() => {});
          }
        `}</Script>
      </body>
    </html>
  );
}
