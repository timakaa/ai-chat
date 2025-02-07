import React, { useRef, useState, useEffect } from "react";
import useChat from "@/store/chat.store";
import { SendHorizontal } from "lucide-react";

const InputForm = () => {
  const {
    isLoading,
    setMessages,
    setIsLoading,
    conversationId,
    setConversationId,
    error,
    setError,
    setConversations,
    messages,
  } = useChat();
  const [input, setInput] = useState("");
  const inputRef = useRef(null);

  // Add useEffect to update the ref in store when component mounts
  useEffect(() => {
    inputRef.current.focus();
  }, [conversationId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    const userMessage = input;
    setInput("");

    // Add user message immediately
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

    try {
      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: userMessage,
          conversation_id: conversationId,
        }),
      });
      setIsLoading(false);

      if (!response.ok) {
        setError("Something went wrong. Try to reload the page.");
        return;
      }

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const reader = response.body.getReader();
      let fullAssistantMessage = "";
      let isConversationIdSet = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));

              if (
                data.conversation_id &&
                !conversationId &&
                !isConversationIdSet
              ) {
                isConversationIdSet = true;
                const newConversationId = data.conversation_id;
                setConversationId(newConversationId);
                if (messages.length <= 2) {
                  setConversations((prev) => {
                    const prevArray = Array.isArray(prev) ? prev : [];
                    return [
                      {
                        id: newConversationId,
                        title: userMessage.slice(0, 20),
                        created_at: new Date(),
                      },
                      ...prevArray,
                    ];
                  });
                }
              }

              if (data.text) {
                fullAssistantMessage += data.text;

                setMessages((prev) => [
                  ...prev.slice(0, -1),
                  { role: "assistant", content: fullAssistantMessage },
                ]);
              }
            } catch (e) {
              console.error("Error parsing SSE data:", e);
              setError("Something went wrong. Try to reload the page.");
            }
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Something went wrong. Try to reload the page.");
    }
  };

  return (
    <div className='p-4 border-t border-gray-700'>
      <form onSubmit={handleSubmit} className='flex gap-2'>
        <input
          ref={inputRef}
          type='text'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='Type your message...'
          className='flex-1 p-3 rounded-lg bg-[#222222] text-white focus:outline-none focus:outline-[#555]'
          disabled={isLoading}
        />
        <button
          type='submit'
          disabled={isLoading || input.trim() === "" || error}
          className='px-4 py-2 bg-[#333] rounded-lg hover:bg-[#222] cursor-pointer duration-150 disabled:opacity-50'
        >
          <SendHorizontal />
        </button>
      </form>
    </div>
  );
};

export default InputForm;
