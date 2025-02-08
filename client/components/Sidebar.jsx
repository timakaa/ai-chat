"use client";
import React, { useEffect, useState } from "react";
import useChat from "@/store/chat.store";
import { PanelRightOpen, PanelLeftOpen, MessageCirclePlus } from "lucide-react";

const Sidebar = () => {
  const {
    conversations,
    setConversations,
    setMessages,
    setConversationId,
    conversationId,
  } = useChat();
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    localStorage.getItem("isSidebarOpen")
      ? +JSON.parse(localStorage.getItem("isSidebarOpen")) === 1
      : true,
  );

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/conversations`,
      );
      const data = await response.json();
      // Ensure we always set an array
      setConversations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      setConversations([]); // Set empty array on error
    }
  };

  const loadConversation = async (id) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/conversations/${id}`,
      );
      const messages = await response.json();
      setMessages(messages);
      setConversationId(id);
    } catch (error) {
      console.error("Error loading conversation:", error);
    }
  };

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
            <button
              onClick={() => {
                setMessages([]);
                setConversationId(null);
              }}
              className='px-4 py-2 font-bold w-1/2 duration-150 bg-blue-500 text-white rounded-lg hover:bg-blue-600'
            >
              New Chat +
            </button>
          </div>
          <div className='flex-1 overflow-y-auto p-4'>
            {(Array.isArray(conversations) ? conversations : [])?.map(
              (conv) => (
                <div
                  key={conv.id}
                  onClick={() => loadConversation(conv.id)}
                  className={`p-3 hover:bg-[#222222] cursor-pointer rounded-xl ${
                    conv.id === conversationId
                      ? "bg-[#333] hover:bg-[#333]"
                      : ""
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
                </div>
              ),
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
            <button
              onClick={() => {
                setMessages([]);
                setConversationId(null);
              }}
              className='hover:bg-gray-600/50 p-1 duration-100 cursor-pointer rounded-lg'
            >
              <MessageCirclePlus />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
