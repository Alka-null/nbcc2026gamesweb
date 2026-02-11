"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";

interface AdminAuthContextType {
  isAdminLoggedIn: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if admin is logged in on mount
    const token = localStorage.getItem("admin_token");
    setIsAdminLoggedIn(!!token);
    setIsLoading(false);
  }, []);

  const login = (token: string) => {
    localStorage.setItem("admin_token", token);
    setIsAdminLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem("admin_token");
    setIsAdminLoggedIn(false);
  };

  if (isLoading) {
    return null; // or a loading spinner
  }

  return (
    <AdminAuthContext.Provider value={{ isAdminLoggedIn, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return context;
}

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAdminLoggedIn } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Public routes that don't require admin login
  const publicRoutes = ["/quiz-game", "/auth/register", "/auth/login", "/feedback"];
  const isPublicRoute = publicRoutes.some(route => pathname?.startsWith(route));

  useEffect(() => {
    // Redirect home to appropriate page
    if (pathname === "/") {
      if (isAdminLoggedIn) {
        router.push("/dashboard");
      } else {
        router.push("/auth/login");
      }
    } else if (!isAdminLoggedIn && !isPublicRoute) {
      router.push("/auth/login");
    }
  }, [isAdminLoggedIn, isPublicRoute, router, pathname]);

  // Allow access to public routes
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Handle home route
  if (pathname === "/") {
    return null; // Will redirect
  }

  // Require login for admin routes
  if (!isAdminLoggedIn) {
    return null; // Will redirect to login
  }

  return <>{children}</>;
}
