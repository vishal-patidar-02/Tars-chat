# 🚀 Tars Chat

Tars Chat is a modern, real-time messaging web application built using **Next.js, Convex, Clerk Authentication, and Tailwind CSS**.

It provides a clean and responsive chat experience with real-time updates, group conversations, message reactions, smart notifications, unread tracking, typing indicators, and more.

---

## ✨ Features

### 💬 Real-Time Messaging
- Instant message updates using Convex's live queries
- No manual refresh required
- Live conversation syncing across all tabs and devices

### 👥 Group Chats
- Create group conversations with a custom name and multiple members
- Add or remove members from any group at any time
- Rename groups on the fly
- Group header shows member count and first-name preview of participants
- Per-message sender name and avatar shown inside group threads

### 😄 Message Reactions
- React to any message with 5 fixed emojis: 👍 ❤️ 😂 😮 😢
- One reaction per user per message — clicking a different emoji replaces the previous one
- Clicking the same emoji again removes your reaction
- Reaction pills show grouped counts below each message
- Hover tooltip reveals exactly who reacted with each emoji

### 🔔 Notifications
- **In-app toasts** — slide-in notification cards for new messages when you're in a different chat
- **Browser push notifications** — native OS-level alerts when the tab is hidden or in the background
- Clicking any notification navigates directly to the relevant conversation
- Permission is requested once, non-intrusively, after sign-in
- Notifications are suppressed if you're already viewing that conversation

### 👀 Unread Message Count
- Real-time unread badge per conversation in the sidebar
- Automatically clears when the conversation is opened

### 🧠 Smart Auto-Scroll
- Automatically scrolls to the latest message when at the bottom
- Shows a floating "New Messages ↓" button if you've scrolled up

### ✍️ Typing Indicator
- Shows animated dots when the other person (or a group member) is typing
- Clears automatically when they stop

### 🗑 Soft Delete
- Users can delete their own messages
- Displays *"This message was deleted"* instead of hard-removing data
- Deleted messages cannot be reacted to

### 🔎 User Search
- Fuzzy search powered by Fuse.js
- Real-time filtering across all users

### 🕒 Smart Timestamps
- Today → time only (e.g., 2:34 PM)
- Older → date + time
- Different year → full date with year

### 🎨 Modern UI
- Fully responsive — desktop sidebar + mobile slide-out drawer
- Dark / light mode with system preference detection and manual toggle
- Smooth animations and skeleton loading states
- Professional chat bubble layout with message grouping

---

## 🏗 Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 15** | Frontend framework (App Router) |
| **Convex** | Real-time backend & database |
| **Clerk** | Authentication & user management |
| **Tailwind CSS v4** | Styling |
| **Fuse.js** | Fuzzy search |
| **TypeScript** | Type safety |

---

## 📂 Project Structure

```
/app
  /chat
    /[userId]
      page.tsx              ← DM chat room
    /group
      /[groupId]
        page.tsx            ← Group chat room
    layout.tsx              ← Chat shell (header + sidebar)
    page.tsx                ← Empty/welcome state
  /(auth)
    /sign-in/[[...sign-in]]
      page.tsx
    /sign-up/[[...sign-up]]
      page.tsx
  globals.css
  layout.tsx                ← Root layout (providers)
  page.tsx                  ← Redirect → /chat

/components
  /chat
    chat-window.tsx         ← Main message UI (DM + group)
    message-reactions.tsx   ← Emoji picker + reaction pills
    skeletons.tsx           ← Loading states
  /group
    create-group-modal.tsx  ← New group flow
    edit-group-modal.tsx    ← Edit name / members
  /layout
    header.tsx              ← App top bar
    sidebar.tsx             ← Conversations list + search
  /notifications
    notification-provider.tsx  ← Global notification context
    notification-toast.tsx     ← In-app toast UI
    use-notifications.ts       ← Hook: watches Convex, fires alerts
  /theme
    theme-provider.tsx
    theme-toggle.tsx
  /user
    user-item.tsx           ← Sidebar conversation row
    user-sync.tsx           ← Clerk ↔ Convex user sync
  /ui                       ← shadcn/ui primitives

/convex
  /_generated
  messages.ts               ← All message + conversation mutations/queries
  schema.ts                 ← Database schema
  users.ts                  ← User mutations/queries

/lib
  format-date.ts            ← Timestamp formatting helpers
```

---

## ⚙️ Installation

### 1️⃣ Clone the repository

```bash
git clone https://github.com/your-username/tars-chat.git
cd tars-chat
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Set up environment variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CONVEX_DEPLOYMENT=your_convex_deployment_slug
NEXT_PUBLIC_CONVEX_URL=your_convex_url
```

### 4️⃣ Start the development server

```bash
npm run dev
```

App runs on `http://localhost:3000`

---

## 📡 Backend (Convex)

Run the Convex dev server in a separate terminal:

```bash
npx convex dev
```

---

## 🧠 How It Works

- Users authenticate via Clerk; their profile syncs into Convex on sign-in
- Convex stores users, conversations (DMs + groups), messages, reactions, and typing state
- Real-time Convex queries push updates to all clients instantly — no polling
- Mutations handle sending, deleting, reacting, typing, marking seen, and managing group membership

---

## 🔐 Authentication Flow

1. User signs in via Clerk
2. `UserSync` component upserts the Clerk user into Convex (`users` table)
3. Conversations are created automatically on first message
4. `beforeunload` event marks the user offline when they close the tab

---

## 📱 Responsive Design

- **Desktop:** Fixed sidebar (272px) + full-height chat window
- **Mobile:** Slide-out drawer sidebar triggered by hamburger menu
- Bubble widths and padding optimised for all screen sizes
- Emoji picker and reaction pills adapt alignment based on message side

---

## 🗄 Database Schema (Convex)

```
users
  clerkId, name, image, online, lastSeen

conversations
  members[], updatedAt, typing?,
  isGroup?, name?, createdBy?          ← group fields

messages
  conversationId, senderId, content, createdAt,
  seenBy[]?, isDeleted?,
  reactions[]? { emoji, userId }       ← reaction entries
```

---

## 🛠 Potential Future Improvements

- File & image upload
- Voice messages
- Message edit
- Pinned messages
- Threaded replies
- End-to-end encryption

---

## 👨‍💻 Author

**Vishal Patidar**

Built as a full-stack real-time chat system to demonstrate modern SaaS architecture, real-time application design, and production-quality UX patterns.

---

## ⭐ If You Like This Project

Give it a star ⭐ on GitHub and feel free to contribute!