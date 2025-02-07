import { useRef, useState, useEffect } from "react";
import useChat from "@/store/chat.store";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coldarkDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { CopyIcon, Check } from "lucide-react";

const Dialog = () => {
  const messagesEndRef = useRef(null);
  const [showLess, setShowLess] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const { isLoading, messages, error, isAnswering, setMessagesEndRef } =
    useChat();

  const handleScroll = (e) => {
    const element = e.target;
    const isAtBottom =
      Math.abs(
        element.scrollHeight - element.clientHeight - element.scrollTop,
      ) < 10;

    setAutoScroll(isAtBottom);
  };

  const scrollToBottom = () => {
    if (autoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, autoScroll]);

  useEffect(() => {
    setMessagesEndRef(messagesEndRef);
    return () => setMessagesEndRef({ current: null });
  }, []);

  return (
    <div
      className='overflow-y-auto p-4 flex h-full flex-col-reverse'
      onScroll={handleScroll}
    >
      <div className='space-y-4 grid place-items-stretch w-full md:max-w-3xl mx-auto relative'>
        {Array.isArray(messages) &&
          messages.map((message, i) =>
            message.role === "user" || message.content ? (
              <div
                key={i}
                className={`p-4 rounded-lg flex flex-col max-w-full relative ${
                  message.role === "user" ? "bg-[#222222] ml-auto" : ""
                }`}
              >
                {message.role === "user" ? (
                  <div className='whitespace-pre-wrap break-words'>
                    {message.content}
                  </div>
                ) : (
                  <ReactMarkdown
                    rehypePlugins={[
                      [rehypeRaw, { allowedElements: ["think"] }],
                    ]}
                    components={{
                      hr: () => <hr className='border-gray-800 my-4' />,
                      pre: ({ children, className }) => {
                        const [isCopied, setIsCopied] = useState(false);
                        const codeRef = useRef(null);
                        const timerRef = useRef(null);
                        let language = null;
                        if (className) {
                          language = /language-(\w+)/.exec(className)?.[1];
                        }
                        if (!language && children?.props?.className) {
                          language = /language-(\w+)/.exec(
                            children.props.className,
                          )?.[1];
                        }
                        const [codeHeight, setCodeHeight] = useState(0);

                        useEffect(() => {
                          if (codeRef.current) {
                            setCodeHeight(codeRef.current.scrollHeight);
                          }
                        }, []);

                        return (
                          <div className='my-4 w-full flex flex-col relative'>
                            <div className='flex items-center justify-between bg-[#222222] px-4 py-2 rounded-t-lg text-base text-gray-400 w-full'>
                              <div>{language || "text"}</div>
                              <div className='flex items-center justify-center'>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(
                                      children.props?.children ||
                                        String(children),
                                    );
                                    setIsCopied(true);

                                    // Clear previous timer if exists
                                    if (timerRef.current) {
                                      clearTimeout(timerRef.current);
                                    }

                                    // Set new timer and store reference
                                    timerRef.current = setTimeout(() => {
                                      setIsCopied(false);
                                      timerRef.current = null;
                                    }, 1000);
                                  }}
                                  className='text-gray-400 hover:text-gray-300'
                                >
                                  {isCopied ? (
                                    <Check className='w-4 h-4' />
                                  ) : (
                                    <CopyIcon className='w-4 h-4' />
                                  )}
                                </button>
                              </div>
                            </div>
                            <SyntaxHighlighter
                              language={language || "text"}
                              style={coldarkDark}
                              customStyle={{
                                margin: "0px",
                                borderRadius: "0 0 12px 12px",
                                fontSize: "12px",
                                maxHeight: showLess ? "700px" : "full",
                                maxWidth: "100%",
                              }}
                              codeTagProps={{
                                style: {
                                  wordBreak: "break-word",
                                  overflow: "auto",
                                  whiteSpace: "pre-wrap",
                                  width: "100%",
                                },
                              }}
                              ref={codeRef}
                              wrapLines={true}
                              wrapLongLines={true}
                            >
                              {children.props?.children || String(children)}
                            </SyntaxHighlighter>
                            {codeHeight > 750 && !isAnswering && (
                              <div className='absolute bottom-4 left-1/2 -translate-x-1/2'>
                                <button
                                  className='text-[#d2d2d2] bg-[#1c1c1c] px-4 py-2 rounded-lg duration-150 hover:bg-[#222]'
                                  onClick={() => setShowLess((prev) => !prev)}
                                >
                                  {showLess ? "Show more" : "Show less"}
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      },
                      p: ({ children }) => (
                        <p className='text-base'>{children}</p>
                      ),
                      think: ({ children }) => {
                        const extractContent = (child) => {
                          if (typeof child === "string") return child;
                          if (typeof child === "number") return String(child);
                          if (!child) return "";

                          if (Array.isArray(child)) {
                            return child.map(extractContent).join("");
                          }

                          if (typeof child === "object") {
                            if (child.props) {
                              if (child.props.children) {
                                return extractContent(child.props.children);
                              }
                              return "";
                            }
                            return "";
                          }

                          return "";
                        };

                        const content = extractContent(children).trim();

                        if (!content) return null;

                        return (
                          <div
                            className={`p-4 border-l-4 text-base text-gray-500 border-gray-500 mb-4 ${
                              !content && "hidden"
                            }`}
                          >
                            <div>
                              <div className='text-sm bg-slate-600 rounded-full px-4 py-1 text-white inline-block mb-2'>
                                Thought process
                              </div>
                            </div>
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm, remarkBreaks]}
                              components={{
                                p: ({ children }) => (
                                  <p className='text-base'>{children}</p>
                                ),
                                pre: ({ children }) => (
                                  <pre className='text-sm'>{children}</pre>
                                ),
                                code: ({ children }) => (
                                  <code className='text-sm'>{children}</code>
                                ),
                              }}
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
                        `<think>${content.replace(/\n\n/g, "\n")}</think>`,
                    )}
                  </ReactMarkdown>
                )}
              </div>
            ) : null,
          )}
        {isLoading && <div className='text-gray-300'>Analyzing...</div>}
        {error && <div className='text-red-500'>{error}</div>}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default Dialog;
