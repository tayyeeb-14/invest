"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/ui/AuthShell";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { user } = await login(form);
      router.push(user.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to manage your wallet, investments and secure transactions."
      footerText="New to TrustVest?"
      footerHref="/register"
      footerLabel="Create account"
    >
      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block text-sm">
          Email
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-line bg-panel px-3 py-2 outline-none focus:border-accent"
            required
          />
        </label>
        <label className="block text-sm">
          Password
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-line bg-panel px-3 py-2 outline-none focus:border-accent"
            required
          />
        </label>
        {error && <p className="rounded-lg bg-danger/15 px-3 py-2 text-sm text-rose-300">{error}</p>}
        <Button className="w-full py-3" disabled={loading}>
          {loading ? "Signing in..." : "Sign in securely"}
        </Button>
      </form>
    </AuthShell>
  );
}
