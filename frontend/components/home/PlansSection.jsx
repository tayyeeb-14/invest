"use client";

import { motion } from "framer-motion";

const plans = [
  { level: 1, amount: 300, daily: "Up to 6%", tone: "for starting investors" },
  { level: 2, amount: 500, daily: "Up to 9%", tone: "for stable compounding" },
  { level: 3, amount: 700, daily: "Up to 12%", tone: "for growth-focused users" },
  { level: 4, amount: 900, daily: "Up to 16%", tone: "for advanced portfolios" },
  { level: 5, amount: 1100, daily: "Up to 20%", tone: "for premium participants" }
];

export default function PlansSection() {
  return (
    <section id="plans" className="section-wrap py-14">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-accent">Investment Levels</p>
          <h2 className="mt-2 text-3xl">₹300 to ₹1100 unlock progression</h2>
        </div>
        <p className="hidden max-w-sm text-right text-sm text-textSub md:block">
          Every ₹200 increase unlocks the next level. The system caps at level 5 for risk-managed structure.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.level}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.06 }}
            className="glass rounded-2xl p-4"
          >
            <p className="text-xs text-textSub">LEVEL {plan.level}</p>
            <p className="mt-3 text-3xl font-bold text-brand">₹{plan.amount}</p>
            <p className="mt-2 text-sm text-textMain">{plan.daily} daily estimate</p>
            <p className="mt-1 text-xs text-textSub">{plan.tone}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
