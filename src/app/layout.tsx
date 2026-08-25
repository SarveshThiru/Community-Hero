import type { Metadata, Viewport } from "next"
import { JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { RootProviders } from "./providers"

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
})

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Community Hero - Civic Issue Reporting Platform",
    template: "%s | Community Hero",
  },
  description: "Report, track, and resolve civic issues in your community. Connect with local authorities and make your neighborhood better together.",
  keywords: ["civic engagement", "issue reporting", "community", "smart city", "municipal", "potholes", "streetlights", "garbage"],
  authors: [{ name: "Community Hero Team" }],
  creator: "Community Hero",
  publisher: "Community Hero",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Community Hero",
    title: "Community Hero - Civic Issue Reporting Platform",
    description: "Report, track, and resolve civic issues in your community.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Community Hero",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Community Hero",
    description: "Report, track, and resolve civic issues in your community.",
    images: ["/og-image.png"],
  },
  verification: {
    google: "google-site-verification-code",
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={jetbrainsMono.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-screen bg-white text-black">
        {/* THE CITY AS DATA FIELD (seed d890a4a8): pure white ground, pure black ink,
            no grey paint, one monospace face, red reserved for critical only.
            Every report is a column of pure signal; status changes invert the field. */}
        <RootProviders>{children}</RootProviders>
      </body>
    </html>
  )
}