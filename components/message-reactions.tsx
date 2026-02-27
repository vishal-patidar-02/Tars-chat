"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

const EMOJIS = ["👍", "❤️", "😂", "😮", "😢"] as const;

interface Reaction {
  emoji: string;
  userId: Id<"users">;
}

interface Props {
  messageId: Id<"messages">;
  meId: Id<"users">;
  reactions: Reaction[];
  isMe: boolean;
  isDeleted: boolean;
  /* names keyed by userId for tooltip display */
  userNames: Record<string, string>;
}

/* ── Group reactions by emoji ── */
function groupReactions(reactions: Reaction[]) {
  const map = new Map<string, Id<"users">[]>();
  for (const r of reactions) {
    if (!map.has(r.emoji)) map.set(r.emoji, []);
    map.get(r.emoji)!.push(r.userId);
  }
  return map;
}

export function MessageReactions({ messageId, meId, reactions, isMe, isDeleted, userNames }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pendingEmoji, setPendingEmoji] = useState<string | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const toggleReaction = useMutation(api.messages.toggleReaction);

  /* Close picker on outside click */
  useEffect(() => {
    if (!pickerOpen) return;
    function handle(e: MouseEvent) {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [pickerOpen]);

  async function handlePick(emoji: string) {
    setPickerOpen(false);
    setPendingEmoji(emoji);
    try {
      await toggleReaction({ messageId, userId: meId, emoji });
    } finally {
      setPendingEmoji(null);
    }
  }

  async function handlePillClick(emoji: string) {
    setPendingEmoji(emoji);
    try {
      await toggleReaction({ messageId, userId: meId, emoji });
    } finally {
      setPendingEmoji(null);
    }
  }

  const grouped = groupReactions(reactions);
  const myReaction = reactions.find((r) => r.userId === meId)?.emoji ?? null;
  const hasReactions = reactions.length > 0;

  if (isDeleted) return null;

  return (
    <div className={`relative flex items-center gap-1 ${isMe ? "flex-row-reverse" : "flex-row"}`}>

      {/* ── Reaction pills ── */}
      {hasReactions && (
        <div className={`flex flex-wrap gap-1 ${isMe ? "justify-end" : "justify-start"}`}>
          {Array.from(grouped.entries()).map(([emoji, userIds]) => {
            const isMine = userIds.includes(meId);
            const isPending = pendingEmoji === emoji;

            /* Build tooltip text */
            const names = userIds
              .map((uid) => (uid === meId ? "You" : (userNames[uid] ?? "Someone")))
              .join(", ");

            return (
              <div key={emoji} className="group/pill relative">
                <button
                  onClick={() => handlePillClick(emoji)}
                  disabled={!!pendingEmoji}
                  className={`
                    flex items-center gap-1 rounded-full border px-2 py-0.5
                    text-xs font-medium transition-all duration-150 select-none
                    ${isPending ? "scale-90 opacity-60" : "scale-100 opacity-100"}
                    ${
                      isMine
                        ? "border-navy/40 bg-navy/10 text-navy dark:border-cream/30 dark:bg-cream/10 dark:text-cream"
                        : "border-border bg-elevated text-foreground hover:border-navy/30 hover:bg-navy/5 dark:hover:border-cream/20 dark:hover:bg-cream/5"
                    }
                  `}
                  aria-label={`${emoji} ${userIds.length}${isMine ? " (yours, click to remove)" : ""}`}
                >
                  <span className="text-[13px] leading-none">{emoji}</span>
                  <span className={`text-[11px] leading-none tabular-nums ${isMine ? "font-semibold" : ""}`}>
                    {userIds.length}
                  </span>
                </button>

                {/* Tooltip */}
                <div
                  className={`
                    pointer-events-none absolute bottom-full mb-1.5 z-30
                    ${isMe ? "right-0" : "left-0"}
                    whitespace-nowrap rounded-lg border border-border bg-popover px-2.5 py-1.5
                    text-[11px] text-foreground shadow-lg
                    opacity-0 translate-y-1 transition-all duration-150
                    group-hover/pill:opacity-100 group-hover/pill:translate-y-0
                  `}
                >
                  <span className="mr-1">{emoji}</span>
                  {names}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Add reaction trigger ── */}
      <div className="relative">
        <button
          ref={triggerRef}
          onClick={() => setPickerOpen((v) => !v)}
          disabled={!!pendingEmoji}
          className={`
            flex h-6 w-6 items-center justify-center rounded-full border border-border
            bg-elevated text-muted-foreground transition-all duration-150
            hover:border-navy/30 hover:bg-muted hover:text-foreground hover:scale-110
            dark:hover:border-cream/20
            opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100
            ${pickerOpen ? "sm:opacity-100 bg-muted" : ""}
          `}
          aria-label="Add reaction"
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
            <circle cx="12" cy="12" r="10" />
            <path d="M8 14s1.5 2 4 2 4-2 4-2" />
            <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </button>

        {/* ── Emoji picker popover ── */}
        {pickerOpen && (
          <div
            ref={pickerRef}
            className={`
              absolute bottom-full mb-2 z-40
              ${isMe ? "right-0" : "left-0"}
              flex items-center gap-0.5 rounded-2xl border border-border
              bg-popover px-2 py-1.5 shadow-xl
              animate-scale-in
            `}
          >
            {EMOJIS.map((emoji) => {
              const isMine = myReaction === emoji;
              return (
                <button
                  key={emoji}
                  onClick={() => handlePick(emoji)}
                  className={`
                    relative flex h-9 w-9 items-center justify-center rounded-xl
                    text-[20px] transition-all duration-100
                    hover:scale-125 hover:bg-muted active:scale-110
                    ${isMine ? "bg-navy/10 ring-1 ring-navy/30 dark:bg-cream/10 dark:ring-cream/20" : ""}
                  `}
                  aria-label={`React with ${emoji}${isMine ? " (remove)" : ""}`}
                  title={isMine ? "Click to remove" : emoji}
                >
                  {emoji}
                  {/* Active indicator dot */}
                  {isMine && (
                    <span className="absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-navy dark:bg-cream" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}