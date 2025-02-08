import Sidebar from "@/components/Sidebar";
import Chat from "@/components/Chat";

export default async function ChatPage({ params }) {
  const par = await params;
  const chatId = par.id;

  return (
    <div className='flex h-screen bg-[#0e0e0e]'>
      <Sidebar chatId={chatId} />
      <Chat chatId={chatId} />
    </div>
  );
}
