"use client"

import { UserButton } from "@clerk/nextjs"

export default function Header() {
  return (
    <header className="flex h-14 items-center justify-between border-b px-4">
      <h1 className="text-lg font-semibold">Tars Chat</h1>

      <UserButton afterSignOutUrl="/" />
    </header>
  )
}