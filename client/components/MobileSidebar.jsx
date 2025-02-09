"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useConversations } from "@/hooks/chat.hooks";
import MobileConversationItem from "./ui/MobileConversationItem";

const MobileSidebar = ({ chatId, isSidebarOpen, setIsSidebarOpen }) => {
  const router = useRouter();
  const { data: conversations = [] } = useConversations();

  return (
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
                  className='flex w-full bg-blue-500 rounded-lg flex-col overflow-y-auto p-3'
                >
                  <div className='flex justify-between items-center'>
                    <h2 className='text-base font-bold'>New Chat</h2>
                    <Plus width={16} height={16} />
                  </div>
                </button>
              </div>
              <div className='flex flex-col overflow-y-auto h-screen p-4 pb-40'>
                {conversations?.map((conversation, i) => (
                  <MobileConversationItem
                    key={i}
                    conversation={conversation}
                    chatId={chatId}
                    setIsSidebarOpen={setIsSidebarOpen}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      ) : (
        ""
      )}
    </AnimatePresence>
  );
};

export default MobileSidebar;
