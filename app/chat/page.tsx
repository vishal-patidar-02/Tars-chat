export default function ChatPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 bg-background px-6 text-center animate-fade-in">

      {/* Decorative ring icon */}
      <div className="relative flex h-20 w-20 items-center justify-center">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-navy/20 dark:border-cream/15 animate-[spin_20s_linear_infinite]" />
        {/* Inner circle */}
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
      </div>

      {/* Text */}
      <div className="flex flex-col gap-2">
        <h2 className="text-base font-semibold text-foreground">
          Welcome to Tars Chat
        </h2>
        <p className="text-sm text-muted-foreground max-w-64 leading-relaxed">
          Select a conversation from the sidebar or search for someone to start chatting.
        </p>
      </div>

      {/* Keyboard hint (desktop only) */}
      <div className="hidden items-center gap-1.5 rounded-lg border border-border bg-elevated px-3 py-1.5 md:flex">
        <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
          ⌘
        </kbd>
        <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
          K
        </kbd>
        <span className="text-xs text-muted-foreground">to search</span>
      </div>
    </div>
  )
}