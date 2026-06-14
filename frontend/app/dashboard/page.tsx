"use client";

import { useEffect, useState } from "react";
import { getLeads, getFollowups, Lead, Followup } from "@/lib/api";
import Card from "@/components/ui/Card";
import StatCard from "@/components/ui/StatCard";
import Badge from "@/components/ui/Badge";

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [followups, setFollowups] = useState<Followup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [leadsData, followupsData] = await Promise.all([getLeads(), getFollowups()]);
        setLeads(leadsData);
        setFollowups(followupsData);
      } catch (err) {
        setError("Cannot connect to backend. Make sure FastAPI is running.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const hotLeads = leads.filter((l) => l.score === "HOT").length;
  const mediumLeads = leads.filter((l) => l.score === "MEDIUM").length;
  const pendingFollowups = followups.filter((f) => f.status === "PENDING").length;

  if (loading) return <div className="flex items-center justify-center h-64"><p className="text-slate-400 text-lg">Loading dashboard...</p></div>;

  if (error) return <div className="bg-red-900 border border-red-700 rounded-xl p-6"><p className="text-red-300 font-semibold">Connection Error</p><p className="text-red-400 text-sm mt-1">{error}</p></div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 mt-1">Overview of your lead pipeline</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Leads" value={leads.length} subtitle="All time" color="text-blue-400" />
        <StatCard title="HOT Leads" value={hotLeads} subtitle="Ready to close" color="text-red-400" />
        <StatCard title="MEDIUM Leads" value={mediumLeads} subtitle="In progress" color="text-yellow-400" />
        <StatCard title="Pending Follow-ups" value={pendingFollowups} subtitle="Need attention" color="text-purple-400" />
      </div>

      <Card className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Recent Leads</h2>
        {leads.length === 0 ? (
          <p className="text-slate-400">No leads yet. Add your first lead!</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left text-slate-400 text-sm border-b border-slate-700">
                <th className="pb-3">Name</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Source</th>
                <th className="pb-3">Score</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {leads.slice(0, 5).map((lead) => (
                <tr key={lead.id} className="border-b border-slate-700 hover:bg-slate-700 transition-colors">
                  <td className="py-3 text-white font-medium">{lead.name}</td>
                  <td className="py-3 text-slate-400">{lead.email || "-"}</td>
                  <td className="py-3 text-slate-400">{lead.source || "-"}</td>
                  <td className="py-3"><Badge text={lead.score} type="score" /></td>
                  <td className="py-3"><Badge text={lead.status} type="status" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-white mb-4">Upcoming Follow-ups</h2>
        {followups.length === 0 ? (
          <p className="text-slate-400">No follow-ups scheduled.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {followups.slice(0, 5).map((f) => (
              <div key={f.id} className="flex justify-between items-center border-b border-slate-700 pb-3">
                <div>
                  <p className="text-white text-sm">{f.message || "Follow-up scheduled"}</p>
                  <p className="text-slate-400 text-xs mt-1">{new Date(f.scheduled_at).toLocaleString()}</p>
                </div>
                <Badge text={f.status} type="status" />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
