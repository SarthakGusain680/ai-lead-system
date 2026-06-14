// Base URL from environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// ─── Types ────────────────────────────────────────────────

export interface Lead {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  source: string | null;
  status: string;
  score: string;
  score_value: number;
  notes: string | null;
  priority: number;
  created_at: string;
  updated_at: string | null;
  owner_id: number;
}

export interface Conversation {
  id: number;
  lead_id: number;
  sender: string;
  message: string;
  created_at: string;
}

export interface Followup {
  id: number;
  lead_id: number;
  scheduled_at: string;
  message: string | null;
  status: string;
  is_automated: boolean;
  created_at: string;
}

// ─── Lead API calls ────────────────────────────────────────

export async function getLeads(): Promise<Lead[]> {
  const res = await fetch(`${API_URL}/leads/`);
  if (!res.ok) throw new Error("Failed to fetch leads");
  return res.json();
}

export async function getLead(id: number): Promise<Lead> {
  const res = await fetch(`${API_URL}/leads/${id}`);
  if (!res.ok) throw new Error("Failed to fetch lead");
  return res.json();
}

export async function createLead(data: {
  name: string;
  email?: string;
  phone?: string;
  source?: string;
  notes?: string;
}): Promise<Lead> {
  const res = await fetch(`${API_URL}/leads/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create lead");
  return res.json();
}

export async function updateLead(id: number, data: Partial<Lead>): Promise<Lead> {
  const res = await fetch(`${API_URL}/leads/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update lead");
  return res.json();
}

export async function deleteLead(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/leads/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete lead");
}

// ─── Conversation API calls ────────────────────────────────

export async function getConversations(leadId: number): Promise<Conversation[]> {
  const res = await fetch(`${API_URL}/conversations/lead/${leadId}`);
  if (!res.ok) throw new Error("Failed to fetch conversations");
  return res.json();
}

export async function createConversation(data: {
  lead_id: number;
  sender: string;
  message: string;
}): Promise<Conversation> {
  const res = await fetch(`${API_URL}/conversations/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create conversation");
  return res.json();
}

// ─── Followup API calls ────────────────────────────────────

export async function getFollowups(): Promise<Followup[]> {
  const res = await fetch(`${API_URL}/followups/`);
  if (!res.ok) throw new Error("Failed to fetch followups");
  return res.json();
}

export async function createFollowup(data: {
  lead_id: number;
  scheduled_at: string;
  message?: string;
  is_automated?: boolean;
}): Promise<Followup> {
  const res = await fetch(`${API_URL}/followups/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create followup");
  return res.json();
}