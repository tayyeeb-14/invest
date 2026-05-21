const badgeStyle = {
  pending: "bg-yellow-300/15 text-yellow-200",
  completed: "bg-emerald-400/15 text-emerald-200",
  rejected: "bg-rose-400/15 text-rose-200"
};

export default function TransactionTable({ transactions = [] }) {
  return (
    <div className="glass rounded-2xl p-4">
      <p className="mb-3 text-sm font-semibold">Transaction history</p>
      <div className="overflow-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-xs text-textSub">
            <tr>
              <th className="py-2">Type</th>
              <th className="py-2">Amount</th>
              <th className="py-2">Status</th>
              <th className="py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx._id} className="border-t border-line">
                <td className="py-3 capitalize">{tx.type}</td>
                <td className="py-3">
                  {tx.direction === "credit" ? "+" : "-"}₹{tx.amount}
                </td>
                <td className="py-3">
                  <span className={`rounded-full px-2 py-1 text-xs ${badgeStyle[tx.status] || badgeStyle.pending}`}>
                    {tx.status}
                  </span>
                </td>
                <td className="py-3 text-textSub">{new Date(tx.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {!transactions.length && (
              <tr>
                <td colSpan={4} className="py-4 text-center text-textSub">
                  No transactions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
