"use client";
import { useState, useEffect } from "react";
// import RequireAdmin from "../auth/require-admin"; // temporarily disabled

function downloadAsCSV(data: Feedback[]) {
  if (!data.length) return alert("No feedback data to download.");
  const headers = [
    "Feedback ID", "Full Name", "Cluster/Sales Area", "Digital Sales Tool",
    "What do you value most?", "What improvement?",
    "Digital/RTC support impact?", "Unique Code", "Submitted At"
  ];
  const rows = data.map((item) => [
    item.id ?? "",
    item.full_name ?? "",
    item.cluster_sales_area ?? "",
    item.digital_sales_tool ?? "",
    item.what_works ?? "",
    item.what_can_be_better ?? "",
    item.what_is_confusing ?? "",
    item.unique_code ?? "",
    item.created_at ?? "",
  ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(","));
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `feedback_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadAsWord(data: Feedback[]) {
  if (!data.length) return alert("No feedback data to download.");
  let html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'><head><meta charset='utf-8'><title>Feedback Report</title></head><body>`;
  html += `<h1 style="text-align:center;color:#16a34a;">Feedback Report</h1>`;
  html += `<p style="text-align:center;color:#666;">Generated on ${new Date().toLocaleDateString()}</p><hr/>`;
  data.forEach((item, i) => {
    html += `<div style="margin-bottom:20px;page-break-inside:avoid;">`;
    html += `<h3 style="color:#16a34a;">Response #${i + 1} ${item.full_name ? '— ' + item.full_name : ''}</h3>`;
    html += `<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%;font-size:14px;">`;
    const fields: [string, string][] = [
      ["Full Name", item.full_name],
      ["Cluster/Sales Area", item.cluster_sales_area],
      ["Digital Sales Tool", item.digital_sales_tool],
      ["What do you value most?", item.what_works],
      ["What improvement?", item.what_can_be_better],
      ["Digital/RTC support impact?", item.what_is_confusing],
      ["Unique Code", item.unique_code],
      ["Submitted At", item.created_at],
    ];
    fields.forEach(([label, val]) => {
      html += `<tr><td style="font-weight:bold;background:#f3f4f6;width:35%;">${label}</td><td>${val ?? ""}</td></tr>`;
    });
    html += `</table></div>`;
  });
  html += `</body></html>`;
  const blob = new Blob([html], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `feedback_${new Date().toISOString().slice(0, 10)}.doc`;
  a.click();
  URL.revokeObjectURL(url);
}

interface Feedback {
  id: number;
  unique_code: string;
  full_name: string;
  cluster_sales_area: string;
  digital_sales_tool: string;
  what_works: string;
  what_is_confusing: string;
  what_can_be_better: string;
  created_at: string;
}

export default function FeedbackListPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  async function fetchFeedbacks() {
    try {
      const res = await fetch(
        "https://nbcc2026gamesbackend.onrender.com/api/gameplay/feedback/all/"
      );
      const data = await res.json();
      if (!res.ok) throw new Error("Failed to fetch feedbacks");
      setFeedbacks(data.feedbacks || []);
    } catch (err: any) {
      setError(err.message || "Failed to load feedbacks");
    } finally {
      setLoading(false);
    }
  }

  const filtered = feedbacks.filter((fb) => {
    const term = searchTerm.toLowerCase();
    return (
      (fb.full_name || "").toLowerCase().includes(term) ||
      (fb.cluster_sales_area || "").toLowerCase().includes(term) ||
      (fb.digital_sales_tool || "").toLowerCase().includes(term) ||
      (fb.unique_code || "").toLowerCase().includes(term) ||
      (fb.what_works || "").toLowerCase().includes(term) ||
      (fb.what_is_confusing || "").toLowerCase().includes(term) ||
      (fb.what_can_be_better || "").toLowerCase().includes(term)
    );
  });

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString("en-ZA", {
      dateStyle: "short",
      timeStyle: "short",
    });
  }

  return (
    // <RequireAdmin> temporarily disabled
      <div className="max-w-[1600px]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold">All User Feedbacks</h1>
            <p className="text-gray-500 text-sm mt-1">
              {filtered.length} of {feedbacks.length} feedback{feedbacks.length !== 1 ? "s" : ""}
            </p>
          </div>
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 w-full sm:w-64 text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          />
        </div>

        <div className="flex gap-3 mb-6">
          <button
            type="button"
            onClick={() => downloadAsCSV(filtered)}
            className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors shadow"
          >
            📊 Download Excel
          </button>
          <button
            type="button"
            onClick={() => downloadAsWord(filtered)}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow"
          >
            📄 Download Word
          </button>
        </div>

        {loading && (
          <div className="text-center py-12 text-gray-500">Loading feedbacks...</div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            {searchTerm ? "No feedbacks match your search." : "No feedbacks yet."}
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-sm border-collapse min-w-[1200px]">
              <thead>
                <tr className="bg-gray-800 text-white text-left text-xs uppercase tracking-wider">
                  <th className="px-3 py-3 font-semibold w-8">#</th>
                  <th className="px-3 py-3 font-semibold whitespace-nowrap">Full Name</th>
                  <th className="px-3 py-3 font-semibold whitespace-nowrap">Cluster / Area</th>
                  <th className="px-3 py-3 font-semibold whitespace-nowrap">Sales Tool</th>
                  <th className="px-3 py-3 font-semibold">What they value most</th>
                  <th className="px-3 py-3 font-semibold">One improvement</th>
                  <th className="px-3 py-3 font-semibold">Digital/RTC support impact</th>
                  <th className="px-3 py-3 font-semibold whitespace-nowrap">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((fb, idx) => (
                  <tr
                    key={fb.id}
                    className={`border-b border-gray-100 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition-colors`}
                  >
                    <td className="px-3 py-2.5 text-gray-400 text-xs">{idx + 1}</td>
                    <td className="px-3 py-2.5 font-medium text-gray-900 whitespace-nowrap">
                      {fb.full_name || <span className="text-gray-300 italic">—</span>}
                    </td>
                    <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">
                      {fb.cluster_sales_area || <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      {fb.digital_sales_tool ? (
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded">
                          {fb.digital_sales_tool}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-gray-700 max-w-[250px]">
                      <span className="line-clamp-2">{fb.what_works || "—"}</span>
                    </td>
                    <td className="px-3 py-2.5 text-gray-700 max-w-[250px]">
                      <span className="line-clamp-2">{fb.what_can_be_better || "—"}</span>
                    </td>
                    <td className="px-3 py-2.5 text-gray-700 max-w-[250px]">
                      <span className="line-clamp-2">{fb.what_is_confusing || "—"}</span>
                    </td>
                    <td className="px-3 py-2.5 text-gray-500 text-xs whitespace-nowrap">
                      {formatDate(fb.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    // </RequireAdmin>
  );
}
