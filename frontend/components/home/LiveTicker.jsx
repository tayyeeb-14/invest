"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";

export default function LiveTicker() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalActiveInvestments: 0,
    totalVolume: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get("/public/live-stats");
        setStats(data.stats);
      } catch (error) {
        // keep fallback values
      }
    };

    fetchStats();
  }, []);

  const tickerItems = useMemo(
    () => [
      `Active Investors: ${stats.totalUsers}`,
      `Live Investments: ${stats.totalActiveInvestments}`,
      `Secured Volume: ₹${Number(stats.totalVolume || 0).toLocaleString("en-IN")}`,
      "KYC and withdrawal checks active",
      "Real-time wallet monitoring enabled"
    ],
    [stats]
  );

  const looped = [...tickerItems, ...tickerItems];

  return (
    <section className="section-wrap py-6">
      <div className="overflow-hidden rounded-xl border border-line bg-panel">
        <div className="flex w-max animate-ticker gap-12 px-6 py-3 text-sm text-textSub">
          {looped.map((item, index) => (
            <span key={`${item}-${index}`}>{item}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
