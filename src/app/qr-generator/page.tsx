"use client";
import { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

export default function QrGeneratorPage() {
  const [text, setText] = useState("");
  const gameUrl = "https://play.nbccgames.com"; // Change to your actual game URL
  const [showQR, setShowQR] = useState(false);
  const qrRef = useRef<HTMLCanvasElement>(null);

  function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setShowQR(true);
  }

  function handleDownload() {
    const canvas = qrRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "qrcode.png";
    a.click();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">QR Code Generator</h1>
      <form onSubmit={handleGenerate} className="mb-4 flex gap-2">
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Enter text or URL"
          className="border px-2 py-1 rounded w-80"
          required
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Generate</button>
        <button
          type="button"
          className="bg-gray-600 text-white px-4 py-2 rounded"
          onClick={() => { setText(gameUrl); setShowQR(false); }}
        >
          Use Play Games URL
        </button>
      </form>
      {showQR && (
        <div className="flex flex-col items-center gap-2">
          <QRCodeCanvas value={text} size={200} ref={qrRef} />
          <button onClick={handleDownload} className="bg-green-600 text-white px-4 py-2 rounded">Download QR Code</button>
        </div>
      )}
    </div>
  );
}
