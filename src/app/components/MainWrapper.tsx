"use client";
import { usePathname } from "next/navigation";

export default function MainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Public routes that don't need the default admin layout padding
  const publicRoutes = ["/quiz-game", "/auth/register", "/auth/login", "/feedback"];
  const isPublicRoute = publicRoutes.some(route => pathname?.startsWith(route));

  if (isPublicRoute) {
    return <main>{children}</main>;
  }

  return <main className="p-8 max-w-5xl mx-auto">{children}</main>;
}
