"use client";

import { motion } from "framer-motion";

export default function StatCard({ label, value, hint, icon: Icon, tone = "brand" }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-textSub">{label}</p>
        {Icon ? <Icon className={`h-4 w-4 ${tone === "brand" ? "text-brand" : "text-accent"}`} /> : null}
      </div>
      <p className="mt-2 text-2xl font-bold text-textMain">{value}</p>
      {hint ? <p className="mt-1 text-xs text-textSub">{hint}</p> : null}
    </motion.article>
  );
}
