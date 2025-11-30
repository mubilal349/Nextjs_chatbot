"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Send, Sparkles, Trash2, Menu, X } from "lucide-react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function Home() {
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatBotResponse = (text: string) => {
    return text;
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();

      const botMessage: ChatMessage = {
        role: "assistant",
        content: formatBotResponse(data.reply),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: ChatMessage = {
        role: "assistant",
        content:
          "Sorry, I encountered an error while processing your request. Please try again later.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Sidebar - Mobile */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity duration-300 ${
          isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 left-0 w-64 bg-zinc-950 border-r border-zinc-800 z-50 transform transition-transform duration-300 lg:transform-none ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg">AI Chat</span>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={clearChat}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 transition-colors border border-zinc-800 hover:border-zinc-700"
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-sm cursor-pointer">Clear Conversation</span>
          </button>

          <div className="flex-1" />

          <div className="text-xs text-zinc-500 space-y-1">
            <p>AI Assistant v2.0</p>
            <p>Powered by Next.js</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="bg-zinc-950 border-b border-zinc-800 px-4 lg:px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden text-zinc-400 hover:text-white transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center lg:hidden">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h1 className="text-lg lg:text-xl font-semibold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                  AI Assistant
                </h1>
              </div>
            </div>
            <button
              onClick={clearChat}
              className="hidden lg:flex items-center cursor-pointer gap-2 text-sm text-zinc-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-zinc-900"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Chat Container */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full max-w-4xl mx-auto flex flex-col">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-6">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-4 lg:p-8">
                  <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6 animate-pulse">
                    <Sparkles className="w-8 h-8 lg:w-10 lg:h-10" />
                  </div>
                  <h2 className="text-xl lg:text-2xl font-bold mb-3 bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                    Welcome to AI Assistant
                  </h2>
                  <p className="text-zinc-400 max-w-md text-sm lg:text-base">
                    Start a conversation and experience intelligent responses
                    powered by advanced AI
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8 w-full max-w-2xl">
                    {[
                      { icon: "💡", text: "Get creative ideas" },
                      { icon: "📊", text: "Analyze data" },
                      { icon: "✍️", text: "Write content" },
                      { icon: "🔍", text: "Research topics" },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors cursor-pointer"
                        onClick={() => setInput(item.text)}
                      >
                        <span className="text-2xl mb-2 block">{item.icon}</span>
                        <span className="text-sm text-zinc-300">
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex gap-3 lg:gap-4 ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {msg.role === "assistant" && (
                        <div className="flex-shrink-0 w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <Sparkles className="w-4 h-4 lg:w-5 lg:h-5" />
                        </div>
                      )}
                      <div
                        className={`max-w-[85%] lg:max-w-3xl px-4 py-3 rounded-2xl ${
                          msg.role === "user"
                            ? "bg-gradient-to-br from-blue-600 to-purple-600"
                            : "bg-zinc-900 border border-zinc-800"
                        }`}
                      >
                        <div className="prose prose-invert prose-sm lg:prose-base max-w-none">
                          {msg.role === "assistant" ? (
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {msg.content}
                            </ReactMarkdown>
                          ) : (
                            <p className="whitespace-pre-wrap m-0">
                              {msg.content}
                            </p>
                          )}
                        </div>
                      </div>
                      {msg.role === "user" && (
                        <div className="flex-shrink-0 w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center font-bold text-sm lg:text-base">
                          U
                        </div>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-3 lg:gap-4 justify-start">
                      <div className="flex-shrink-0 w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <Sparkles className="w-4 h-4 lg:w-5 lg:h-5" />
                      </div>
                      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3">
                        <div className="flex space-x-1.5">
                          <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 lg:p-6 border-t border-zinc-800 bg-black">
              <div className="flex gap-2 lg:gap-3 items-end">
                <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl focus-within:border-zinc-700 transition-colors">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full bg-transparent px-4 lg:px-5 py-3 lg:py-4 focus:outline-none text-sm lg:text-base"
                    placeholder="Type your message..."
                    disabled={isLoading}
                  />
                </div>
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim()}
                  className="bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-2xl p-3 lg:p-4 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 flex-shrink-0"
                >
                  {isLoading ? (
                    <svg
                      className="animate-spin h-5 w-5 lg:h-6 lg:w-6"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : (
                    <Send className="w-5 h-5 lg:w-6 lg:h-6 cursor-pointer" />
                  )}
                </button>
              </div>
              <p className="text-xs text-zinc-500 mt-3 text-center">
                AI can make mistakes. Verify important information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
