"use client";
import React, { useState, useRef, useEffect } from "react";
import { PanelRightOpen, PanelLeftOpen, MessageCirclePlus } from "lucide-react";
import Link from "next/link";
import { useConversations } from "@/hooks/chat.hooks";

const Sidebar = ({ chatId }) => {
  const currentConversationRef = useRef(null);
  const containerRef = useRef(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    localStorage.getItem("isSidebarOpen")
      ? +JSON.parse(localStorage.getItem("isSidebarOpen")) === 1
      : true,
  );

  const { data: conversations = [], isError } = useConversations();

  useEffect(() => {
    if (chatId && currentConversationRef.current && containerRef.current) {
      setTimeout(() => {
        const targetPosition =
          currentConversationRef.current.offsetTop -
          containerRef.current.offsetTop -
          20;

        containerRef.current.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });
      }, 100);
    }
  }, [chatId, conversations]);

  // Update global state when conversations change
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    localStorage.setItem("isSidebarOpen", String(!isSidebarOpen));
  };

  return (
    <div
      className={`bg-[#111111] duration-150 hidden md:flex pt-4 flex-col ${
        isSidebarOpen ? "w-96" : "w-16"
      }`}
    >
      {isSidebarOpen ? (
        <>
          <div className='flex px-4 justify-between text-2xl font-bold'>
            <div>APHOS AI</div>
            <div>
              <button
                className='hover:bg-gray-600/50 p-1 duration-100 cursor-pointer rounded-lg'
                onClick={toggleSidebar}
              >
                <PanelRightOpen />
              </button>
            </div>
          </div>
          <div className='p-4 border-b border-gray-700'>
            <Link
              href='/chat'
              className='px-4 py-2 font-bold w-1/2 duration-150 bg-blue-500 text-white rounded-lg hover:bg-blue-600'
            >
              New Chat +
            </Link>
          </div>
          <div data-chat-container className='flex-1 overflow-y-auto p-4'>
            {isError ? (
              <div className='text-red-500 p-3'>
                Failed to load conversations
              </div>
            ) : (
              conversations?.map((conv, i) => (
                <Link
                  href={`/chat/${conv.id}`}
                  key={i}
                  data-chat-id={conv.id}
                  ref={conv.id === chatId ? currentConversationRef : null}
                  className={`p-3 hover:bg-[#222222] block cursor-pointer rounded-xl ${
                    conv.id == chatId ? "bg-[#333] hover:bg-[#333]" : ""
                  }`}
                >
                  <div className='text-xs text-gray-400'>
                    {new Date(conv.created_at).toLocaleString("en-US", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  <div className='text-gray-300 text-sm truncate'>
                    {`${
                      conv?.title?.length >= 20
                        ? conv.title.slice(0, 20) + "..."
                        : conv.title
                    }` || "New Conversation"}
                  </div>
                </Link>
              ))
            )}
          </div>
        </>
      ) : (
        <div className='flex flex-col items-center space-y-4'>
          <div className='flex items-center justify-center'>
            <button
              className='hover:bg-gray-600/50 p-1 duration-100 cursor-pointer rounded-lg'
              onClick={toggleSidebar}
            >
              <PanelLeftOpen />
            </button>
          </div>
          <div className='flex items-center justify-center'>
            <Link
              href='/chat'
              className='hover:bg-gray-600/50 p-1 duration-100 cursor-pointer rounded-lg'
            >
              <MessageCirclePlus />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
