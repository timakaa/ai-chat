"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  PanelRightOpen,
  PanelLeftOpen,
  MessageCirclePlus,
  Ellipsis,
} from "lucide-react";
import Link from "next/link";
import { useConversations } from "@/hooks/chat.hooks";
import ConversationItem from "./ui/ConversationItem";

const Sidebar = ({ chatId }) => {
  const currentConversationRef = useRef(null);
  const containerRef = useRef(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    localStorage.getItem("isSidebarOpen")
      ? localStorage.getItem("isSidebarOpen") === "true"
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
        isSidebarOpen ? "w-72" : "w-16"
      }`}
    >
      {isSidebarOpen ? (
        <>
          <div className='flex px-4 justify-between text-2xl font-bold'>
            <div>Tima AI</div>
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
                <ConversationItem key={i} conv={conv} chatId={chatId} />
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
