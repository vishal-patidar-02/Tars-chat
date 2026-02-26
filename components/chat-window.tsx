"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect, useCallback } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { formatMessageTime } from "@/lib/format-date";
import { ChatMessagesSkeleton } from "./skeletons";

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
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [text, setText] = useState("");
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showNewMsgBtn, setShowNewMsgBtn] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const setTyping = useMutation(api.messages.setTyping);
  const clearTyping = useMutation(api.messages.clearTyping);
  const markSeen = useMutation(api.messages.markSeen);
  const deleteMessage = useMutation(api.messages.deleteMessage);
  const sendMessage = useMutation(api.messages.sendMessage);

  const messages = useQuery(
    api.messages.getMessages,
    conversationId ? { conversationId } : "skip",
  );

  const conversation = useQuery(
    api.messages.getConversation,
    conversationId ? { conversationId } : "skip",
  );

  /* ── Scroll tracking ── */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onScroll = () => {
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
      setIsAtBottom(atBottom);
      if (atBottom) setShowNewMsgBtn(false);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Auto-scroll on new messages ── */
  useEffect(() => {
    if (!messages) return;

    if (isAtBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    } else {
      setShowNewMsgBtn(true);
    }
  }, [messages]);

  /* ── Typing indicator ── */
  useEffect(() => {
    if (!conversationId || !meId) return;

    if (text.length > 0) {
      setTyping({ conversationId, userId: meId });
    } else {
      clearTyping({ conversationId });
    }
  }, [text, conversationId, meId]);

  /* ── Mark seen ── */
  useEffect(() => {
    if (!conversationId || !meId || !messages) return;
    markSeen({ conversationId, userId: meId });
  }, [messages, conversationId, meId]);

  /* ── Send message ── */
  async function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || !conversationId || !meId) return;

    setText("");
    inputRef.current?.focus();

    await sendMessage({ conversationId, senderId: meId, content: trimmed });
  }

  /* ── Delete message ── */
  async function handleDelete(msgId: Id<"messages">) {
    if (!meId) return;

    setDeletingIds((prev) => new Set(prev).add(msgId));
    await deleteMessage({ messageId: msgId, userId: meId });

    setDeletingIds((prev) => {
      const next = new Set(prev);
      next.delete(msgId);
      return next;
    });
  }

  const scrollToBottom = useCallback(() => {
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: "smooth",
    });
    setShowNewMsgBtn(false);
  }, []);

  /* ── Empty state (no conversation selected) ── */
  if (!conversationId || !meId) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 bg-background">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-7 w-7"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">
            Select a conversation
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Choose someone from the sidebar to start chatting
          </p>
        </div>
      </div>
    );
  }

  const isLoading = !messages;

  return (
    <div className="flex h-full w-full flex-col bg-background">
      {/* ── Chat header ── */}
      <div className="flex items-center gap-3 border-b border-border px-5 py-3">
        <div className="relative flex-shrink-0">
          <img
            src={otherUser?.image ?? "/default-avatar.png"}
            alt={otherUser?.name}
            className="h-9 w-9 rounded-full object-cover"
          />
          {otherUser?.online && (
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-online-dot ring-2 ring-panel" />
          )}
        </div>

        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-semibold text-foreground">
            {otherUser?.name ?? "User"}
          </span>
          <span
            className={`text-xs ${otherUser?.online ? "text-green-500" : "text-muted-foreground"}`}
          >
            {otherUser?.online
              ? "Online"
              : otherUser?.lastSeen
                ? `Last seen ${new Date(otherUser.lastSeen).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                : "Offline"}
          </span>
        </div>
      </div>

      {/* ── Messages area ── */}
      <div
        ref={containerRef}
        className="relative flex-1 overflow-y-auto overflow-x-hidden"
      >
        {isLoading ? (
          <ChatMessagesSkeleton />
        ) : messages.length === 0 ? (
          /* Empty chat */
          <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <span className="text-2xl">👋</span>
            </div>
            <p className="text-sm font-medium text-foreground">
              Start a conversation
            </p>
            <p className="text-xs text-muted-foreground">
              Say hello to {otherUser?.name ?? "them"}!
            </p>
          </div>
        ) : (
          /* Message list */
          <div className="flex flex-col gap-3 px-3 py-4 sm:px-6 sm:py-6">
            {messages.map((msg, idx) => {
              const isMe = msg.senderId === meId;
              const seen = isMe && (msg.seenBy?.length ?? 0) > 1;
              const prevMsg = messages[idx - 1];
              const showAvatar =
                !isMe && (!prevMsg || prevMsg.senderId !== msg.senderId);
              const isDeleting = deletingIds.has(msg._id);

              return (
                <div
                  key={msg._id}
                  className={`group flex flex-col ${isMe ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`flex w-full min-w-0 items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}
                  >
                    {/* Other user avatar (shown on first message in a group) */}
                    {!isMe && (
                      <div
                        className={`flex-shrink-0 ${showAvatar ? "visible" : "invisible"}`}
                      >
                        <img
                          src={otherUser?.image ?? "/default-avatar.png"}
                          alt=""
                          className="h-6 w-6 rounded-full object-cover"
                        />
                      </div>
                    )}

                    {/* Bubble */}
                    <div
                      className={`relative min-w-0 max-w-130 wrap-break-word whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm shadow-sm transition-all duration-200 ${
                        isDeleting ? "opacity-40" : "opacity-100"
                      } ${
                        isMe
                          ? "msg-sent rounded-br-sm bg-bubble-sent text-bubble-sent-text"
                          : "msg-recv rounded-bl-sm bg-bubble-recv text-bubble-recv-text"
                      }`}
                    >
                      {msg.isDeleted ? (
                        <span className="italic text-xs opacity-60">
                          This message was deleted
                        </span>
                      ) : (
                        <span className="leading-relaxed wrap-break-word">
                          {msg.content}
                        </span>
                      )}

                      {/* Timestamp */}
                      <span className="mt-1 block text-right text-[10px] opacity-50">
                        {formatMessageTime(msg.createdAt)}
                      </span>

                      {/* Delete button (own messages only) */}
                      {isMe && !msg.isDeleted && (
                        <button
                          onClick={() => handleDelete(msg._id)}
                          disabled={isDeleting}
                          className="absolute -left-7 top-1 hidden rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:block group-hover:opacity-100"
                          aria-label="Delete message"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-3.5 w-3.5"
                          >
                            <path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Seen receipt */}
                  {seen && (
                    <span className="mr-2 mt-0.5 text-[10px] text-muted-foreground">
                      Seen
                    </span>
                  )}
                </div>
              );
            })}

            <div ref={bottomRef} className="h-1" />
          </div>
        )}

        {/* New messages floating button */}
        {showNewMsgBtn && (
          <div className="sticky bottom-4 flex justify-center">
            <button
              onClick={scrollToBottom}
              className="flex items-center gap-1.5 rounded-full bg-navy px-4 py-2 text-xs font-medium text-parchment shadow-lg ring-1 ring-navy/20 transition-all hover:bg-navy/90 dark:bg-cream dark:text-navy dark:ring-cream/20"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3 w-3"
              >
                <path d="m19 9-7 7-7-7" />
              </svg>
              New messages
            </button>
          </div>
        )}
      </div>

      {/* ── Typing indicator ── */}
      {conversation?.typing && conversation.typing !== meId && (
        <div className="flex items-center gap-2 px-5 py-1.5">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            {otherUser?.name ?? "Typing"}…
          </span>
        </div>
      )}

      {/* ── Input bar ── */}
      <div className="border-t border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={`Message ${otherUser?.name ?? ""}…`}
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={!text.trim()}>
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}