"use client";

import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Riya Sharma",
    role: "Level 3 Member",
    quote:
      "The dashboard feels like a real financial platform. I can track every request and every level move clearly."
  },
  {
    name: "Aditya Verma",
    role: "Referral Partner",
    quote:
      "Referral earnings and wallet updates are transparent. I appreciate the anti-fraud warnings and KYC checks."
  },
  {
    name: "Neha Kulkarni",
    role: "Premium User",
    quote: "The profit simulation helps me plan before I invest. The UI is modern and professional."
  }
];

export default function TestimonialsSection() {
  return (
    <section className="section-wrap py-14">
      <p className="text-xs uppercase tracking-[0.25em] text-accent">Client Voices</p>
      <h2 className="mt-2 text-3xl">Built for confidence, not hype.</h2>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {testimonials.map((item, i) => (
          <motion.article
            key={item.name}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="glass rounded-2xl p-5"
          >
            <p className="text-sm leading-relaxed text-textSub">"{item.quote}"</p>
            <p className="mt-4 text-sm font-semibold text-textMain">{item.name}</p>
            <p className="text-xs text-textSub">{item.role}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
