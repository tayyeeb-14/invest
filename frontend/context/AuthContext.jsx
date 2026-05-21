"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const clearAuth = () => {
    localStorage.removeItem("trustvest_token");
    setUser(null);
  };

  const loadProfile = async () => {
    try {
      const { data } = await api.get("/auth/me");
      setUser(data.user);
    } catch (error) {
      clearAuth();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("trustvest_token");
    if (!token) {
      setLoading(false);
      return;
    }
    loadProfile();
  }, []);

  const login = async (payload) => {
    const { data } = await api.post("/auth/login", payload);
    localStorage.setItem("trustvest_token", data.token);
    setUser(data.user);
    return data;
  };

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    localStorage.setItem("trustvest_token", data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => clearAuth();

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      refreshProfile: loadProfile
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
