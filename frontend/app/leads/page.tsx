"use client";

import { useEffect, useState } from "react";
import { getLeads, createLead, deleteLead, Lead } from "@/lib/api";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", source: "", notes: "" });

  useEffect(() => { loadLeads(); }, []);

  async function loadLeads() {
    try {
      setLoading(true);
      const data = await getLeads();
      setLeads(data);
    } catch (err) {
      setError("Failed to load leads. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateLead() {
    if (!form.name.trim()) { alert("Name is required"); return; }
    try {
      setSubmitting(true);
      await createLead(form);
      setForm({ name: "", email: "", phone: "", source: "", notes: "" });
      setShowForm(false);
      await loadLeads();
    } catch (err) {
      alert("Failed to create lead.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteLead(id: number, name: string) {
    if (!confirm(`Delete lead "${name}"?`)) return;
    try {
      await deleteLead(id);
      await loadLeads();
    } catch (err) {
      alert("Failed to delete lead.");
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><p className="text-slate-400">Loading leads...</p></div>;
  if (error) return <div className="bg-red-900 border border-red-700 rounded-xl p-6"><p className="text-red-300">{error}</p></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Leads</h1>
          <p className="text-slate-400 mt-1">{leads.length} total leads</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          {showForm ? "Cancel" : "+ Add Lead"}
        </button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">New Lead</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 text-sm block mb-1">Name *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Doe" className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-slate-400 text-sm block mb-1">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@example.com" className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-slate-400 text-sm block mb-1">Phone</label>
              <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="9876543210" className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-slate-400 text-sm block mb-1">Source</label>
              <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500">
                <option value="">Select source</option>
                <option value="website">Website</option>
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
                <option value="referral">Referral</option>
                <option value="cold_outreach">Cold Outreach</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-slate-400 text-sm block mb-1">Notes</label>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Any initial notes..." rows={3} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleCreateLead} disabled={submitting} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-6 py-2 rounded-lg font-medium transition-colors">
              {submitting ? "Creating..." : "Create Lead"}
            </button>
            <button onClick={() => setShowForm(false)} className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg font-medium transition-colors">
              Cancel
            </button>
          </div>
        </Card>
      )}

      <Card>
        {leads.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg">No leads yet</p>
            <p className="text-slate-500 text-sm mt-1">Click "+ Add Lead" to create your first lead</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-slate-400 text-sm border-b border-slate-700">
                <th className="pb-3">Name</th>
                <th className="pb-3">Contact</th>
                <th className="pb-3">Source</th>
                <th className="pb-3">Score</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Added</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b border-slate-700 hover:bg-slate-700 transition-colors">
                  <td className="py-3"><p className="text-white font-medium">{lead.name}</p><p className="text-slate-500 text-xs">#{lead.id}</p></td>
                  <td className="py-3"><p className="text-slate-300 text-sm">{lead.email || "-"}</p><p className="text-slate-500 text-xs">{lead.phone || "-"}</p></td>
                  <td className="py-3 text-slate-400 text-sm">{lead.source || "-"}</td>
                  <td className="py-3"><Badge text={lead.score} type="score" /></td>
                  <td className="py-3"><Badge text={lead.status} type="status" /></td>
                  <td className="py-3 text-slate-400 text-sm">{new Date(lead.created_at).toLocaleDateString()}</td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <a href={`/conversations?lead_id=${lead.id}&name=${lead.name}`} className="text-blue-400 hover:text-blue-300 text-sm transition-colors">Chat</a>
                      <button onClick={() => handleDeleteLead(lead.id, lead.name)} className="text-red-400 hover:text-red-300 text-sm transition-colors">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </Card>
    </div>
  );
}
