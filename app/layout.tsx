"use client"

import { ClerkProvider } from "@clerk/nextjs"
import { ConvexProvider, ConvexReactClient } from "convex/react"
import { ThemeProvider } from "@/components/theme/theme-provider"
import UserSync from "@/components/user/user-sync"
import { NotificationProvider } from "@/components/notifications/notification-provider"
import "./globals.css"

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
if (!convexUrl) throw new Error("NEXT_PUBLIC_CONVEX_URL is missing")
const convex = new ConvexReactClient(convexUrl)

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <ConvexProvider client={convex}>
        <html lang="en" suppressHydrationWarning>
          <body className="bg-background text-foreground antialiased">
            <ThemeProvider>
              <UserSync />
              <NotificationProvider>
                {children}
              </NotificationProvider>
            </ThemeProvider>
          </body>
        </html>
      </ConvexProvider>
    </ClerkProvider>
  )
}