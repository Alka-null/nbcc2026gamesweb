"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function RequireAdmin({ children }: { children: React.ReactNode }) {
  const [checked, setChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
    if (!token) {
      router.replace("/auth/login");
    } else {
      setChecked(true);
    }
  }, [router]);

  if (!checked) return null;
  return <>{children}</>;
}
