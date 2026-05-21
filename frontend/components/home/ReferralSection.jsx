"use client";

import { motion } from "framer-motion";
import { Users, WalletCards } from "lucide-react";

export default function ReferralSection() {
  return (
    <section id="rewards" className="section-wrap py-14">
      <div className="grid gap-4 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-2xl p-6"
        >
          <Users className="h-5 w-5 text-brand" />
          <h3 className="mt-4 text-2xl">Referral income network</h3>
          <p className="mt-3 text-sm text-textSub">
            Share your referral code, build your trusted team, and receive referral income when your referred members
            activate investments.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.06 }}
          className="glass rounded-2xl p-6"
        >
          <WalletCards className="h-5 w-5 text-accent" />
          <h3 className="mt-4 text-2xl">Daily profit calculator</h3>
          <p className="mt-3 text-sm text-textSub">
            Simulate earnings by amount and daily percentage (up to 60%) inside your dashboard before activating a
            plan.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
