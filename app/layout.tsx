import type { Metadata, Viewport } from "next"
import "./globals.css"
import { AuthProvider } from "@/components/AuthProvider"

export const metadata: Metadata = {
  title: "介護報告AI",
  description: "介護報告書AI添削アプリ",
  applicationName: "介護報告AI",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "介護報告AI",
    statusBarStyle: "default",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#2f4a68",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
