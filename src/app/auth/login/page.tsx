"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/app/components/AdminAuthProvider";

export default function AdminLoginPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAdminAuth();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // const res = await fetch("http://localhost:8000/api/auth/code-login/", {
      const res = await fetch("https://nbcc2026gamesbackend.onrender.com/api/auth/code-login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unique_code: code }),
      });
      if (!res.ok) throw new Error("Invalid code");
      const data = await res.json();
      // Store JWT or session token and update auth state
      login(data.token || code);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <h1 className="text-3xl font-bold mb-2 text-center text-gray-800">Admin Login</h1>
        <p className="text-gray-600 text-center mb-8">Enter your admin code to continue</p>
        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="code" className="font-semibold text-gray-700">
              Admin Code <span className="text-red-500">*</span>
            </label>
            <input
              id="code"
              type="text"
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="Enter admin code"
              className="border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
              required
            />
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          <button
            type="submit"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg text-lg font-semibold shadow-lg hover:scale-105 transition-transform duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span>
                Logging in...
              </span>
            ) : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
