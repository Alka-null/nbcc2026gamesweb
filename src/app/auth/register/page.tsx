"use client";
import { useState } from "react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uniqueCode, setUniqueCode] = useState<string | null>(null);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setUniqueCode(null);

    try {
      // const res = await fetch("http://localhost:8000/api/auth/register/", {
      const res = await fetch("https://nbcc2026gamesbackend.onrender.com/api/auth/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
        }),
      });

      const data = await res.json();
      console.log("Registration response:", data);

      if (!res.ok) {
        throw new Error(data.error || data.detail || "Registration failed");
      }

      // Extract unique code from player object
      const code = data.player?.unique_code || data.unique_code || data.code;
      console.log("Extracted unique code:", code);
      
      if (!code) {
        console.error("No unique code found in response:", data);
        throw new Error("Registration succeeded but no code was returned");
      }
      
      // Save unique code to localStorage for feedback form
      localStorage.setItem("user_unique_code", code);
      
      setUniqueCode(code);
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setName("");
    setEmail("");
    setUniqueCode(null);
    setError("");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-lime-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 animate-fade-in">
        <h1 className="text-4xl font-extrabold mb-2 text-center bg-gradient-to-r from-green-600 to-lime-400 bg-clip-text text-transparent">
          Event Registration
        </h1>
        <p className="text-gray-600 text-center mb-8">Sign up to play strategy games</p>

        {!uniqueCode ? (
          <form onSubmit={handleRegister} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="font-semibold text-gray-700">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
                required
                minLength={1}
                maxLength={120}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="font-semibold text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
                required
                maxLength={254}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg animate-shake">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="bg-gradient-to-r from-green-600 to-lime-400 text-white px-6 py-3 rounded-lg text-lg font-semibold shadow-lg hover:scale-105 transition-transform duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Registering...
                </span>
              ) : (
                "Register"
              )}
            </button>
          </form>
        ) : (
          <div className="flex flex-col gap-6 items-center animate-fade-in">
            <div className="bg-green-50 border-2 border-green-400 rounded-xl p-6 w-full">
              <p className="text-green-700 font-semibold text-center mb-4">
                🎉 Registration Successful!
              </p>
              <p className="text-gray-700 text-center mb-2">Your unique code is:</p>
              <div className="bg-white border-2 border-green-500 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-green-600 tracking-wider break-all">
                  {uniqueCode}
                </p>
              </div>
              <p className="text-sm text-gray-600 text-center mt-4">
                Save this code! You'll need it to play games.
              </p>
            </div>

            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(uniqueCode);
                  alert("Code copied to clipboard!");
                }}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                📋 Copy Code
              </button>

              <button
                onClick={handleReset}
                className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Register Another User
              </button>

              <a
                href="/quiz-game"
                className="bg-gradient-to-r from-green-600 to-lime-400 text-white px-6 py-3 rounded-lg font-semibold text-center hover:scale-105 transition-transform duration-200"
              >
                Play Quiz Game →
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
