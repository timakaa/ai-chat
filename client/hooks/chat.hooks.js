import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useCreateConversation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (title) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/conversations`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: title.slice(0, 20) }),
        },
      );
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};

export const useSendMessage = () => {
  return useMutation({
    mutationFn: async ({ prompt, conversation_id }) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, conversation_id }),
      });
      return response;
    },
  });
};

export const useConversations = () => {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/conversations`,
      );
      const data = await response.json();
      const conversations = Array.isArray(data) ? data : [];
      return conversations;
    },
  });
};

export const useConversationMessages = (conversationId) => {
  return useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/conversations/${conversationId}`,
      );
      const messages = await response.json();
      return messages.length > 0 ? messages : [];
    },
    enabled: !!conversationId,
  });
};
