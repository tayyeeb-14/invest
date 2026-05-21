"use client";

import { motion } from "framer-motion";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <motion.div
        initial={{ opacity: 0.3, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ repeat: Infinity, repeatType: "reverse", duration: 0.9 }}
        className="glass rounded-2xl border px-8 py-6 text-sm text-textSub shadow-glow"
      >
        Loading secure workspace...
      </motion.div>
    </div>
  );
}
