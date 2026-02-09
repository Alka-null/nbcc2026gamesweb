"use client";
import { AdminAuthProvider, ProtectedRoute } from "./AdminAuthProvider";
import ConditionalNavbar from "./ConditionalNavbar";
import MainWrapper from "./MainWrapper";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <ConditionalNavbar />
      <ProtectedRoute>
        <MainWrapper>{children}</MainWrapper>
      </ProtectedRoute>
    </AdminAuthProvider>
  );
}
