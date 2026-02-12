"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

function UserCodeBadge() {
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("user_unique_code");
    if (saved) setCode(saved);

    // Listen for storage changes (e.g. code saved from another tab or after login)
    const onStorage = () => {
      setCode(localStorage.getItem("user_unique_code"));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Also re-check periodically in case it was set on the same page
  useEffect(() => {
    const interval = setInterval(() => {
      const saved = localStorage.getItem("user_unique_code");
      if (saved !== code) setCode(saved);
    }, 1000);
    return () => clearInterval(interval);
  }, [code]);

  if (!code) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="fixed top-3 right-3 z-50">
      <button
        onClick={handleCopy}
        className="flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg rounded-full px-4 py-2 text-sm hover:bg-white transition-all group"
        title="Click to copy your code"
      >
        <span className="text-gray-500 font-medium">Your Code:</span>
        <span className="font-bold text-green-700 font-mono tracking-wide">{code}</span>
        <span className="text-gray-400 group-hover:text-green-600 transition-colors">
          {copied ? "✓" : "📋"}
        </span>
      </button>
    </div>
  );
}

export default function MainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Public routes that don't need the default admin layout padding
  const publicRoutes = ["/quiz-game", "/auth/register", "/auth/login", "/feedback"];
  const isPublicRoute = publicRoutes.some(route => pathname?.startsWith(route));

  if (isPublicRoute) {
    return (
      <main>
        <UserCodeBadge />
        {children}
      </main>
    );
  }

  return <main className="p-8 max-w-5xl mx-auto">{children}</main>;
}
