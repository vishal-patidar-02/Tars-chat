"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function ChatWindow() {
  return (
    <div className="flex flex-1 flex-col">

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Dummy messages */}
        <div className="max-w-xs rounded-lg bg-muted p-2">
          Hello 👋
        </div>

        <div className="ml-auto max-w-xs rounded-lg bg-primary text-white p-2">
          Hi! How are you?
        </div>
      </div>

      {/* Input */}
      <div className="flex gap-2 border-t p-3">
        <Input placeholder="Type a message..." />

        <Button>Send</Button>
      </div>

    </div>
  )
}