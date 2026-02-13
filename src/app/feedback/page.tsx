"use client";
import { useState, useEffect } from "react";

export default function FeedbackPage() {
  const [uniqueCode, setUniqueCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [clusterSalesArea, setClusterSalesArea] = useState("");
  const [digitalSalesTool, setDigitalSalesTool] = useState("");
  const [whatWorks, setWhatWorks] = useState("");
  const [whatIsConfusing, setWhatIsConfusing] = useState("");
  const [whatCanBeBetter, setWhatCanBeBetter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const savedCode = localStorage.getItem("user_unique_code");
    if (savedCode) {
      setUniqueCode(savedCode);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("https://nbcc2026gamesbackend.onrender.com/api/gameplay/feedback/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unique_code: uniqueCode.trim() || "anonymous",
          full_name: fullName.trim(),
          cluster_sales_area: clusterSalesArea.trim(),
          digital_sales_tool: digitalSalesTool.trim(),
          what_works: whatWorks.trim(),
          what_is_confusing: whatIsConfusing.trim(),
          what_can_be_better: whatCanBeBetter.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || data.detail || data.message || "Failed to submit feedback");
      }
      setSubmissionResponse(data);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Failed to submit feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const [submissionResponse, setSubmissionResponse] = useState<{ success: boolean; message: string; feedback_id?: number } | null>(null);

  function handleReset() {
    setFullName("");
    setClusterSalesArea("");
    setDigitalSalesTool("");
    setWhatWorks("");
    setWhatIsConfusing("");
    setWhatCanBeBetter("");
    setSubmitted(false);
    setError("");
    setSubmissionResponse(null);
  }

  if (submitted && submissionResponse) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center animate-fade-in">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Thank You!</h1>
          <p className="text-green-700 font-semibold mb-2">{submissionResponse.message}</p>
          {submissionResponse.feedback_id && (
            <p className="text-gray-500 mb-6">Feedback ID: <span className="font-mono">{submissionResponse.feedback_id}</span></p>
          )}
          <button
            onClick={handleReset}
            className="bg-gradient-to-r from-green-600 to-lime-400 text-white px-6 py-3 rounded-lg font-semibold hover:scale-105 transition-transform duration-200"
          >
            Submit Another Response
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-8 animate-fade-in">
        <h1 className="text-4xl font-extrabold mb-2 text-center bg-gradient-to-r from-green-600 to-lime-400 bg-clip-text text-transparent">
          Your Feedback Is Gold to us
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Before you go, please share your thoughts - your feedback helps us improve and serve you better.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* 1. Full Name */}
          <div className="flex flex-col gap-2">
            <label htmlFor="fullName" className="font-semibold text-gray-700">
              1. What is your Full Name? <span className="text-red-500">*</span>
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              className="border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
              required
            />
          </div>

          {/* 2. Cluster/Sales Area */}
          <div className="flex flex-col gap-2">
            <label htmlFor="clusterSalesArea" className="font-semibold text-gray-700">
              2. Input your Cluster/Sales Area <span className="text-red-500">*</span>
            </label>
            <input
              id="clusterSalesArea"
              type="text"
              value={clusterSalesArea}
              onChange={(e) => setClusterSalesArea(e.target.value)}
              placeholder="Enter your cluster or sales area"
              className="border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
              required
            />
          </div>

          {/* 3. Select Digital Sales Tool */}
          <div className="flex flex-col gap-2">
            <label htmlFor="digitalSalesTool" className="font-semibold text-gray-700">
              3. Select Digital Sales Tool <span className="text-red-500">*</span>
            </label>
            <select
              id="digitalSalesTool"
              value={digitalSalesTool}
              onChange={(e) => setDigitalSalesTool(e.target.value)}
              className="border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all bg-white"
              required
            >
              <option value="" disabled>Select a tool...</option>
              <option value="SEM">SEM</option>
              <option value="Asset Manager">Asset Manager</option>
              <option value="QuickDrinks">QuickDrinks</option>
              <option value="DMS">DMS</option>
            </select>
          </div>

          {/* 4. What do you value most about the app? */}
          <div className="flex flex-col gap-2">
            <label htmlFor="whatWorks" className="font-semibold text-gray-700">
              4. What do you value most about the app? <span className="text-red-500">*</span>
            </label>
            <textarea
              id="whatWorks"
              value={whatWorks}
              onChange={(e) => setWhatWorks(e.target.value)}
              placeholder="Share what you value most..."
              className="border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all min-h-[120px]"
              required
            />
          </div>

          {/* 5. What one improvement would make the app better for you? */}
          <div className="flex flex-col gap-2">
            <label htmlFor="whatCanBeBetter" className="font-semibold text-gray-700">
              5. What one improvement would make the app better for you? <span className="text-red-500">*</span>
            </label>
            <textarea
              id="whatCanBeBetter"
              value={whatCanBeBetter}
              onChange={(e) => setWhatCanBeBetter(e.target.value)}
              placeholder="Suggest one improvement..."
              className="border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all min-h-[120px]"
              required
            />
          </div>

          {/* 6. What immediate digital/RTC support would have the biggest impact on your performance? */}
          <div className="flex flex-col gap-2">
            <label htmlFor="whatIsConfusing" className="font-semibold text-gray-700">
              6. What immediate digital/RTC support would have the biggest impact on your performance? <span className="text-red-500">*</span>
            </label>
            <textarea
              id="whatIsConfusing"
              value={whatIsConfusing}
              onChange={(e) => setWhatIsConfusing(e.target.value)}
              placeholder="Describe the support that would help you most..."
              className="border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all min-h-[120px]"
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
            className="bg-gradient-to-r from-green-600 to-lime-400 text-white px-6 py-3 rounded-lg text-lg font-semibold shadow-lg hover:scale-105 transition-transform duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span>
                Submitting...
              </span>
            ) : (
              "Submit Feedback"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
