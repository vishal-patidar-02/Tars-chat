import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import ChatWindow from "@/components/chat-window"

export default function ChatPage() {
  return (
    <div className="flex h-screen flex-col">

      {/* Top */}
      <Header />

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* Chat */}
        <ChatWindow />

      </div>
    </div>
  )
}