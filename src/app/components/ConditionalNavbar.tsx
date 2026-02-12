"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function ConditionalNavbar() {
  const pathname = usePathname();
  
  // Hide navbar on public-facing routes
  const publicRoutes = ["/quiz-game", "/auth/register", "/auth/login", "/feedback"];
  const shouldHideNavbar = publicRoutes.some(route => pathname?.startsWith(route));

  if (shouldHideNavbar) {
    return null;
  }

  return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex gap-8 items-center">
      <span className="font-bold text-lg">NBCC Admin</span>
      <Link href="/dashboard">Dashboard</Link>
      <Link href="/users">Users</Link>
      <Link href="/games">Games</Link>
      <Link href="/jigsaw-upload">Jigsaw Upload</Link>
      <Link href="/qr-generator">QR Generator</Link>
      <Link href="/quiz-game">Quiz Game</Link>
      <Link href="/admin-challenge">Admin Challenge</Link>
      <Link href="/feedback-list">Feedbacks</Link>
      <Link href="/auth/login" className="ml-auto">Admin Login</Link>
      <Link href="/auth/logout">Logout</Link>
    </nav>
  );
}
