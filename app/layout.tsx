"use client"

import { ClerkProvider } from "@clerk/nextjs"
import { ConvexProvider, ConvexReactClient } from "convex/react"
import UserSync from "@/components/user-sync"
import "./globals.css"

const convex = new ConvexReactClient(
  process.env.NEXT_PUBLIC_CONVEX_URL!
)

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <ConvexProvider client={convex}>
        <html lang="en">
          <body>
            <UserSync />
            {children}
            </body>
        </html>
      </ConvexProvider>
    </ClerkProvider>
  )
}