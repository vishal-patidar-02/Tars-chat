"use client"

import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState, useRef, useEffect } from "react"
import { Id } from "@/convex/_generated/dataModel"

interface Props {
  conversationId?: Id<"conversations">
  meId?: Id<"users">
}

export default function ChatWindow({ conversationId, meId }: Props) {
  const messages = useQuery(
    api.messages.getMessages,
    conversationId ? { conversationId } : "skip"
  )

  const sendMessage = useMutation(api.messages.sendMessage)

  const [text, setText] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function handleSend() {
    if (!text.trim() || !conversationId || !meId) return

    await sendMessage({
      conversationId,
      senderId: meId,
      content: text,
    })

    setText("")
  }

  if (!conversationId || !meId) {
    return (
      <div className="flex h-full items-center justify-center text-gray-400">
        Select a chat to start messaging
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-[#0a0f1c]">

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 p-5">

        {messages?.map(msg => (
          <div
            key={msg._id}
            className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-md ${
              msg.senderId === meId
                ? "ml-auto bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                : "bg-[#151c33] text-gray-200"
            }`}
          >
            {msg.content}
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-white/10 bg-black/40 backdrop-blur-xl p-4">

        <div className="flex gap-2">

          <Input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Type a message..."
            onKeyDown={e => e.key === "Enter" && handleSend()}
            className="flex-1 bg-[#11172d] border-white/10 text-white placeholder:text-gray-400"
          />

          <Button
            onClick={handleSend}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            Send
          </Button>

        </div>
      </div>
    </div>
  )
}