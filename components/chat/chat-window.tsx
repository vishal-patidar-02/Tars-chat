"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { formatMessageTime, formatMessageDateHeader } from "@/lib/format-date";
import { ChatMessagesSkeleton } from "./skeletons";
import { MessageReactions } from "./message-reactions";
import dynamic from "next/dynamic";

const EditGroupModal = dynamic(() => import("../group/edit-group-modal"), { ssr: false });

interface Props {
  conversationId?: Id<"conversations">;
  meId?: Id<"users">;
  // DM-specific
  otherUser?: {
    _id: string;
    name: string;
    image?: string;
    online?: boolean;
    lastSeen?: number;
  };
  // Group-specific
  isGroup?: boolean;
  groupName?: string;
  groupMembers?: Array<{ _id: string; name: string; image?: string }>;
}

export default function ChatWindow({
  conversationId,
  meId,
  otherUser,
  isGroup,
  groupName,
  groupMembers,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [text, setText] = useState("");
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showNewMsgBtn, setShowNewMsgBtn] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [activeMobileDeleteId, setActiveMobileDeleteId] = useState<string | null>(null);
  const [showEditGroup, setShowEditGroup] = useState(false);
  const [lastScrollHeight, setLastScrollHeight] = useState(0);

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

  /* ── Track if we were at bottom before messages changed ── */
  const wasAtBottomRef = useRef(isAtBottom);
  useEffect(() => {
    wasAtBottomRef.current = isAtBottom;
  }, [isAtBottom]);

  /* ── Build a userId → name map for reaction tooltips ── */
  const userNames = useMemo<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    if (otherUser) map[otherUser._id] = otherUser.name;
    if (groupMembers) {
      for (const m of groupMembers) map[m._id] = m.name;
    }
    return map;
  }, [otherUser, groupMembers]);

  /* ── Scroll tracking ── */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => {
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
      setIsAtBottom(atBottom);
      if (atBottom) setShowNewMsgBtn(false);
      setLastScrollHeight(el.scrollHeight);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Smart auto-scroll on new messages ── */
  useEffect(() => {
    if (!messages) return;
    // Only auto-scroll if we were at bottom OR new messages arrived while user wasn't scrolled up
    const shouldAutoScroll = wasAtBottomRef.current || messages.length <= 10;
    if (shouldAutoScroll) {
      // Use requestAnimationFrame for smoother scroll after render
      requestAnimationFrame(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      });
    } else {
      setShowNewMsgBtn(true);
    }
  }, [messages?.length]);

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
    setActiveMobileDeleteId(null);
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

  /* ── Empty state ── */
  if (!conversationId || !meId) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 bg-background">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">Select a conversation</p>
          <p className="mt-1 text-xs text-muted-foreground">Choose someone from the sidebar to start chatting</p>
        </div>
      </div>
    );
  }

  const isLoading = !messages;

  /* ── Group header subtitle ── */
  const memberNamesPreview = (() => {
    if (!isGroup || !groupMembers) return "";
    const others = groupMembers.filter((m) => m._id !== meId);
    if (others.length === 0) return "Just you";
    const MAX = 3;
    const shown = others.slice(0, MAX).map((m) => m.name.split(" ")[0]);
    const remaining = others.length - MAX;
    return remaining > 0 ? `${shown.join(", ")} +${remaining} more` : shown.join(", ");
  })();

  const dmSubtitle = otherUser?.online
    ? "Online"
    : otherUser?.lastSeen
      ? `Last seen ${new Date(otherUser.lastSeen).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
      : "Offline";

  const getSenderName = (senderId: string) => {
    if (!isGroup) return null;
    return groupMembers?.find((m) => m._id === senderId)?.name ?? "Unknown";
  };
  const getSenderImage = (senderId: string) => {
    if (!isGroup) return otherUser?.image ?? "/default-avatar.png";
    return groupMembers?.find((m) => m._id === senderId)?.image ?? "/default-avatar.png";
  };

  return (
    <div className="flex h-full w-full flex-col bg-background">

      {/* ── Chat header ── */}
      <div className="flex items-center gap-3 border-b border-border px-5 py-3">
        <div className="relative shrink-0">
          {isGroup ? (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy/15 dark:bg-cream/10 ring-1 ring-border">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-navy dark:text-cream">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
          ) : (
            <>
              <img
                src={otherUser?.image ?? "/default-avatar.png"}
                alt={otherUser?.name}
                className="h-9 w-9 rounded-full object-cover"
              />
              {otherUser?.online && (
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-online-dot ring-2 ring-panel" />
              )}
            </>
          )}
        </div>

        {isGroup ? (
          <button
            onClick={() => setShowEditGroup(true)}
            className="group flex min-w-0 flex-col text-left rounded-lg px-1.5 py-1 -ml-1.5 transition-colors hover:bg-muted"
            title="Edit group"
          >
            <span className="flex items-center gap-1.5 truncate text-sm font-semibold text-foreground">
              {groupName ?? "Group Chat"}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 shrink-0">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {groupMembers?.length ?? 0} members{memberNamesPreview ? ` · ${memberNamesPreview}` : ""}
            </span>
          </button>
        ) : (
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-semibold text-foreground">
              {otherUser?.name ?? "User"}
            </span>
            <span className={`text-xs ${otherUser?.online ? "text-green-500" : "text-muted-foreground"}`}>
              {dmSubtitle}
            </span>
          </div>
        )}

        {isGroup && (
          <button
            onClick={() => setShowEditGroup(true)}
            className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-elevated text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="Edit group"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        )}
      </div>

      {/* ── Messages area ── */}
      <div ref={containerRef} className="relative flex-1 overflow-y-auto overflow-x-hidden">
        {isLoading ? (
          <ChatMessagesSkeleton />
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <span className="text-2xl">👋</span>
            </div>
            <p className="text-sm font-medium text-foreground">Start a conversation</p>
            <p className="text-xs text-muted-foreground">
              {isGroup ? "Say hello to the group!" : `Say hello to ${otherUser?.name ?? "them"}!`}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-1 px-2 py-3 sm:px-4 sm:py-4">
            {/* Date separators and messages */}
            {messages.map((msg, idx) => {
              const isMe = msg.senderId === meId;
              const seen = isMe && (msg.seenBy?.length ?? 0) > 1;
              const prevMsg = messages[idx - 1];
              const nextMsg = messages[idx + 1];

              // Show avatar when: different sender than previous OR first message OR different sender than next (end of run)
              const showAvatar = !isMe && (!prevMsg || prevMsg.senderId !== msg.senderId);
              const isNewRun = !prevMsg || prevMsg.senderId !== msg.senderId;

              // Date header: show when first message OR different day than previous
              const showDateHeader =
                idx === 0 ||
                (prevMsg && formatMessageDateHeader(msg.createdAt) !== formatMessageDateHeader(prevMsg.createdAt));

              const isDeleting = deletingIds.has(msg._id);
              const showMobileDelete = activeMobileDeleteId === msg._id;
              const senderName = getSenderName(msg.senderId);
              const senderImage = getSenderImage(msg.senderId);
              const reactions = msg.reactions ?? [];

              return (
                <div key={msg._id} className="flex flex-col">
                  {/* Date header */}
                  {showDateHeader && (
                    <div className="flex items-center justify-center my-3">
                      <span className="px-3 py-1 text-xs font-medium text-muted-foreground bg-muted/50 rounded-full">
                        {formatMessageDateHeader(msg.createdAt)}
                      </span>
                    </div>
                  )}

                  {/* Message row */}
                  <div
                    className={`group flex flex-col ${isMe ? "items-end" : "items-start"} ${isNewRun ? "mt-2" : "mt-0.5"}`}
                  >
                    {/* Group: sender name above message */}
                    {isGroup && !isMe && showAvatar && senderName && (
                      <span className="ml-1 mb-1 text-[11px] font-medium text-muted-foreground">
                        {senderName}
                      </span>
                    )}

                    <div className={`flex w-full min-w-0 items-end gap-1.5 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                      {/* Avatar - larger and more prominent */}
                      {!isMe && (
                        <div className={`shrink-0 self-end transition-opacity ${showAvatar ? "opacity-100" : "opacity-0"}`}>
                          <img
                            src={senderImage}
                            alt={senderName ?? "User"}
                            className="h-7 w-7 rounded-full object-cover ring-1 ring-border shadow-sm"
                          />
                        </div>
                      )}

                      {/* Bubble + reactions column */}
                      <div className={`flex min-w-0 flex-col ${isMe ? "items-end" : "items-start"}`}>
                        {/* Bubble */}
                        <div
                          className={`relative min-w-0 max-w-[min(28rem,70vw)] break-words rounded-2xl px-3.5 py-2 text-sm shadow-sm transition-all duration-200 ${
                            isDeleting ? "opacity-40" : "opacity-100"
                          } ${
                            isMe
                              ? "msg-sent rounded-br-md bg-bubble-sent text-bubble-sent-text"
                              : "msg-recv rounded-bl-md bg-bubble-recv text-bubble-recv-text"
                          }`}
                          onClick={() => {
                            if (isMe && !msg.isDeleted) {
                              setActiveMobileDeleteId(showMobileDelete ? null : msg._id);
                            }
                          }}
                        >
                          {msg.isDeleted ? (
                            <span className="italic text-xs opacity-60">This message was deleted</span>
                          ) : (
                            <span className="leading-relaxed break-words">{msg.content}</span>
                          )}
                          {/* Time + seen indicator */}
                          <div className="flex items-center justify-end gap-1 mt-1">
                            <span className="text-[10px] opacity-50">
                              {formatMessageTime(msg.createdAt)}
                            </span>
                            {!isGroup && seen && (
                              <span className="text-[10px] text-blue-500">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-2.5 w-2.5">
                                  <path d="M18 6 7 17l-5-5M22 10 7 25" />
                                </svg>
                              </span>
                            )}
                          </div>

                          {/* Desktop delete button */}
                          {isMe && !msg.isDeleted && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(msg._id); }}
                              disabled={isDeleting}
                              className="absolute -left-8 top-1/2 -translate-y-1/2 hidden rounded-md p-1.5 text-muted-foreground opacity-0 transition-all hover:text-destructive hover:bg-destructive/10 group-hover:opacity-100 md:block"
                              aria-label="Delete message"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                                <path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
                              </svg>
                            </button>
                          )}
                        </div>

                        {/* Reactions row */}
                        {!msg.isDeleted && (
                          <MessageReactions
                            messageId={msg._id}
                            meId={meId}
                            reactions={reactions}
                            isMe={isMe}
                            isDeleted={msg.isDeleted ?? false}
                            userNames={userNames}
                          />
                        )}
                      </div>
                    </div>

                    {/* Mobile delete button */}
                    {isMe && !msg.isDeleted && showMobileDelete && (
                      <button
                        onClick={() => handleDelete(msg._id)}
                        disabled={isDeleting}
                        className="mt-1.5 mr-1 flex items-center gap-1.5 rounded-lg bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/20 active:bg-destructive/30 md:hidden"
                        aria-label="Delete message"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                          <path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
                        </svg>
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} className="h-px" />
          </div>
        )}

        {/* New messages floating button */}
        {showNewMsgBtn && (
          <div className="sticky bottom-4 flex justify-center">
            <button
              onClick={scrollToBottom}
              className="flex items-center gap-1.5 rounded-full bg-red px-4 py-2 text-xs font-medium text-parchment shadow-lg ring-1 ring-navy/20 transition-all hover:bg-navy/90 dark:bg-cream dark:text-navy dark:ring-cream/20"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                <path d="m19 9-7 7-7-7" />
              </svg>
              New messages
            </button>
          </div>
        )}
      </div>

      {/* ── Typing indicator ── */}
      {conversation?.typing && conversation.typing !== meId && (
        <div className="flex items-center gap-2 px-4 py-2 animate-fade-in">
          <div className="flex items-center gap-1.5 bg-muted/50 rounded-xl px-3 py-2">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              {isGroup
                ? groupMembers?.find((m) => m._id === conversation.typing)?.name ?? "Someone"
                : otherUser?.name ?? "Typing"}
              is typing…
            </span>
          </div>
        </div>
      )}

      {/* ── Input bar ── */}
      <div className="border-t border-border px-3 py-3 sm:px-4 sm:py-3.5">
        <div className="flex items-end gap-2 max-w-4xl mx-auto">
          <div className="relative flex-1">
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
              placeholder={isGroup ? `Message ${groupName ?? "the group"}…` : `Message ${otherUser?.name ?? ""}…`}
              className="min-h-[44px] pr-12 bg-elevated border-border placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:ring-ring resize-none"
              rows={1}
              style={{ height: "auto", minHeight: "44px" }}
            />
          </div>
          <Button
            onClick={handleSend}
            disabled={!text.trim()}
            className="h-11 w-11 sm:w-auto sm:px-6 shrink-0 rounded-xl transition-all disabled:opacity-50 disabled:scale-100 active:scale-95"
          >
            <span className="hidden sm:inline">Send</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 sm:hidden">
              <path d="m22 2-7 20-4-9-9-4Z" />
              <path d="M22 2 11 13" />
            </svg>
          </Button>
        </div>
      </div>

      {/* ── Edit group modal ── */}
      {showEditGroup && conversationId && meId && isGroup && groupMembers && (
        <EditGroupModal
          conversationId={conversationId}
          meId={meId}
          currentName={groupName ?? ""}
          currentMembers={groupMembers}
          onClose={() => setShowEditGroup(false)}
        />
      )}
    </div>
  );
}