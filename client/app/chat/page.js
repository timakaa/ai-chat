import Sidebar from "@/components/Sidebar";
import Chat from "@/components/Chat";

export default async function ChatPage() {
  return (
    <div className='flex h-screen bg-[#0e0e0e]'>
      <Sidebar />
      <Chat />
    </div>
  );
}
