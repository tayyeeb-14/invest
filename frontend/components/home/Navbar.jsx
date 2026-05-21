"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="section-wrap sticky top-4 z-20">
      <div className="glass flex items-center justify-between rounded-2xl px-4 py-3 shadow-glow">
        <Link href="/" className="flex items-center gap-2 text-sm font-bold tracking-wide">
          <ShieldCheck className="h-5 w-5 text-brand" />
          TRUSTVEST
        </Link>
        <nav className="hidden gap-6 text-sm text-textSub md:flex">
          <a href="#plans">Plans</a>
          <a href="#rewards">Rewards</a>
          <a href="#faq">FAQ</a>
          <a href="#security">Security</a>
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link href={user.role === "admin" ? "/admin" : "/dashboard"}>
                <Button variant="secondary">Dashboard</Button>
              </Link>
              <Button variant="ghost" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="secondary">Login</Button>
              </Link>
              <Link href="/register">
                <Button>Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
