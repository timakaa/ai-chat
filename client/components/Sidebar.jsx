import React, { useEffect } from "react";
import useChat from "@/store/chat.store";
const Sidebar = () => {
  const {
    conversations,
    setConversations,
    setMessages,
    setConversationId,
    conversationId,
  } = useChat();

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await fetch("http://localhost:8000/conversations");
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
      const response = await fetch(`http://localhost:8000/conversations/${id}`);
      const messages = await response.json();
      setMessages(messages);
      setConversationId(id);
    } catch (error) {
      console.error("Error loading conversation:", error);
    }
  };

  return (
    <div className='w-96 bg-[#1b1a1a] border-r border-gray-700 flex pt-4 flex-col'>
      <div className='flex justify-center text-2xl font-bold'>APHOS AI</div>
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
        {(Array.isArray(conversations) ? conversations : [])?.map((conv) => (
          <div
            key={conv.id}
            onClick={() => loadConversation(conv.id)}
            className={`p-3 hover:bg-[#222222] cursor-pointer rounded-xl ${
              conv.id === conversationId ? "bg-[#333] hover:bg-[#333]" : ""
            }`}
          >
            <div className='text-xs text-gray-400'>
              {new Date(conv.created_at).toLocaleString()}
            </div>
            <div className='text-gray-300 text-sm truncate'>
              {`${
                conv?.title?.length >= 20
                  ? conv.title.slice(0, 20) + "..."
                  : conv.title
              }` || "New Conversation"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
