"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-700 p-6 flex flex-col gap-2 fixed h-full">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-white">AI Lead System</h1>
          <p className="text-slate-400 text-xs mt-1">Lead Management CRM</p>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          <a href="/dashboard" className="text-slate-300 hover:text-white hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors">
            Dashboard
          </a>
          <a href="/leads" className="text-slate-300 hover:text-white hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors">
            Leads
          </a>
          <a href="/conversations" className="text-slate-300 hover:text-white hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors">
            Conversations
          </a>
          <a href="/analytics" className="text-slate-300 hover:text-white hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors">
            Analytics
          </a>
        </nav>

        <button
          onClick={handleLogout}
          className="text-slate-400 hover:text-red-400 text-sm text-left px-4 py-2 rounded-lg transition-colors"
        >
          Logout
        </button>
      </aside>

      {/* Main content */}
      <main className="ml-64 flex-1 p-8">
        {children}
      </main>
    </div>
  );
}