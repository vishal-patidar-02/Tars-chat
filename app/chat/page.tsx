export default function ChatPage() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6 bg-background px-6 text-center animate-fade-in">

      {/* Decorative icon */}
      <div className="relative flex h-20 w-20 items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-navy/20 dark:border-cream/15 animate-[spin_20s_linear_infinite]" />
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

      {/* Heading */}
      <div className="flex flex-col gap-2">
        <h2 className="text-base font-semibold text-foreground">
          Welcome to Tars Chat
        </h2>
        <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
          Start a conversation with anyone or create a group chat.
        </p>
      </div>

      {/* How-to steps */}
      <div className="flex w-full max-w-xs flex-col gap-2.5">

        {/* Step 1 — mobile */}
        <div className="flex items-start gap-3 rounded-xl border border-border bg-elevated px-4 py-3 text-left md:hidden">
          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-navy/10 dark:bg-cream/10">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 text-navy dark:text-cream">
              <line x1="3" y1="6"  x2="21" y2="6"  />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-medium text-foreground">Open the sidebar</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Tap the menu icon in the top-left</p>
          </div>
        </div>

        {/* Step 1 — desktop */}
        <div className="hidden items-start gap-3 rounded-xl border border-border bg-elevated px-4 py-3 text-left md:flex">
          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-navy/10 dark:bg-cream/10">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 text-navy dark:text-cream">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-medium text-foreground">Search for someone</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Use the search bar in the sidebar to find people</p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex items-start gap-3 rounded-xl border border-border bg-elevated px-4 py-3 text-left">
          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-navy/10 dark:bg-cream/10">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 text-navy dark:text-cream">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-medium text-foreground">Pick a conversation</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Tap any contact to open their chat</p>
          </div>
        </div>

        {/* Step 3 — group */}
        <div className="flex items-start gap-3 rounded-xl border border-border bg-elevated px-4 py-3 text-left">
          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-navy/10 dark:bg-cream/10">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 text-navy dark:text-cream">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              <path d="M20 8v6M23 11h-6" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-medium text-foreground">Or create a group</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Use the group icon next to "Messages" in the sidebar</p>
          </div>
        </div>
      </div>

    </div>
  )
}