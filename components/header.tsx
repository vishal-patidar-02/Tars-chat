"use client"

import { UserButton } from "@clerk/nextjs"
import { ThemeToggle } from "./theme-toggle"

export default function Header() {
  return (
    <header className="relative z-30 flex h-14 flex-shrink-0 items-center justify-between border-b border-border glass px-5">
      {/* Logo mark */}
      <div className="flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-navy">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="#F0F0DB"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>

        <span className="text-sm font-semibold tracking-wide text-foreground">
          Tars
          <span className="ml-0.5 text-muted-foreground font-normal">Chat</span>
        </span>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2.5">
        <ThemeToggle />

        <div className="h-5 w-px bg-border" />

        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox:
                "h-7 w-7 ring-1 ring-border transition-all hover:ring-navy dark:hover:ring-cream",
            },
          }}
        />
      </div>
    </header>
  )
}