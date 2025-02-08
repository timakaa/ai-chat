import React, { useRef, useState, useEffect } from "react";
import useChat from "@/store/chat.store";
import { SendHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCreateConversation, useSendMessage } from "@/hooks/chat.hooks";

const InputForm = ({ chatId }) => {
  const {
    setMessages,
    setIsLoading,
    conversationId,
    setConversationId,
    error,
    setError,
    setConversations,
    messages,
    setIsAnswering,
    messagesEndRef,
    isAnswering,
  } = useChat();
  const router = useRouter();
  const [input, setInput] = useState("");
  const inputRef = useRef(null);
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  const createConversation = useCreateConversation();
  const sendMessage = useSendMessage();

  // Add useEffect to update the ref in store when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [conversationId, isAnswering]);

  const createAndRedirectToChat = async (title) => {
    if (!conversationId) {
      setIsCreatingChat(true);
      try {
        const data = await createConversation.mutateAsync(title);
        setConversationId(data.id);
        setConversations((prev) => {
          const prevArray = Array.isArray(prev) ? prev : [];
          return [
            {
              id: data.id,
              title: title.slice(0, 20),
              created_at: new Date(),
            },
            ...prevArray,
          ];
        });
        router.replace(`/chat/${data.id}`);
        return data.id;
      } finally {
        setIsCreatingChat(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isAnswering || createConversation.isPending) return;

    const userMessage = input.replace(/\r\n/g, "\n");
    const convId = await createAndRedirectToChat(userMessage);

    setIsLoading(true);
    setIsAnswering(true);
    setInput("");

    if (inputRef.current) {
      inputRef.current.style.height = "48px";
    }

    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    messagesEndRef.current.scrollIntoView({ behavior: "smooth" });

    try {
      const response = await sendMessage.mutateAsync({
        prompt: userMessage,
        conversation_id: convId,
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      setIsLoading(false);
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
      const reader = response.body.getReader();
      let fullAssistantMessage = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(6));
            if (data.text) {
              fullAssistantMessage += data.text;
              setMessages((prev) => [
                ...prev.slice(0, -1),
                { role: "assistant", content: fullAssistantMessage },
              ]);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Something went wrong. Try to reload the page.");
    } finally {
      setIsLoading(false);
      setIsAnswering(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (e.shiftKey) {
        e.preventDefault();
        setInput((prev) => prev + "\n");
        setTimeout(() => {
          e.target.style.height = "auto";
          e.target.style.height = e.target.scrollHeight + "px";
          e.target.scrollTop = e.target.scrollHeight;
        }, 0);
      } else {
        e.preventDefault();
        handleSubmit(e);
      }
    }
  };

  const handleChange = (e) => {
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
    e.target.scrollTop = e.target.scrollHeight; // Auto-scroll to bottom
    setInput(e.target.value);
  };

  const handlePaste = (e) => {
    e.preventDefault();
    // Preserve exact whitespace and formatting
    const text = e.clipboardData
      .getData("text/plain")
      .replace(/\t/g, "    ") // Replace tabs with 4 spaces
      .replace(/\r\n/g, "\n") // Normalize line endings
      .replace(/^ +/gm, (match) => match); // Preserve leading spaces

    // Insert text at cursor position
    const start = e.target.selectionStart;
    const end = e.target.selectionEnd;
    const currentValue = e.target.value;
    const newValue =
      currentValue.substring(0, start) + text + currentValue.substring(end);
    setInput(newValue);

    // Update cursor position after paste
    setTimeout(() => {
      e.target.selectionStart = start + text.length;
      e.target.selectionEnd = start + text.length;
    }, 0);

    // Update textarea height after paste
    setTimeout(() => {
      e.target.style.height = "auto";
      e.target.style.height = e.target.scrollHeight + "px";
      e.target.scrollTop = e.target.scrollHeight;
    }, 0);
  };

  return (
    <div className='p-4 border rounded-2xl border-gray-800 max-w-3xl mb-2 w-full mx-auto'>
      <form onSubmit={handleSubmit} className='flex gap-2'>
        <textarea
          ref={inputRef}
          value={input}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder='Type your message...'
          className='resize-none p-3 rounded-lg w-full bg-[#222222] text-white focus:outline-none min-h-[40px] h-auto max-h-[200px] overflow-y-auto align-bottom whitespace-pre'
          style={{ tabSize: 4 }}
          rows={1}
        />
        <button
          type='submit'
          disabled={isAnswering || input.trim() === "" || error}
          className='px-4 py-2 bg-[#333] rounded-lg hover:bg-[#222] cursor-pointer duration-150 disabled:opacity-50'
        >
          <SendHorizontal />
        </button>
      </form>
    </div>
  );
};

export default InputForm;
