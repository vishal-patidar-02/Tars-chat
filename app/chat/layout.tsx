import Header from "@/components/header"
import Sidebar from "@/components/sidebar"

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen flex-col bg-[#0a0f1c]">

      <Header />

      <div className="flex flex-1 overflow-hidden">

        <div className="hidden md:block w-72">
          <Sidebar />
        </div>

        <div className="flex flex-1">
          {children}
        </div>

      </div>
    </div>
  )
}