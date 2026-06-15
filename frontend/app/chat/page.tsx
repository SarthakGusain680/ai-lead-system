"use client";

import { useState, useEffect, useRef } from "react";

interface Message {
  sender: "lead" | "ai";
  message: string;
}

export default function ChatPage() {
  const [step, setStep] = useState<"intro" | "chat">("intro");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [leadId, setLeadId] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleStart() {
    if (!name.trim()) {
      alert("Please enter your name");
      return;
    }

    // Add welcome message
    setMessages([
      {
        sender: "ai",
        message: `Hi ${name}! 👋 I'm an AI assistant. How can I help you today?`,
      },
    ]);
    setStep("chat");
  }

  async function handleSend() {
    if (!newMessage.trim() || sending) return;

    const userMessage = newMessage;
    setNewMessage("");

    // Add user message to UI immediately
    setMessages((prev) => [
      ...prev,
      { sender: "lead", message: userMessage },
    ]);

    setSending(true);

    try {
      const res = await fetch(`${API_URL}/public/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email: email || undefined,
          message: userMessage,
          session_id: leadId ? String(leadId) : undefined,
        }),
      });

      const data = await res.json();

      setLeadId(data.lead_id);

      // Add AI reply to UI
      setMessages((prev) => [
        ...prev,
        { sender: "ai", message: data.ai_reply },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          message: "Sorry, I'm having trouble connecting. Please try again.",
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="bg-blue-600 p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-bold text-lg">AI</span>
          </div>
          <div>
            <p className="text-white font-semibold">AI Assistant</p>
            <p className="text-blue-200 text-xs">Online — replies instantly</p>
          </div>
        </div>

        {/* Intro Step */}
        {step === "intro" && (
          <div className="p-6">
            <p className="text-white text-lg font-semibold mb-2">
              Welcome! Let's get started
            </p>
            <p className="text-slate-400 text-sm mb-6">
              Tell us a bit about yourself and we'll connect you with our AI assistant.
            </p>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-slate-400 text-sm block mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  onKeyDown={(e) => e.key === "Enter" && handleStart()}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-1">
                  Email (optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <button
                onClick={handleStart}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Start Chat
              </button>
            </div>
          </div>
        )}

        {/* Chat Step */}
        {step === "chat" && (
          <>
            {/* Messages */}
            <div className="h-96 overflow-y-auto p-4 flex flex-col gap-3">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`max-w-xs px-4 py-3 rounded-2xl text-sm ${
                    msg.sender === "ai"
                      ? "bg-slate-700 text-white self-start rounded-tl-none"
                      : "bg-blue-600 text-white self-end rounded-tr-none ml-auto"
                  }`}
                >
                  {msg.message}
                </div>
              ))}
              {sending && (
                <div className="bg-slate-700 text-slate-400 self-start px-4 py-3 rounded-2xl rounded-tl-none text-sm">
                  Typing...
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-700 flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="flex-1 bg-slate-700 border border-slate-600 rounded-xl px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
              />
              <button
                onClick={handleSend}
                disabled={sending || !newMessage.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white px-4 py-2 rounded-xl font-medium transition-colors text-sm"
              >
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}