"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/ui/AuthShell";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    referralCode: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      router.push("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create secure account"
      subtitle="Register your TrustVest profile with referral and KYC-ready setup."
      footerText="Already registered?"
      footerHref="/login"
      footerLabel="Login here"
    >
      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block text-sm">
          Full name
          <input
            type="text"
            value={form.fullName}
            onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-line bg-panel px-3 py-2 outline-none focus:border-accent"
            required
          />
        </label>
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
          Phone
          <input
            type="text"
            value={form.phone}
            onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-line bg-panel px-3 py-2 outline-none focus:border-accent"
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
        <label className="block text-sm">
          Referral Code (optional)
          <input
            type="text"
            value={form.referralCode}
            onChange={(e) => setForm((prev) => ({ ...prev, referralCode: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-line bg-panel px-3 py-2 outline-none focus:border-accent"
          />
        </label>
        {error && <p className="rounded-lg bg-danger/15 px-3 py-2 text-sm text-rose-300">{error}</p>}
        <Button className="w-full py-3" disabled={loading}>
          {loading ? "Creating account..." : "Register securely"}
        </Button>
      </form>
    </AuthShell>
  );
}
