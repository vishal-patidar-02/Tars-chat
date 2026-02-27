
/** Reusable shimmer box */
function Bone({ className }: { className?: string }) {
  return (
    <div className={`skeleton-shimmer rounded-lg ${className ?? ""}`} />
  )
}

/* ── Sidebar list skeleton ── */
export function SidebarSkeleton() {
  return (
    <div className="flex flex-col gap-1 px-2">
      {Array.from({ length: 7 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5"
          style={{ opacity: 1 - i * 0.1 }}
        >
          <Bone className="h-10 w-10 shrink-0 rounded-full" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Bone className={`h-3 rounded-md ${i % 3 === 0 ? "w-3/4" : i % 3 === 1 ? "w-2/3" : "w-1/2"}`} />
            <Bone className={`h-2.5 rounded-md ${i % 2 === 0 ? "w-1/2" : "w-2/5"}`} />
          </div>
          {i % 3 === 0 && <Bone className="h-5 w-5 rounded-full shrink-0" />}
        </div>
      ))}
    </div>
  )
}

/* ── Chat header skeleton ── */
export function ChatHeaderSkeleton() {
  return (
    <div className="flex items-center gap-3 border-b border-border glass px-5 py-3.5 shrink-0">
      <Bone className="h-10 w-10 shrink-0 rounded-full" />
      <div className="flex flex-col gap-2">
        <Bone className="h-3 w-36 rounded-md" />
        <Bone className="h-2.5 w-24 rounded-md" />
      </div>
    </div>
  )
}

/* ── Chat messages skeleton ── */
export function ChatMessagesSkeleton() {
  const shapes = [
    { side: "right", width: "w-2/5" },
    { side: "left",  width: "w-1/3" },
    { side: "right", width: "w-3/5" },
    { side: "left",  width: "w-2/5" },
    { side: "right", width: "w-1/4" },
    { side: "left",  width: "w-1/2" },
    { side: "right", width: "w-2/5" },
  ]

  return (
    <div className="flex flex-col gap-3 p-5">
      {shapes.map((s, i) => (
        <div
          key={i}
          className={`flex ${s.side === "right" ? "justify-end" : "justify-start"}`}
        >
          {s.side === "left" && (
            <Bone className="mr-2.5 h-7 w-7 shrink-0 self-end rounded-full" />
          )}
          <Bone className={`h-10 ${s.width} max-w-xs rounded-2xl`} />
        </div>
      ))}
    </div>
  )
}

/* ── Full chat window skeleton ── */
export function ChatWindowSkeleton() {
  return (
    <div className="flex h-full w-full flex-col bg-background">
      <ChatHeaderSkeleton />
      {/* min-h-0 is critical: lets flex-1 shrink below its content size */}
      <div className="min-h-0 flex-1 overflow-hidden">
        <ChatMessagesSkeleton />
      </div>
      <div className="border-t border-border glass px-4 py-4 shrink-0">
        <div className="flex gap-2">
          <Bone className="h-10 flex-1 rounded-xl" />
          <Bone className="h-10 w-20 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

/* ── Preparing chat (user / conversation resolving) ── */
export function PreparingChatSkeleton() {
  return (
    <div className="flex h-full w-full flex-col bg-background animate-fade-in">
      <ChatHeaderSkeleton />
      {/* min-h-0 prevents the messages area from pushing the input off screen */}
      <div className="min-h-0 flex-1 overflow-hidden">
        <ChatMessagesSkeleton />
      </div>
      <div className="border-t border-border glass px-4 py-4 shrink-0">
        <div className="flex gap-2">
          <Bone className="h-10 flex-1 rounded-xl" />
          <Bone className="h-10 w-20 rounded-xl" />
        </div>
      </div>
    </div>
  )
}