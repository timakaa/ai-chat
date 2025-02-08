"use client";
import React, { useEffect } from "react";
import Dialog from "./Dialog";
import InputForm from "./InputForm";
import useChat from "@/store/chat.store";
import { useConversationMessages } from "@/hooks/chat.hooks";

const Chat = ({ chatId }) => {
  const { setMessages, setConversationId } = useChat();
  const { data: messages } = useConversationMessages(chatId);

  // Эффект для обновления сообщений
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

  return (
    <div className='flex-1 flex flex-col justify-between'>
      <header className='md:hidden relative py-4 font-bold bg-black text-center text-2xl'>
        APHOS AI
      </header>
      <Dialog />
      <InputForm chatId={chatId} />
    </div>
  );
};

export default Chat;
