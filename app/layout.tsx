import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "@/components/AuthProvider"

export const metadata: Metadata = {
  title: "ケアレポAI",
  description: "介護報告書AI添削アプリ",
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
