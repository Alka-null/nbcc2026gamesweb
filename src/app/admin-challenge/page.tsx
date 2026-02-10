"use client";
import { useState, useEffect } from "react";

export default function AdminChallengePage() {
  const [challengeName, setChallengeName] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  async function handleStartChallenge(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      // const res = await fetch("http://localhost:8000/api/gameplay/start_challenge/", {
      const res = await fetch("https://nbcc2026gamesbackend.onrender.com/api/gameplay/start_challenge/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: challengeName }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(`Challenge started: ${data.name} (ID: ${data.challenge_id})`);
        // Refresh challenge list
        fetchChallenges();
      } else {
        setResult(data.message || "Failed to start challenge");
      }
    } catch (err) {
      setResult("Error starting challenge");
    } finally {
      setLoading(false);
    }
  }

  async function fetchChallenges() {
    setFetching(true);
    try {
      // const res = await fetch("http://localhost:8000/api/gameplay/challenges/");
      const res = await fetch("https://nbcc2026gamesbackend.onrender.com/api/gameplay/challenges/");
      const data = await res.json();
      setChallenges(data.challenges || []);
    } catch {
      setChallenges([]);
    } finally {
      setFetching(false);
    }
  }

  useEffect(() => {
    fetchChallenges();
  }, []);

  return (
    <div className="max-w-2xl mx-auto mt-12 p-8 bg-green-50 rounded-xl shadow">
      <h1 className="font-bold text-2xl mb-4 text-green-800">Start New Leaderboard Challenge</h1>
      <form onSubmit={handleStartChallenge} className="flex gap-2 items-center mb-4">
        <input
          type="text"
          value={challengeName}
          onChange={e => setChallengeName(e.target.value)}
          placeholder="Challenge Name"
          className="border px-2 py-1 rounded w-full"
          required
        />
        <button
          type="submit"
          className="bg-green-700 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? "Starting..." : "Start Challenge"}
        </button>
      </form>
      {result && <div className="mt-2 text-green-700">{result}</div>}

      <h2 className="font-bold text-xl mt-8 mb-4 text-green-900">Previous Challenges</h2>
      {fetching ? (
        <div className="text-green-700">Loading challenges...</div>
      ) : challenges.length === 0 ? (
        <div className="text-gray-500">No challenges found.</div>
      ) : (
        <table className="w-full bg-white rounded shadow text-sm">
          <thead>
            <tr className="bg-green-100">
              <th className="py-2 px-3 text-left">ID</th>
              <th className="py-2 px-3 text-left">Name</th>
              <th className="py-2 px-3 text-left">Active</th>
              <th className="py-2 px-3 text-left">Started At</th>
              <th className="py-2 px-3 text-left">Ended At</th>
            </tr>
          </thead>
          <tbody>
            {challenges.map(ch => (
              <tr key={ch.id} className={ch.is_active ? "bg-green-50" : ""}>
                <td className="py-2 px-3">{ch.id}</td>
                <td className="py-2 px-3">{ch.name}</td>
                <td className="py-2 px-3">{ch.is_active ? "Yes" : "No"}</td>
                <td className="py-2 px-3">{ch.started_at ? new Date(ch.started_at).toLocaleString() : "-"}</td>
                <td className="py-2 px-3">{ch.ended_at ? new Date(ch.ended_at).toLocaleString() : (ch.is_active ? "Ongoing" : "-")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
