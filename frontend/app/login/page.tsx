"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", password: "", full_name: "" });

  async function handleSubmit() {
    if (!form.email || !form.password) {
      setError("Email and password are required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const endpoint = isRegister ? "/auth/register" : "/auth/login";
      const body = isRegister
        ? { email: form.email, password: form.password, full_name: form.full_name }
        : { email: form.email, password: form.password };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || "Something went wrong");
        return;
      }
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/dashboard");
    } catch (err) {
      setError("Cannot connect to backend. Make sure FastAPI is running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">AI Lead System</h1>
          <p className="text-slate-400 mt-2">
            {isRegister ? "Create your account" : "Sign in to your account"}
          </p>
        </div>
        <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
          {error && (
            <div className="bg-red-900 border border-red-700 rounded-lg p-3 mb-6">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}
          {isRegister && (
            <div className="mb-4">
              <label className="text-slate-400 text-sm block mb-2">Full Name</label>
              <input
                type="text"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                placeholder="John Doe"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          )}
          <div className="mb-4">
            <label className="text-slate-400 text-sm block mb-2">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="admin@example.com"
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="mb-6">
            <label className="text-slate-400 text-sm block mb-2">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Enter your password"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors"
          >
            {loading ? "Please wait..." : isRegister ? "Create Account" : "Sign In"}
          </button>
          <div className="text-center mt-6">
            <button
              onClick={() => { setIsRegister(!isRegister); setError(""); }}
              className="text-slate-400 hover:text-white text-sm transition-colors"
            >
              {isRegister ? "Already have an account? Sign in" : "Don't have an account? Register"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}