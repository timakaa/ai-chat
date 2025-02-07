"use client";
import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";
import Sidebar from "@/components/Sidebar";
import InputForm from "@/components/InputForm";
import useChat from "@/store/chat.store";

export default function Home() {
  const messagesEndRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const { isLoading, messages, error } = useChat();

  const scrollToBottom = () => {
    if (autoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Handle scroll events
  const handleScroll = (e) => {
    const element = e.target;
    const isAtBottom =
      Math.abs(
        element.scrollHeight - element.clientHeight - element.scrollTop,
      ) < 10;

    setAutoScroll(isAtBottom);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, autoScroll]);

  return (
    <div className='flex h-screen bg-[#111010]'>
      {/* Sidebar */}
      <Sidebar />

      {/* Main chat area */}
      <div className='flex-1 flex flex-col'>
        {/* Messages container with scroll handler */}
        <div className='flex-1 overflow-y-auto p-4 flex flex-col-reverse'>
          <div className='space-y-4 flex flex-col'>
            {Array.isArray(messages) &&
              messages.map((message, i) => {
                return message.role === "user" || message.content ? (
                  <div
                    key={i}
                    className={`p-4 rounded-lg inline-block ${
                      message.role === "user"
                        ? "bg-[#222222] ml-auto max-w-[80%] text-end"
                        : "mr-auto max-w-[80%] prose prose-invert"
                    }`}
                  >
                    {message.role === "user" ? (
                      message.content
                    ) : (
                      <div className='prose prose-invert max-w-none'>
                        <ReactMarkdown
                          rehypePlugins={[
                            [rehypeRaw, { allowedElements: ["think"] }],
                          ]}
                          components={{
                            hr: () => <hr className='border-gray-800 my-4' />,
                            pre: ({ children }) => (
                              <pre className='bg-[#222222] my-2 rounded-lg p-4'>
                                {children}
                              </pre>
                            ),
                            think: ({ children }) => {
                              const content = Array.isArray(children)
                                ? children
                                    .map((child) =>
                                      typeof child === "object"
                                        ? child.props?.children || ""
                                        : child || "",
                                    )
                                    .join("")
                                    .trim()
                                : (children || "").toString().trim();

                              if (!content) return null;

                              return (
                                <div
                                  className={`p-4 border-l-4 border-gray-500 mb-4 ${
                                    !content && "hidden"
                                  }`}
                                >
                                  <div className='text-sm text-gray-400 mb-2'>
                                    Thinking...
                                  </div>
                                  <ReactMarkdown
                                    remarkPlugins={[remarkGfm, remarkBreaks]}
                                  >
                                    {content}
                                  </ReactMarkdown>
                                </div>
                              );
                            },
                          }}
                          remarkPlugins={[remarkGfm, remarkBreaks]}
                        >
                          {message.content.replace(
                            /<think>([\s\S]*?)<\/think>/g,
                            (_, content) =>
                              `<think>${content.replace(
                                /\n\n/g,
                                "\n",
                              )}</think>`,
                          )}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                ) : null;
              })}
            {isLoading && <div className='text-gray-300'>Analyzing...</div>}
            {error && <div className='text-red-500'>{error}</div>}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input form */}
        <InputForm />
      </div>
    </div>
  );
}
