import type { Metadata } from "next"
import "./globals.css"
import { Providers } from "./providers"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"

export const metadata: Metadata = {
  title: "KonnectHere — Executive opportunities, distilled",
  description: "A minimalist job platform built for modern teams and ambitious talent.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-white text-black">
        <Providers>
          <Navbar />
          <main className="flex flex-1 flex-col">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
