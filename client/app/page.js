"use client";
import Sidebar from "@/components/Sidebar";
import Chat from "@/components/Chat";

export default function Home() {
  return (
    <div className='flex h-screen bg-[#0e0e0e]'>
      <Sidebar />
      <Chat />
    </div>
  );
}
