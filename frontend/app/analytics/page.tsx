"use client";

import { useEffect, useState } from "react";
import { getLeads, getFollowups, Lead, Followup } from "@/lib/api";
import Card from "@/components/ui/Card";
import StatCard from "@/components/ui/StatCard";

export default function AnalyticsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [followups, setFollowups] = useState<Followup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [l, f] = await Promise.all([getLeads(), getFollowups()]);
        setLeads(l);
        setFollowups(f);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-400">Loading analytics...</p>
      </div>
    );
  }

  // Compute stats
  const byScore = {
    HOT: leads.filter((l) => l.score === "HOT").length,
    MEDIUM: leads.filter((l) => l.score === "MEDIUM").length,
    COLD: leads.filter((l) => l.score === "COLD").length,
  };

  const byStatus = {
    NEW: leads.filter((l) => l.status === "NEW").length,
    CONTACTED: leads.filter((l) => l.status === "CONTACTED").length,
    QUALIFIED: leads.filter((l) => l.status === "QUALIFIED").length,
    CLOSED: leads.filter((l) => l.status === "CLOSED").length,
  };

  const bySource = leads.reduce((acc, lead) => {
    const src = lead.source || "Unknown";
    acc[src] = (acc[src] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const followupStats = {
    PENDING: followups.filter((f) => f.status === "PENDING").length,
    SENT: followups.filter((f) => f.status === "SENT").length,
    CANCELLED: followups.filter((f) => f.status === "CANCELLED").length,
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-slate-400 mt-1">Pipeline performance overview</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Leads" value={leads.length} color="text-blue-400" />
        <StatCard title="HOT Leads" value={byScore.HOT} color="text-red-400" />
        <StatCard title="Qualified" value={byStatus.QUALIFIED} color="text-green-400" />
        <StatCard title="Closed" value={byStatus.CLOSED} color="text-slate-400" />
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">

        {/* Score Breakdown */}
        <Card>
          <h2 className="text-lg font-semibold text-white mb-4">Leads by Score</h2>
          <div className="flex flex-col gap-3">
            {Object.entries(byScore).map(([score, count]) => (
              <div key={score}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300">{score}</span>
                  <span className="text-white font-medium">{count}</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      score === "HOT" ? "bg-red-500" :
                      score === "MEDIUM" ? "bg-yellow-500" : "bg-blue-500"
                    }`}
                    style={{ width: leads.length ? `${(count / leads.length) * 100}%` : "0%" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Status Breakdown */}
        <Card>
          <h2 className="text-lg font-semibold text-white mb-4">Leads by Status</h2>
          <div className="flex flex-col gap-3">
            {Object.entries(byStatus).map(([status, count]) => (
              <div key={status}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300">{status}</span>
                  <span className="text-white font-medium">{count}</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-blue-500"
                    style={{ width: leads.length ? `${(count / leads.length) * 100}%` : "0%" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Source Breakdown */}
        <Card>
          <h2 className="text-lg font-semibold text-white mb-4">Leads by Source</h2>
          {Object.keys(bySource).length === 0 ? (
            <p className="text-slate-400">No source data yet</p>
          ) : (
            <div className="flex flex-col gap-3">
              {Object.entries(bySource)
                .sort((a, b) => b[1] - a[1])
                .map(([source, count]) => (
                  <div key={source} className="flex justify-between items-center">
                    <span className="text-slate-300 text-sm capitalize">{source}</span>
                    <span className="bg-slate-700 text-white text-xs px-3 py-1 rounded-full">
                      {count} lead{count !== 1 ? "s" : ""}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </Card>

        {/* Followup Stats */}
        <Card>
          <h2 className="text-lg font-semibold text-white mb-4">Follow-up Status</h2>
          <div className="flex flex-col gap-3">
            {Object.entries(followupStats).map(([status, count]) => (
              <div key={status} className="flex justify-between items-center">
                <span className="text-slate-300 text-sm">{status}</span>
                <span className={`text-sm font-semibold ${
                  status === "PENDING" ? "text-yellow-400" :
                  status === "SENT" ? "text-green-400" : "text-slate-400"
                }`}>
                  {count}
                </span>
              </div>
            ))}
          </div>
        </Card>

      </div>
    </div>
  );
}