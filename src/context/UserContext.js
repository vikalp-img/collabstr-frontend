"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { apiWithAuth } from "@/lib/apiService";
import { API_ENDPOINTS } from "@/lib/apiEndpoints";

const UserContext = createContext(undefined);

export function UserProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Guard for creator and brand redirection
  useEffect(() => {
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("userRole");
      const token = localStorage.getItem("authToken");

      const publicRoutes = [
        "/login",
        "/signup",
        "/terms",
        "/privacy",
        "/cookies",
        "/about",
        "/blog",
        "/contact",
        "/pricing",
        "/creators",
        "/categories",
        "/return-policy",
        "/reset-password",
        "/forgot-password",
        "/support",
      ];

      if (token && role === "creator") {
        const isPublicRoute = publicRoutes.some(
          (route) => pathname === route || pathname.startsWith(route + "/"),
        );

        // Only redirect to dashboard if they are NOT on a creator route AND NOT on a public route
        if (!pathname.startsWith("/creator") && !isPublicRoute) {
          router.push("/creator/dashboard");
        }
      }

      if (token && role === "brand") {
        const isPublicRoute = publicRoutes.some(
          (route) => pathname === route || pathname.startsWith(route + "/"),
        );

        // Redirect brand users to brand home if they are on non-brand, non-public routes
        if (!pathname.startsWith("/brand") && !isPublicRoute) {
          router.push("/brand/home");
        }
      }
    }
  }, [pathname, router]);

  const fetchProfile = useCallback(async () => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("authToken");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await apiWithAuth.get(API_ENDPOINTS.USER.PROFILE);
      const data = response?.data?.data || response?.data || null;
      setUser(data);
    } catch (err) {
      console.error("Failed to fetch user profile", err);
      // If 401, the interceptor in apiService will already clear the token
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearUser = useCallback(() => {
    setUser(null);
    setLoading(false);
  }, []);

  // Fetch profile on mount or when navigating
  useEffect(() => {
    fetchProfile();
  }, [pathname, fetchProfile]);

  return (
    <UserContext.Provider
      value={{ user, loading, fetchProfile, clearUser, setUser }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
