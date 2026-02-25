"use client"

import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState, useRef, useEffect } from "react"

interface Props {
  conversationId?: Id<"conversations">
  meId?: Id<"users">
}

export default function ChatWindow({
  conversationId,
  meId,
}: Props) {

  const messages = useQuery(
    api.messages.getMessages,
    conversationId ? { conversationId } : "skip"
  )

  const sendMessage = useMutation(api.messages.sendMessage)

  const [text, setText] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function handleSend() {
    if (!text.trim()) return
    if (!conversationId || !meId) return

    await sendMessage({
      conversationId,
      senderId: meId,
      content: text,
    })

    setText("")
  }

  // Loading state
  if (!conversationId || !meId) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground">
        Select a chat to start messaging
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col">

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">

        {messages?.map(msg => (
          <div
            key={msg._id}
            className={`max-w-xs rounded-lg p-2 ${
              msg.senderId === meId
                ? "ml-auto bg-primary text-white"
                : "bg-muted"
            }`}
          >
            {msg.content}
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 border-t p-3">

        <Input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type a message..."
          disabled={!conversationId || !meId}
          onKeyDown={e => e.key === "Enter" && handleSend()}
        />

        <Button
          onClick={handleSend}
          disabled={!conversationId || !meId}
        >
          Send
        </Button>

      </div>
    </div>
  )
}