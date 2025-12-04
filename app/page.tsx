"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Send, Menu, X, MessageSquare, Plus, Sun, Moon } from "lucide-react";
import Head from "next/head";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

export default function Home() {
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load theme preference and chat history from localStorage on mount
  useEffect(() => {
    // Load theme preference
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
    }

    // Load chat history
    const savedMessages = localStorage.getItem("chatHistory");
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        // Convert timestamp strings back to Date objects
        const messagesWithDates = parsedMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(messagesWithDates);
      } catch (error) {
        console.error("Error parsing saved messages:", error);
      }
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("chatHistory", JSON.stringify(messages));
    }
  }, [messages]);

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");
    if (newTheme) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Function to format long responses as bullet points
  const formatResponse = (text: string) => {
    // Check if response is long (more than 200 characters or has multiple paragraphs)
    const isLongResponse = text.length > 200 || text.split(/\n\n/).length > 2;

    if (!isLongResponse) {
      return text;
    }

    // Split by paragraphs or double newlines
    const paragraphs = text.split(/\n\n/);

    // If there are multiple paragraphs, format as bullet points
    if (paragraphs.length > 1) {
      return paragraphs
        .map((para) => {
          // Remove any leading/trailing whitespace
          const trimmed = para.trim();
          // Skip empty paragraphs
          if (!trimmed) return "";
          // Return as bullet point
          return `• ${trimmed}`;
        })
        .filter(Boolean) // Remove empty strings
        .join("\n\n");
    }

    // If it's a single long paragraph, split by sentences
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

    // If there are many sentences, format as bullet points
    if (sentences.length > 3) {
      return sentences
        .map((sentence) => {
          const trimmed = sentence.trim();
          if (!trimmed) return "";
          return `• ${trimmed}`;
        })
        .filter(Boolean)
        .join("\n\n");
    }

    // Otherwise, return the original text
    return text;
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: input,
      timestamp: new Date(),
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
        content: formatResponse(data.reply),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: ChatMessage = {
        role: "assistant",
        content:
          "Sorry, I encountered an error while processing your request. Please try again later.",
        timestamp: new Date(),
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
    localStorage.removeItem("chatHistory");
  };

  // Format time for display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <>
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <div
        className={`flex h-screen overflow-hidden font-sans ${
          isDarkMode ? "bg-gray-900" : "bg-white"
        }`}
        style={{
          fontFamily:
            "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        }}
      >
        {/* Sidebar - Mobile */}
        <div
          className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ${
            isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          } ${isDarkMode ? "bg-gray-800" : "bg-gray-500"} bg-opacity-50`}
          onClick={() => setIsSidebarOpen(false)}
        />

        {/* Sidebar */}
        <div
          className={`fixed lg:static inset-y-0 left-0 w-64 z-50 transform transition-transform duration-300 lg:transform-none ${
            isSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          } ${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-gray-50 border-gray-200"
          } border-r`}
        >
          <div className="flex flex-col h-full p-4">
            <button
              onClick={clearChat}
              className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg border transition-colors ${
                isDarkMode
                  ? "border-gray-600 hover:bg-gray-700 text-white"
                  : "border-gray-300 hover:bg-gray-100 text-black"
              }`}
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">New chat</span>
            </button>

            <div className="flex-1 mt-4">
              <div
                className={`text-xs font-semibold uppercase tracking-wide mb-2 ${
                  isDarkMode ? "text-white" : "text-black"
                }`}
              >
                Today
              </div>
              <div className="space-y-1">
                {messages.length > 0 && (
                  <div
                    className={`px-3 py-2 rounded-lg cursor-pointer text-sm truncate ${
                      isDarkMode
                        ? "hover:bg-gray-700 text-white"
                        : "hover:bg-gray-100 text-black"
                    }`}
                  >
                    {messages[0].content.slice(0, 30)}...
                  </div>
                )}
              </div>
            </div>

            <div
              className={`text-xs ${isDarkMode ? "text-white" : "text-black"}`}
            >
              <p>AI Assistant</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div
            className={`px-4 py-3 flex items-center justify-between ${
              isDarkMode
                ? "bg-gray-900 border-gray-700"
                : "bg-white border-gray-200"
            } border-b`}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className={`lg:hidden transition-colors ${
                  isDarkMode
                    ? "text-gray-400 hover:text-white"
                    : "text-gray-500 hover:text-black"
                }`}
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1
                className={`text-lg font-medium ${
                  isDarkMode ? "text-white" : "text-black"
                }`}
              >
                AI Assistant
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? "hover:bg-gray-800 text-white"
                    : "hover:bg-gray-100 text-black"
                }`}
                aria-label="Toggle theme"
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={clearChat}
                className={`hidden lg:flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg transition-colors ${
                  isDarkMode
                    ? "text-white hover:bg-gray-800"
                    : "text-black hover:bg-gray-100"
                }`}
              >
                <Plus className="w-4 h-4" />
                <span className="font-medium">New chat</span>
              </button>
            </div>
          </div>

          {/* Chat Container */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full max-w-3xl mx-auto flex flex-col">
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto px-4 py-6">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                        isDarkMode ? "bg-gray-800" : "bg-gray-100"
                      }`}
                    >
                      <MessageSquare
                        className={`w-6 h-6 ${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      />
                    </div>
                    <h2
                      className={`text-2xl font-semibold mb-2 ${
                        isDarkMode ? "text-white" : "text-black"
                      }`}
                    >
                      How can I help you today?
                    </h2>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {messages.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex gap-4 ${
                          msg.role === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        {msg.role === "assistant" && (
                          <div
                            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                              isDarkMode ? "bg-gray-700" : "bg-gray-100"
                            }`}
                          >
                            <MessageSquare
                              className={`w-4 h-4 ${
                                isDarkMode ? "text-gray-400" : "text-gray-600"
                              }`}
                            />
                          </div>
                        )}
                        <div
                          className={`max-w-[85%] lg:max-w-2xl px-4 py-3 rounded-lg ${
                            msg.role === "user"
                              ? "bg-blue-500 text-white"
                              : isDarkMode
                              ? "bg-gray-800 text-white"
                              : "bg-gray-100 text-black"
                          }`}
                        >
                          <div
                            className={`prose prose-sm max-w-none ${
                              isDarkMode ? "prose-invert" : ""
                            }`}
                            style={{
                              fontFamily:
                                "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                              fontSize: "0.95rem",
                              lineHeight: "1.6",
                            }}
                          >
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
                          <div
                            className={`text-xs mt-2 ${
                              msg.role === "user"
                                ? "text-blue-100"
                                : isDarkMode
                                ? "text-gray-400"
                                : "text-gray-500"
                            }`}
                          >
                            {formatTime(msg.timestamp)}
                          </div>
                        </div>
                        {msg.role === "user" && (
                          <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                            U
                          </div>
                        )}
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex gap-4 justify-start">
                        <div
                          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            isDarkMode ? "bg-gray-700" : "bg-gray-100"
                          }`}
                        >
                          <MessageSquare
                            className={`w-4 h-4 ${
                              isDarkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          />
                        </div>
                        <div
                          className={`rounded-lg px-4 py-3 ${
                            isDarkMode ? "bg-gray-800" : "bg-gray-100"
                          }`}
                        >
                          <div className="flex space-x-1">
                            <div
                              className={`w-2 h-2 rounded-full animate-bounce ${
                                isDarkMode ? "bg-gray-500" : "bg-gray-400"
                              }`}
                            ></div>
                            <div
                              className={`w-2 h-2 rounded-full animate-bounce ${
                                isDarkMode ? "bg-gray-500" : "bg-gray-400"
                              }`}
                              style={{ animationDelay: "0.1s" }}
                            ></div>
                            <div
                              className={`w-2 h-2 rounded-full animate-bounce ${
                                isDarkMode ? "bg-gray-500" : "bg-gray-400"
                              }`}
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
              <div
                className={`px-4 py-4 border-t ${
                  isDarkMode
                    ? "bg-gray-900 border-gray-700"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="max-w-3xl mx-auto">
                  <div className="flex gap-2 items-center">
                    <input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className={`flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:border-blue-500 ${
                        isDarkMode
                          ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                          : "bg-white border-gray-300 text-black placeholder-gray-500"
                      }`}
                      placeholder="Send a message..."
                      disabled={isLoading}
                      style={{
                        fontFamily:
                          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                        fontSize: "0.95rem",
                      }}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={isLoading || !input.trim()}
                      className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg p-3 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                  <p
                    className={`text-xs mt-2 text-center ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    AI can make mistakes. Consider checking important
                    information.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
