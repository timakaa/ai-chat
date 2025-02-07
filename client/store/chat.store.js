import { create } from "zustand";

const useChat = create((set) => ({
  isLoading: false,
  messages: [],
  conversationId: null,
  conversations: [],
  error: null,

  setIsLoading: (isLoading) => set({ isLoading }),
  setMessages: (messages) =>
    set((state) => ({
      messages:
        typeof messages === "function" ? messages(state.messages) : messages,
    })),
  setConversationId: (conversationId) => set({ conversationId }),
  setConversations: (conversations) =>
    set((state) => ({
      conversations:
        typeof conversations === "function"
          ? conversations(state.conversations)
          : conversations,
    })),
  setError: (error) => set({ error }),
}));

export default useChat;
