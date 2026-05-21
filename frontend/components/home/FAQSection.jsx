const faqs = [
  {
    q: "What is the minimum starting investment?",
    a: "TrustVest starts at ₹300. Levels increase by ₹200 and continue up to level 5."
  },
  {
    q: "How does withdrawal approval work?",
    a: "Withdrawal requests are reviewed in the admin panel and require verified KYC status."
  },
  {
    q: "Is referral income automated?",
    a: "Yes. Eligible referral bonuses are credited when referred users activate investments."
  },
  {
    q: "Can I view all transactions?",
    a: "Every deposit, withdrawal, referral and investment transaction is visible in transaction history."
  }
];

export default function FAQSection() {
  return (
    <section id="faq" className="section-wrap py-14">
      <h2 className="text-3xl">Frequently asked questions</h2>
      <div className="mt-6 grid gap-3">
        {faqs.map((item) => (
          <details key={item.q} className="glass rounded-xl p-4">
            <summary className="cursor-pointer text-sm font-semibold">{item.q}</summary>
            <p className="mt-2 text-sm text-textSub">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
