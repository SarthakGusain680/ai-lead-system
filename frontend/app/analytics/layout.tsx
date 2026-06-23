"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    const user = localStorage.getItem("user");
    if (user) {
      try {
        setUserEmail(JSON.parse(user).email || "");
      } catch {}
    }
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }

  return (
    <div className="flex min-h-screen">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-slate-900 border-r border-slate-700 p-6 flex flex-col gap-2 z-30
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}>
        <div className="mb-8">
          <h1 className="text-xl font-bold text-white">AI Lead System</h1>
          <p className="text-slate-400 text-xs mt-1">Lead Management CRM</p>
          {userEmail && (
            <div className="mt-3 bg-slate-800 rounded-lg px-3 py-2">
              <p className="text-slate-400 text-xs">Logged in as</p>
              <p className="text-white text-sm font-medium truncate">{userEmail}</p>
            </div>
          )}
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          
            href="/dashboard"
            onClick={() => setSidebarOpen(false)}
            className="text-slate-300 hover:text-white hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors"
          >
            Dashboard
          </a>
          
            href="/leads"
            onClick={() => setSidebarOpen(false)}
            className="text-slate-300