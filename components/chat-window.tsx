"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { formatMessageTime } from "@/lib/format-date";

interface Props {
  conversationId?: Id<"conversations">;
  meId?: Id<"users">;
  otherUser?: {
    _id: string;
    name: string;
    image?: string;
    online?: boolean;
    lastSeen?: number;
  };
}

export default function ChatWindow({ conversationId, meId, otherUser }: Props) {
  const setTyping = useMutation(api.messages.setTyping);
  const clearTyping = useMutation(api.messages.clearTyping);
  const markSeen = useMutation(api.messages.markSeen);
  const deleteMessage = useMutation(api.messages.deleteMessage);

  const messages = useQuery(
    api.messages.getMessages,
    conversationId ? { conversationId } : "skip",
  );

  const sendMessage = useMutation(api.messages.sendMessage);

  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!conversationId || !meId) return;

    if (text.length > 0) {
      setTyping({
        conversationId,
        userId: meId,
      });
    } else {
      clearTyping({ conversationId });
    }
  }, [text]);

  useEffect(() => {
    if (!conversationId || !meId) return;

    markSeen({
      conversationId,
      userId: meId,
    });
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const conversation = useQuery(
    api.messages.getConversation,
    conversationId ? { conversationId } : "skip",
  );

  async function handleSend() {
    if (!text.trim() || !conversationId || !meId) return;

    await sendMessage({
      conversationId,
      senderId: meId,
      content: text,
    });

    setText("");
  }

  if (!conversationId || !meId) {
    return (
      <div className="flex h-full items-center justify-center text-gray-400">
        Select a chat to start messaging
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-[#0a0f1c]">
      {/* Chat Header */}
      <div className="flex items-center gap-3 border-b border-white/10 bg-black/40 px-5 py-3 backdrop-blur-xl">
        <img
          src={otherUser?.image}
          alt="user"
          className="h-10 w-10 rounded-full border border-white/20"
        />

        <div className="flex flex-col">
          <span className="font-medium text-white">
            {otherUser?.name || "User"}
          </span>

          <span
            className={`text-xs ${
              otherUser?.online ? "text-green-400" : "text-gray-400"
            }`}
          >
            {otherUser?.online
              ? "Online"
              : `Last seen ${
                  otherUser?.lastSeen
                    ? new Date(otherUser.lastSeen).toLocaleTimeString()
                    : "recently"
                }`}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 p-5">
        {messages && messages.length === 0 && (
          <div className="flex flex-1 items-center justify-center text-center text-gray-400">
            <div>
              <p className="text-lg font-medium">No messages yet</p>
              <p className="text-sm mt-1">
                Say hello 👋 and start the conversation
              </p>
            </div>
          </div>
        )}
        {messages?.map((msg) => {
          const isMe = msg.senderId === meId;
          const seen = isMe && (msg.seenBy?.length || 0) > 1;

          return (
            <div key={msg._id} className="flex flex-col group">
              <div
                className={`relative max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-md ${
                  isMe
                    ? "ml-auto bg-linear-to-r from-indigo-500 to-purple-600 text-white"
                    : "bg-[#151c33] text-gray-200"
                }`}
              >
                {/* MESSAGE CONTENT */}
                {msg.isDeleted ? (
                  <div className="italic text-gray-400">
                    This message was deleted
                  </div>
                ) : (
                  <div>{msg.content}</div>
                )}

                {/* TIMESTAMP */}
                <div className="mt-1 text-[10px] text-white/70 text-right">
                  {formatMessageTime(msg.createdAt)}
                </div>

                {/* DELETE BUTTON (ONLY FOR OWN MESSAGE) */}
                {isMe && !msg.isDeleted && (
                  <button
                    onClick={() =>
                      deleteMessage({
                        messageId: msg._id,
                        userId: meId!,
                      })
                    }
                    className="absolute -right-8 top-1 hidden text-xs text-red-400 group-hover:block"
                  >
                    Delete
                  </button>
                )}
              </div>

              {seen && (
                <span className="ml-auto text-[10px] text-gray-400 mt-1">
                  Seen
                </span>
              )}
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>
      {conversation?.typing && conversation.typing !== meId && (
        <div className="px-4 pb-1 text-xs text-indigo-400">Typing...</div>
      )}
      {/* Input */}
      <div className="border-t border-white/10 bg-black/40 backdrop-blur-xl p-4">
        <div className="flex gap-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
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
  );
}
