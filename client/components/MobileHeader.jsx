"use client";
import { PanelLeftOpen, PanelRightOpen, Plus } from "lucide-react";
import { useState } from "react";
import MobileSidebar from "./MobileSidebar";

const MobileHeader = ({ chatId }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };
  return (
    <>
      <header className='md:hidden relative py-4 font-bold bg-[#111] text-center text-2xl grid grid-cols-3'>
        <div className='flex justify-start ml-4'>
          <button
            onClick={toggleSidebar}
            className='hover:bg-gray-600/50 p-1 duration-100 cursor-pointer rounded-lg'
          >
            {!isSidebarOpen ? <PanelLeftOpen /> : <PanelRightOpen />}
          </button>
        </div>
        <div>Tima AI</div>
      </header>
      <MobileSidebar
        chatId={chatId}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
    </>
  );
};

export default MobileHeader;
