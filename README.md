# 🚀 Tars Chat

Tars Chat is a modern, real-time messaging web application built using **Next.js, Convex, Clerk Authentication, and Tailwind CSS**.

It provides a clean and responsive chat experience with real-time updates, smart auto-scrolling, unread message tracking, soft message deletion, and typing indicators.

---

## ✨ Features

### 💬 Real-Time Messaging
- Instant message updates using Convex
- No manual refresh required
- Live conversation syncing

### 👀 Unread Message Count
- Real-time unread badge in sidebar
- Automatically clears when conversation is opened

### 🧠 Smart Auto-Scroll
- Automatically scrolls when at bottom
- Shows "New Messages" button if user scrolls up

### ✍️ Typing Indicator
- Shows when the other user is typing
- Clears automatically when typing stops

### 🗑 Soft Delete
- Users can delete their own messages
- Displays *"This message was deleted"* instead of removing data

### 🔎 User Search
- Fuzzy search powered by Fuse.js
- Real-time filtering of users

### 🕒 Smart Timestamps
- Today → Shows only time (e.g., 2:34 PM)
- Older → Shows date + time
- Different year → Shows full date with year

### 🎨 Modern UI
- Fully responsive layout
- Dark mode support
- Smooth animations
- Professional chat bubble layout

---

## 🏗 Tech Stack

| Technology | Purpose |
|------------|----------|
| **Next.js 14** | Frontend framework |
| **Convex** | Real-time backend & database |
| **Clerk** | Authentication |
| **Tailwind CSS** | Styling |
| **Fuse.js** | Fuzzy search |
| **TypeScript** | Type safety |

---

## 📂 Project Structure

```
/app
  /chat
    /[userId]
      page.tsx
    page.tsx
    layout.tsx
  /sign-in
  /sign-up  
globals.css
layout.ctsx
page.tsx
/components
  chat-window.tsx
  sidebar.tsx
  header.tsx
  skeletons.tsx
  theme-provider.tsx
  theme-toggle.tsx
  user-sync.tsx
  user-item.tsx
  UI/ ... (shadcn components)
/convex
  /_genrated
  messages.ts
  schema.ts
  users.ts
/lib
  convex/ (convex client setup)
  clerk/ (auth helpers)
  format-date.ts
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

### 3️⃣ Setup environment variables

Create a `.env.local` file:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key
CLERK_SECRET_KEY=your_secret
CONVEX_DEPLOYMENT=your_convex_url
NEXT_PUBLIC_CONVEX_URL=your_convex_url
```

---

### 4️⃣ Start development server

```bash
npm run dev
```

App runs on:

```
http://localhost:3000
```

---

## 📡 Backend (Convex)

Make sure Convex is running:

```bash
npx convex dev
```

---

## 🧠 How It Works

- Users authenticate via Clerk
- Convex stores users, conversations, and messages
- Real-time queries update UI instantly
- Mutations handle sending, deleting, marking seen, and typing states

---

## 🔐 Authentication Flow

1. User signs in via Clerk
2. Clerk user ID maps to Convex user
3. Conversations are created automatically
4. Messages sync live between participants

---

## 📱 Responsive Design

- Desktop: Sidebar + Chat window layout
- Mobile: Slide-out sidebar
- Optimized bubble widths for all screen sizes

---

## 🛠 Future Improvements

- Message reactions
- File & image upload
- Voice messages
- Group chats
- Read receipts per user
- Message edit feature
- Push notifications

---

## 👨‍💻 Author

**Vishal Patidar**

Built as a full-stack real-time chat system to demonstrate modern SaaS architecture and real-time application design.

---

## ⭐ If You Like This Project

Give it a star ⭐ on GitHub and feel free to contribute!

---


