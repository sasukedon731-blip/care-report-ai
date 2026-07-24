import type { Metadata, Viewport } from "next"
import "./globals.css"
import { AuthProvider } from "@/components/AuthProvider"
import { AccessProvider } from "@/components/AccessProvider"
import LegalFooter from "@/components/LegalFooter"

export const metadata: Metadata = {
  title: "ケアレポAI｜介護報告書AI添削",
  description: "介護報告文を家族向け・社内向けに整理するAI添削アプリ",
  applicationName: "ケアレポAI",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "ケアレポAI",
    statusBarStyle: "default",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#073b4c",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <AuthProvider><AccessProvider>{children}<LegalFooter /></AccessProvider></AuthProvider>
      </body>
    </html>
  )
}
