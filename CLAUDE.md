# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev              # Start Next.js dev server (localhost:3000)
npx convex dev           # Start Convex backend (run in separate terminal)

# Build & Lint
npm run build            # Production build
npm run lint             # Run ESLint

# Environment setup
# Copy .env.local.example to .env.local with your Clerk + Convex credentials
```

## Architecture

**Stack:** Next.js 15 (App Router) + Convex (real-time backend) + Clerk (auth) + Tailwind CSS v4 + shadcn/ui

**Auth Flow:** Clerk authentication → `UserSync` component upserts user into Convex `users` table on sign-in.

**Data Flow:** All mutations/queries live in `/convex/`. Components use `useQuery`/`useMutation` from `convex/react` with generated `api` types. Convex live queries push updates automatically—no polling.

**Key Convex Tables:**
- `users`: Clerk auth + presence (online/lastSeen)
- `conversations`: DM + group metadata, typing state
- `messages`: Content, reactions array, seenBy array

**Core Patterns:**
- DM conversations created on first message via `getOrCreateConversation`
- Group chats: `createGroupConversation`, `updateGroupConversation` (rename/members)
- Reactions: One emoji per user; toggle replaces existing, same emoji removes
- Soft delete: Sets `isDeleted: true` + empty content
- Typing indicator: Single user ID stored per conversation
- Unread tracking: `seenBy` array checked against current user

**UI Structure:**
- `/app/chat/layout.tsx`: Responsive shell (desktop sidebar + mobile drawer)
- `/components/chat/chat-window.tsx`: Unified message view for DM + group
- `/components/notifications/`: In-app toasts + browser push notifications
- `/components/theme/`: Dark/light mode with system preference detection

**Type Safety:** All Convex types auto-generated in `convex/_generated/`—import `Id`, `Doc`, `Api` from there.
