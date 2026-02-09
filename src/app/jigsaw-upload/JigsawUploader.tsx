"use client";
import { useState } from "react";
import { createZipFromImages } from "./zip-utils";

export default function JigsawUploader() {
  const [pieces, setPieces] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPieces([]);
    setLoading(true);
    const form = e.currentTarget;
    const fileInput = form.elements.namedItem("image") as HTMLInputElement;
    if (!fileInput?.files?.[0]) return;
    const formData = new FormData();
    formData.append("image", fileInput.files[0]);
    try {
      const res = await fetch("/api/jigsaw-split", { method: "POST", body: formData });
      const data = await res.json();
      if (data.pieces) setPieces(data.pieces);
      else setError(data.error || "Unknown error");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function downloadPiece(piece: string, idx: number) {
    const a = document.createElement("a");
    a.href = piece;
    a.download = `jigsaw_piece_${idx + 1}.png`;
    a.click();
  }

  async function sendToBackend() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:8000/api/jigsaw/upload/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pieces }),
      });
      if (!res.ok) throw new Error("Failed to send to backend");
      alert("Jigsaw pieces sent to backend!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function downloadZip() {
    if (!pieces.length) return;
    const zipBlob = await createZipFromImages(pieces);
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "jigsaw_pieces.zip";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <form onSubmit={handleUpload} className="mb-6 flex flex-col gap-4">
        <input type="file" name="image" accept="image/*" required />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>
          {loading ? "Processing..." : "Split Image"}
        </button>
      </form>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {pieces.length > 0 && (
        <div>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {pieces.map((piece, idx) => (
              <div key={idx} className="border p-1 flex flex-col items-center">
                <img src={piece} alt={`piece ${idx + 1}`} className="w-20 h-20 object-cover" />
                <button onClick={() => downloadPiece(piece, idx)} className="text-xs mt-1 underline text-blue-700">Download</button>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mb-4">
            <button onClick={downloadZip} className="bg-blue-700 text-white px-4 py-2 rounded" disabled={loading}>
              Download All as Zip
            </button>
            <button onClick={sendToBackend} className="bg-green-600 text-white px-4 py-2 rounded" disabled={loading}>
              {loading ? "Sending..." : "Send All to Backend"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
