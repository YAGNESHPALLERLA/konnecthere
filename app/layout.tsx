import type { Metadata } from "next"
import "./globals.css"
import { Providers } from "./providers"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"

export const metadata: Metadata = {
  title: "KonnectHere — Executive opportunities, distilled",
  description: "A minimalist job platform built for modern teams and ambitious talent.",
  icons: {
    icon: [
      { url: "/favicon.svg", sizes: "any", type: "image/svg+xml" },
      { url: "/favicon.png", sizes: "any", type: "image/png" },
    ],
    apple: "/favicon.png",
    shortcut: "/favicon.svg",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-white text-black page-transition">
        <Providers>
          <Navbar />
          <main className="flex flex-1 flex-col">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
