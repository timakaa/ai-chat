"use client";
import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Ellipsis, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useClickAway } from "@/hooks/useClickAway";
import { useDeleteConversation } from "@/hooks/chat.hooks";

const MobileConversationItem = ({ conversation, chatId, setIsSidebarOpen }) => {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const { mutate: deleteConversation } = useDeleteConversation();

  useClickAway({ func: () => setIsEditing(false), refs: [menuRef, buttonRef] });

  return (
    <div
      key={conversation.id}
      className={`rounded-lg block w-full text-left cursor-pointer`}
    >
      <div
        className={`flex justify-between rounded-lg hover:bg-[#222] items-center relative ${
          chatId == conversation.id ? "bg-[#333] hover:bg-[#333]" : ""
        }`}
      >
        <button
          className='pl-4 py-3 w-full text-left'
          onClick={() => {
            router.push(`/chat/${conversation.id}`);
            setIsSidebarOpen(false);
          }}
        >
          {conversation.title}
        </button>
        <button
          ref={buttonRef}
          onClick={(e) => {
            e.stopPropagation();

            setIsEditing((prev) => !prev);
          }}
          className='text-sm text-gray-400 h-full py-4 pr-4'
        >
          <Ellipsis width={16} height={16} />
        </button>
        <AnimatePresence>
          {isEditing ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.1 }}
              ref={menuRef}
              className='absolute top-[52px] right-0 w-3/4 z-30 bg-[#222] rounded-lg'
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (conversation.id == chatId) {
                    router.replace("/chat");
                  }
                  deleteConversation(conversation.id);
                  setIsEditing(false);
                }}
                className='flex items-center p-2 w-full relative text-red-500 gap-2'
              >
                <div>
                  <Trash2 width={16} height={16} />
                </div>
                <div>Delete</div>
              </button>
            </motion.div>
          ) : (
            ""
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MobileConversationItem;
