"use client"

import Header from "@/components/layout/header"
import Sidebar from "@/components/layout/sidebar"
import { useState } from "react"

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* ── Top header (full width) ── */}
      <Header />

      {/* ── Body row ── */}
      <div className="relative flex flex-1 overflow-hidden">

        {/* ── Sidebar – desktop: always visible | mobile: slide-over ── */}
        <>
          {/* Desktop sidebar */}
          <div className="hidden w-72 shrink-0 border-r border-border md:flex md:flex-col">
            <Sidebar />
          </div>

          {/* Mobile sidebar overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Mobile sidebar drawer */}
          <div
            className={`fixed inset-y-0 left-0 z-50 w-72 transform border-r border-border bg-panel transition-transform duration-300 ease-in-out md:hidden ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            {/* Drawer close button */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="text-sm font-semibold text-foreground">Conversations</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                aria-label="Close sidebar"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <Sidebar />
          </div>
        </>

        {/* ── Main content area ── */}
        <div className="flex flex-1 flex-col w-full">
          {/* Mobile header bar with hamburger */}
          <div className="flex items-center gap-2 border-b border-border glass px-3 py-2 md:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Open sidebar"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <line x1="3" y1="6"  x2="21" y2="6"  />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <span className="text-xs text-muted-foreground">Tap to switch chat</span>
          </div>

          {/* Page content */}
          <div className="flex flex-1 overflow-hidden">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}