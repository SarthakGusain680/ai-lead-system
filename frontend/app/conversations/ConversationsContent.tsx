"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { getLeads, getConversations, createConversation, Lead, Conversation } from "@/lib/api";
import Card from "@/components/ui/Card";

export default function ConversationsContent() {
  const searchParams = useSearchParams();
  const leadIdParam = searchParams.get("lead_id");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    async function loadLeads() {
      try {
        const data = await getLeads();
        setLeads(data);
        if (leadIdParam) {
          const found = data.find((l) => l.id === parseInt(leadIdParam));
          if (found) setSelectedLead(found);
        }
      } catch (err) {
        console.error("Failed to load leads");
      } finally {
        setLoading(false);
      }
    }
    loadLeads();
  }, [leadIdParam]);

  useEffect(() => {
    if (!selectedLead) return;
    loadConversations(selectedLead.id);
  }, [selectedLead]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations]);

  async function loadConversations(leadId: number) {
    try {
      const data = await getConversations(leadId);
      setConversations(data);
    } catch (err) {
      console.error("Failed to load conversations");
    }
  }

  async function handleSendMessage() {
    if (!newMessage.trim() || !selectedLead) return;
    try {
      setSending(true);
      await createConversation({ lead_id: selectedLead.id, sender: "agent", message: newMessage });
      setNewMessage("");
      await loadConversations(selectedLead.id);
    } catch (err) {
      alert("Failed to send message.");
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
  }

  function getSenderStyle(sender: string) {
    if (sender === "lead") return "bg-slate-700 text-white self-start";
    if (sender === "ai") return "bg-purple-900 border border-purple-700 text-purple-100 self-start";
    return "bg-blue-600 text-white self-end";
  }

  function getSenderLabel(sender: string) {
    if (sender === "lead") return "Lead";
    if (sender === "ai") return "AI";
    return "You (Agent)";
  }

  if (loading) return <div className="flex items-center justify-center h-64"><p className="text-slate-400">Loading...</p></div>;
  return (
    <div className="flex gap-6 h-[calc(100vh-4rem)]">
      <div className="w-72 flex flex-col gap-2 overflow-y-auto">
        <h1 className="text-xl font-bold text-white mb-4">Conversations</h1>
        {leads.length === 0 ? (
          <p className="text-slate-400 text-sm">No leads yet.</p>
        ) : (
          leads.map((lead) => (
            <button
              key={lead.id}
              onClick={() => setSelectedLead(lead)}
              className={`text-left p-4 rounded-xl border transition-colors ${
                selectedLead?.id === lead.id
                  ? "bg-blue-900 border-blue-600"
                  : "bg-slate-800 border-slate-700 hover:bg-slate-700"
              }`}
            >
              <p className="text-white font-medium">{lead.name}</p>
              <p className="text-slate-400 text-xs mt-1">{lead.email || "No email"}</p>
            </button>
          ))
        )}
      </div>

      <div className="flex-1 flex flex-col">
        {!selectedLead ? (
          <Card className="flex-1 flex items-center justify-center">
            <p className="text-slate-400 text-lg">Select a lead to view conversation</p>
          </Card>
        ) : (
          <>
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 mb-4">
              <h2 className="text-white font-semibold">{selectedLead.name}</h2>
              <p className="text-slate-400 text-sm">{selectedLead.email || "No email"}</p>
            </div>

            <div className="flex-1 bg-slate-800 border border-slate-700 rounded-xl p-4 overflow-y-auto flex flex-col gap-3 mb-4">
              {conversations.length === 0 ? (
                <p className="text-slate-500">No messages yet. Start the conversation!</p>
              ) : (
                conversations.map((msg) => (
                  <div key={msg.id} className={`max-w-lg px-4 py-3 rounded-xl text-sm ${getSenderStyle(msg.sender)}`}>
                    <p className="text-xs opacity-60 mb-1 font-medium">{getSenderLabel(msg.sender)}</p>
                    <p className="leading-relaxed">{msg.message}</p>
                    <p className="text-xs opacity-40 mt-1">{new Date(msg.created_at).toLocaleTimeString()}</p>
                  </div>
                ))
              )}
              <div ref={bottomRef} />
            </div>

            <div className="flex gap-3">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message... (Enter to send)"
                rows={2}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
              />
              <button
                onClick={handleSendMessage}
                disabled={sending || !newMessage.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white px-6 rounded-xl font-medium transition-colors"
              >
                {sending ? "..." : "Send"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
