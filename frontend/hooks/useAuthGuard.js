"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export function useAuthGuard({ requireAdmin = false } = {}) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      router.replace("/login");
      return;
    }

    if (requireAdmin && user.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [loading, user, requireAdmin, router]);

  return { user, loading };
}
