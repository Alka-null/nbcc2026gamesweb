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
      // Try modern clipboard API first (requires HTTPS)
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(code);
      } else {
        // Fallback for mobile HTTP / older browsers
        const textArea = document.createElement("textarea");
        textArea.value = code;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // If all copy methods fail, still show visual feedback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed top-3 right-3 z-[9999]" style={{ position: 'fixed' }}>
      <button
        onClick={handleCopy}
        className="flex items-center gap-2 bg-white border border-gray-200 shadow-lg rounded-full px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm transition-all group"
        title="Click to copy your code"
      >
        <span className="text-gray-500 font-medium hidden sm:inline">Your Code:</span>
        <span className="text-gray-500 font-medium sm:hidden">Code:</span>
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
