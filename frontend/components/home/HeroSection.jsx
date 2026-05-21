"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { BadgeCheck, Landmark, LockKeyhole, Shield } from "lucide-react";
import Button from "@/components/ui/Button";

const badges = [
  { icon: Shield, label: "Bank-grade account security" },
  { icon: LockKeyhole, label: "JWT protected transaction routes" },
  { icon: Landmark, label: "KYC-gated withdrawal approvals" },
  { icon: BadgeCheck, label: "Transparent daily projection engine" }
];

export default function HeroSection() {
  return (
    <section className="section-wrap grid gap-6 py-16 md:grid-cols-[1.2fr_0.8fr] md:items-center">
      <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <p className="mb-3 inline-flex rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
          Trusted Wealth Infrastructure
        </p>
        <h1 className="text-4xl leading-tight md:text-6xl">
          Grow your capital with <span className="text-brand">structured trust</span>.
        </h1>
        <p className="mt-5 max-w-xl text-base text-textSub">
          TrustVest combines secure wallet controls, level-based investment progression, KYC checks, and monitored
          withdrawals to create a professional investment journey.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/register">
            <Button className="px-6 py-3">Create Account</Button>
          </Link>
          <a href="#plans">
            <Button variant="secondary" className="px-6 py-3">
              View Plans
            </Button>
          </a>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.15 }}
        className="glass rounded-3xl p-5"
      >
        <p className="mb-5 text-xs uppercase tracking-[0.25em] text-textSub">Trust Signals</p>
        <div className="space-y-3">
          {badges.map((item) => (
            <div key={item.label} className="flex items-center gap-3 rounded-xl border border-line bg-panel/70 p-3">
              <item.icon className="h-4 w-4 text-brand" />
              <p className="text-sm text-textMain">{item.label}</p>
            </div>
          ))}
        </div>
        <p id="security" className="mt-4 rounded-lg border border-warning/40 bg-warning/10 p-3 text-xs text-yellow-200">
          Anti-fraud notice: Never share OTP, password, or private key. TrustVest support will never ask for them.
        </p>
      </motion.div>
    </section>
  );
}
