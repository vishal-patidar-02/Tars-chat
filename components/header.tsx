"use client"

import { UserButton } from "@clerk/nextjs"

export default function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-white/10 bg-black/40 backdrop-blur-xl px-6">

      <h1 className="text-xl font-bold tracking-wide text-white">
        ⚡ Tars Chat
      </h1>

      <UserButton afterSignOutUrl="/" />

    </header>
  )
}