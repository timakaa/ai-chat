"use client";
import React, { useEffect, useState } from "react";
import Dialog from "./Dialog";
import InputForm from "./InputForm";
import useChat from "@/store/chat.store";
import { useConversationMessages, useConversations } from "@/hooks/chat.hooks";
import { PanelLeftOpen, PanelRightOpen, Plus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";

const Chat = ({ chatId }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { setMessages, setConversationId } = useChat();
  const { data: messages } = useConversationMessages(chatId);
  const router = useRouter();

  const { data: conversations } = useConversations();

  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      setConversationId(null);
      return;
    }

    if (messages) {
      setMessages(messages);
      setConversationId(chatId);

      const currentChat = document.querySelector(`[data-chat-id="${chatId}"]`);

      if (currentChat) {
        currentChat.scrollIntoView({
          behavior: "instant",
          block: "center",
          inline: "nearest",
        });
      }
    }
  }, [chatId, messages, setMessages, setConversationId]);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div className='flex-1 flex flex-col justify-between'>
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
      <AnimatePresence mode='wait'>
        {isSidebarOpen ? (
          <div className='relative w-screen'>
            <motion.div
              initial={{ background: "rgba(0, 0, 0, 0)" }}
              animate={{ background: "rgba(0, 0, 0, 0.5)" }}
              exit={{ background: "rgba(0, 0, 0, 0)" }}
              transition={{ duration: 0.1, ease: "easeInOut" }}
              className={`fixed motion-opacity-loop-100 duration-200 z-20 h-full left-0 top-14 w-screen`}
              onClick={(e) => {
                setIsSidebarOpen(false);
              }}
            >
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className='bg-[#111] h-full'
                style={{ width: "65%" }}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <div className='p-4'>
                  <button
                    onClick={() => {
                      router.push("/chat");
                      setIsSidebarOpen(false);
                    }}
                    className='flex w-full bg-blue-500 rounded-lg flex-col overflow-y-auto p-4'
                  >
                    <div className='flex justify-between items-center'>
                      <h2 className='text-xl font-bold'>New Chat</h2>
                      <Plus width={20} height={20} />
                    </div>
                  </button>
                </div>
                <div className='flex flex-col overflow-y-auto h-screen p-4 pb-40'>
                  {conversations?.map((conversation) => (
                    <button
                      key={conversation.id}
                      className={`p-3 rounded-lg block w-full text-left hover:bg-[#222] cursor-pointer ${
                        chatId == conversation.id
                          ? "bg-[#333] hover:bg-[#333]"
                          : ""
                      }`}
                      onClick={() => {
                        router.push(`/chat/${conversation.id}`);
                        setIsSidebarOpen(false);
                      }}
                    >
                      {conversation.title}
                    </button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        ) : (
          ""
        )}
      </AnimatePresence>
      <Dialog />
      <InputForm chatId={chatId} />
    </div>
  );
};

export default Chat;
