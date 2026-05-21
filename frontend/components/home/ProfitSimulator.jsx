"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";

export default function ProfitSimulator() {
  const [amount, setAmount] = useState(300);
  const [percent, setPercent] = useState(12);
  const [days, setDays] = useState(30);

  const values = useMemo(() => {
    const safeDaily = Math.min(Math.max(percent, 1), 60);
    const daily = (amount * safeDaily) / 100;
    return {
      daily: daily.toFixed(2),
      total: (daily * days).toFixed(2)
    };
  }, [amount, percent, days]);

  return (
    <section className="section-wrap py-14">
      <div className="glass rounded-3xl p-6 md:p-8">
        <div className="grid gap-6 md:grid-cols-[1fr_1fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-accent">Simulation</p>
            <h2 className="mt-2 text-3xl">Daily income calculator</h2>
            <p className="mt-3 max-w-md text-sm text-textSub">
              Estimate projected daily and total returns. Daily percentage supports projections up to 60% for scenario
              planning.
            </p>
            <div className="mt-5 space-y-3 text-sm">
              <label className="block">
                Investment amount (₹)
                <input
                  type="number"
                  min={300}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-line bg-panel px-3 py-2 outline-none focus:border-accent"
                />
              </label>
              <label className="block">
                Daily percent
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={percent}
                  onChange={(e) => setPercent(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-line bg-panel px-3 py-2 outline-none focus:border-accent"
                />
              </label>
              <label className="block">
                Duration (days)
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-line bg-panel px-3 py-2 outline-none focus:border-accent"
                />
              </label>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="grid gap-4 md:content-center"
          >
            <div className="rounded-2xl border border-line bg-panel p-5">
              <p className="text-xs text-textSub">Estimated Daily Income</p>
              <p className="mt-2 text-3xl font-bold text-brand">₹{values.daily}</p>
            </div>
            <div className="rounded-2xl border border-line bg-panel p-5">
              <p className="text-xs text-textSub">Projected Total Earnings</p>
              <p className="mt-2 text-3xl font-bold text-accent">₹{values.total}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
