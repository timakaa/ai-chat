"use client";
import { Ellipsis, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState, useRef } from "react";
import { useClickAway } from "@/hooks/useClickAway";
import { useDeleteConversation } from "@/hooks/chat.hooks";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";

const ConversationItem = ({ conv, chatId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const router = useRouter();

  useClickAway({ func: () => setIsEditing(false), refs: [menuRef, buttonRef] });

  const { mutate: deleteConversation } = useDeleteConversation();

  return (
    <div
      className={`flex justify-between items-center relative hover:bg-[#222222] cursor-pointer rounded-xl ${
        conv.id == chatId ? "bg-[#333] hover:bg-[#333]" : ""
      }`}
    >
      <Link
        href={`/chat/${conv.id}`}
        data-chat-id={conv.id}
        className='pl-4 py-2 w-full'
        ref={conv.id === chatId ? currentConversationRef : null}
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
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation();

          setIsEditing((prev) => !prev);
        }}
        className='text-sm text-gray-400 h-full px-4'
      >
        <Ellipsis width={16} height={16} />
      </button>
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.1 }}
            ref={menuRef}
            className='absolute top-[58px] right-0 w-3/4 z-30 bg-[#222] rounded-lg'
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (conv.id == chatId) {
                  router.replace("/chat");
                }
                deleteConversation(conv.id);
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
        )}
      </AnimatePresence>
    </div>
  );
};

export default ConversationItem;
