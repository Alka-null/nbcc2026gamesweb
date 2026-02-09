"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/app/components/AdminAuthProvider";

export default function Logout() {
  const router = useRouter();
  const { logout } = useAdminAuth();
  
  useEffect(() => {
    logout();
    router.push("/auth/login");
  }, [router, logout]);
  
  return null;
}
