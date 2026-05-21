"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BellRing,
  CheckCircle2,
  ClipboardCopy,
  Coins,
  Landmark,
  ShieldAlert,
  TrendingUp,
  UploadCloud,
  UserPlus
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import api from "@/lib/api";
import { toAssetUrl } from "@/lib/media";
import Button from "@/components/ui/Button";
import StatCard from "@/components/dashboard/StatCard";
import LevelProgress from "@/components/dashboard/LevelProgress";
import EarningsChart from "@/components/dashboard/EarningsChart";
import TransactionTable from "@/components/dashboard/TransactionTable";
import NotificationPanel from "@/components/dashboard/NotificationPanel";

const statusStyles = {
  pending: "bg-amber-400/15 text-amber-200 border-amber-400/40 animate-pulse",
  approved: "bg-emerald-400/15 text-emerald-200 border-emerald-400/40",
  rejected: "bg-rose-400/15 text-rose-200 border-rose-400/40"
};

export default function DashboardPage() {
  const { loading, user } = useAuthGuard();
  const { logout } = useAuth();

  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [plans, setPlans] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [paymentSettings, setPaymentSettings] = useState(null);
  const [depositRequests, setDepositRequests] = useState([]);
  const [actionMessage, setActionMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  const [depositForm, setDepositForm] = useState({
    amount: 300,
    utr: ""
  });
  const [depositScreenshot, setDepositScreenshot] = useState(null);
  const [depositPreview, setDepositPreview] = useState("");
  const [withdrawForm, setWithdrawForm] = useState({
    amount: 200,
    upiId: "",
    bankName: ""
  });
  const [investForm, setInvestForm] = useState({
    planId: "",
    amount: 300
  });
  const [kycType, setKycType] = useState("aadhaar");
  const [kycFile, setKycFile] = useState(null);

  const fetchAll = async () => {
    try {
      const [summaryRes, txRes, plansRes, noteRes, paymentRes, depositRes] = await Promise.all([
        api.get("/wallet/summary"),
        api.get("/wallet/transactions"),
        api.get("/investments/plans"),
        api.get("/notifications"),
        api.get("/wallet/payment-settings"),
        api.get("/wallet/deposits/my")
      ]);
      setSummary(summaryRes.data);
      setTransactions(txRes.data.items);
      setPlans(plansRes.data.plans);
      setNotifications(noteRes.data.notifications);
      setPaymentSettings(paymentRes.data.settings);
      setDepositRequests(depositRes.data.requests);
      if (!investForm.planId && plansRes.data.plans.length) {
        setInvestForm((prev) => ({ ...prev, planId: plansRes.data.plans[0]._id }));
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard.");
    }
  };

  useEffect(() => {
    if (!loading && user) {
      fetchAll();
    }
  }, [loading, user]);

  useEffect(
    () => () => {
      if (depositPreview) {
        URL.revokeObjectURL(depositPreview);
      }
    },
    [depositPreview]
  );

  const projectedDailyReward = useMemo(() => {
    const active = summary?.activeInvestments || [];
    const total = active.reduce((acc, item) => acc + Number(item.estimatedDailyIncome || 0), 0);
    return total.toFixed(2);
  }, [summary]);

  const runAction = async (task) => {
    setBusy(true);
    setError("");
    setActionMessage("");
    try {
      const msg = await task();
      setActionMessage(msg || "Request submitted.");
      await fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Action failed.");
    } finally {
      setBusy(false);
    }
  };

  const handleCopyUpi = async () => {
    if (!paymentSettings?.upiId) {
      return;
    }
    try {
      await navigator.clipboard.writeText(paymentSettings.upiId);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 1600);
    } catch (e) {
      setError("Unable to copy UPI ID.");
    }
  };

  const onDepositScreenshotChange = (file) => {
    if (depositPreview) {
      URL.revokeObjectURL(depositPreview);
    }
    setDepositScreenshot(file || null);
    if (!file) {
      setDepositPreview("");
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    setDepositPreview(previewUrl);
  };

  const submitManualDeposit = async () => {
    if (!depositScreenshot) {
      throw new Error("Please attach a payment screenshot.");
    }
    const formData = new FormData();
    formData.append("amount", String(depositForm.amount));
    formData.append("utr", depositForm.utr);
    formData.append("screenshot", depositScreenshot);

    await api.post("/wallet/deposit", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });

    setDepositForm({ amount: 300, utr: "" });
    setDepositScreenshot(null);
    if (depositPreview) {
      URL.revokeObjectURL(depositPreview);
    }
    setDepositPreview("");
    return "Deposit proof submitted for manual verification.";
  };

  if (loading || !user) {
    return <div className="p-8 text-center text-textSub">Loading secure dashboard...</div>;
  }

  return (
    <main className="section-wrap py-8">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-accent">Client Dashboard</p>
          <h1 className="text-3xl">Welcome, {user.fullName}</h1>
        </div>
        <div className="flex gap-2">
          {user.role === "admin" && (
            <Link href="/admin">
              <Button variant="secondary">Admin Panel</Button>
            </Link>
          )}
          <Button variant="ghost" onClick={logout}>
            Logout
          </Button>
        </div>
      </header>

      <p className="mb-5 rounded-xl border border-warning/40 bg-warning/10 p-3 text-xs text-yellow-200">
        Security notice: Deposit verification is manual. Upload only genuine screenshots with correct UTR numbers.
      </p>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Wallet Balance"
          value={`INR ${Number(summary?.wallet?.balance || 0).toLocaleString("en-IN")}`}
          hint="Available for investment and withdrawals"
          icon={Coins}
        />
        <StatCard
          label="Total Earnings"
          value={`INR ${Number(summary?.wallet?.totalEarnings || 0).toLocaleString("en-IN")}`}
          hint="Includes referral and growth income"
          icon={TrendingUp}
          tone="accent"
        />
        <StatCard
          label="Team Income"
          value={`INR ${Number(summary?.wallet?.referralEarnings || 0).toLocaleString("en-IN")}`}
          hint={`Referrals: ${summary?.referralTeamCount || 0}`}
          icon={UserPlus}
        />
        <StatCard
          label="Daily Rewards"
          value={`INR ${projectedDailyReward}`}
          hint="Estimated from active investments"
          icon={Landmark}
          tone="accent"
        />
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <LevelProgress level={summary?.level} />
          <EarningsChart />
        </div>
        <NotificationPanel notifications={notifications} />
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="glass rounded-2xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Manual UPI QR Deposit</h2>
            <span
              className={`rounded-full border px-2 py-1 text-xs ${
                paymentSettings?.depositsEnabled
                  ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-200"
                  : "border-rose-400/40 bg-rose-500/10 text-rose-200"
              }`}
            >
              {paymentSettings?.depositsEnabled ? "Deposits Enabled" : "Deposits Disabled"}
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-2xl border border-line bg-panel p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-textSub">Scan and pay</p>
              <div className="mt-3 overflow-hidden rounded-xl border border-line bg-bg/80 p-2">
                {paymentSettings?.qrImageUrl ? (
                  <img
                    src={toAssetUrl(paymentSettings.qrImageUrl)}
                    alt="TrustVest UPI QR"
                    className="h-52 w-full rounded-lg object-contain"
                  />
                ) : (
                  <div className="flex h-52 items-center justify-center text-sm text-textSub">
                    QR will appear after admin upload.
                  </div>
                )}
              </div>
              <div className="mt-3 space-y-1 text-sm">
                <p className="text-textSub">UPI ID</p>
                <div className="flex items-center gap-2 rounded-lg border border-line bg-bg/80 px-3 py-2">
                  <p className="flex-1 truncate font-semibold text-brand">{paymentSettings?.upiId || "--"}</p>
                  <Button variant="secondary" className="px-2 py-1 text-xs" onClick={handleCopyUpi}>
                    {copiedUpi ? <CheckCircle2 className="h-4 w-4" /> : <ClipboardCopy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-textSub">
                  {paymentSettings?.accountName || "TrustVest Financial"} | {paymentSettings?.bankName || "Bank"}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-line bg-panel p-4">
              <p className="text-sm font-semibold">Submit payment proof</p>
              <p className="mt-1 text-xs text-textSub">
                {paymentSettings?.instructions || "Upload screenshot and enter correct UTR for verification."}
              </p>
              <div className="mt-3 space-y-2 text-sm">
                <input
                  type="number"
                  min={100}
                  value={depositForm.amount}
                  onChange={(e) =>
                    setDepositForm((prev) => ({
                      ...prev,
                      amount: Number(e.target.value)
                    }))
                  }
                  className="w-full rounded-lg border border-line bg-bg/80 px-3 py-2 outline-none focus:border-accent"
                  placeholder="Deposit amount"
                />
                <input
                  type="text"
                  value={depositForm.utr}
                  onChange={(e) =>
                    setDepositForm((prev) => ({
                      ...prev,
                      utr: e.target.value.toUpperCase()
                    }))
                  }
                  className="w-full rounded-lg border border-line bg-bg/80 px-3 py-2 outline-none focus:border-accent"
                  placeholder="UTR / Transaction reference"
                />
                <label className="block rounded-lg border border-dashed border-line bg-bg/80 px-3 py-2 text-xs text-textSub">
                  <span className="mb-2 inline-flex items-center gap-1 text-sm text-textMain">
                    <UploadCloud className="h-4 w-4 text-accent" />
                    Upload screenshot
                  </span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => onDepositScreenshotChange(e.target.files?.[0] || null)}
                    className="block w-full text-xs"
                  />
                </label>
                {depositPreview && (
                  <div className="overflow-hidden rounded-xl border border-line">
                    <img src={depositPreview} alt="Deposit screenshot preview" className="h-40 w-full object-cover" />
                  </div>
                )}
                <Button
                  disabled={busy || !paymentSettings?.depositsEnabled}
                  className="w-full"
                  onClick={() => runAction(submitManualDeposit)}
                >
                  Submit Deposit Request
                </Button>
                {!paymentSettings?.depositsEnabled && (
                  <p className="flex items-center gap-1 text-xs text-rose-300">
                    <ShieldAlert className="h-3.5 w-3.5" />
                    Deposits are temporarily disabled by admin.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <h2 className="mb-3 text-lg font-semibold">Recent Deposit Requests</h2>
          <div className="space-y-2">
            {depositRequests.length ? (
              depositRequests.slice(0, 7).map((item, index) => (
                <motion.article
                  key={item._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="rounded-xl border border-line bg-panel p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">INR {Number(item.amount).toLocaleString("en-IN")}</p>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[11px] uppercase tracking-wide ${
                        statusStyles[item.status] || statusStyles.pending
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-textSub">UTR: {item.utr}</p>
                  <p className="mt-1 text-xs text-textSub">
                    {new Date(item.createdAt).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </p>
                </motion.article>
              ))
            ) : (
              <p className="text-sm text-textSub">No deposit requests submitted yet.</p>
            )}
          </div>
        </div>
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="glass rounded-2xl p-4">
          <p className="mb-3 text-sm font-semibold">Withdraw request</p>
          <div className="space-y-2 text-sm">
            <input
              type="number"
              value={withdrawForm.amount}
              onChange={(e) => setWithdrawForm((p) => ({ ...p, amount: Number(e.target.value) }))}
              className="w-full rounded-lg border border-line bg-panel px-3 py-2 outline-none focus:border-accent"
              placeholder="Amount"
            />
            <input
              type="text"
              value={withdrawForm.upiId}
              onChange={(e) => setWithdrawForm((p) => ({ ...p, upiId: e.target.value }))}
              className="w-full rounded-lg border border-line bg-panel px-3 py-2 outline-none focus:border-accent"
              placeholder="UPI ID"
            />
            <input
              type="text"
              value={withdrawForm.bankName}
              onChange={(e) => setWithdrawForm((p) => ({ ...p, bankName: e.target.value }))}
              className="w-full rounded-lg border border-line bg-panel px-3 py-2 outline-none focus:border-accent"
              placeholder="Bank name (optional)"
            />
            <Button
              disabled={busy}
              className="w-full"
              variant="secondary"
              onClick={() =>
                runAction(async () => {
                  await api.post("/wallet/withdraw", withdrawForm);
                  return "Withdrawal request submitted.";
                })
              }
            >
              Withdraw
            </Button>
          </div>
        </div>

        <div className="glass rounded-2xl p-4">
          <p className="mb-3 text-sm font-semibold">Activate investment</p>
          <div className="space-y-2 text-sm">
            <select
              value={investForm.planId}
              onChange={(e) => setInvestForm((p) => ({ ...p, planId: e.target.value }))}
              className="w-full rounded-lg border border-line bg-panel px-3 py-2 outline-none focus:border-accent"
            >
              {plans.map((plan) => (
                <option value={plan._id} key={plan._id}>
                  {plan.name} (INR {plan.minAmount} - INR {plan.maxAmount}, {plan.dailyPercent}%/day)
                </option>
              ))}
            </select>
            <input
              type="number"
              value={investForm.amount}
              onChange={(e) => setInvestForm((p) => ({ ...p, amount: Number(e.target.value) }))}
              className="w-full rounded-lg border border-line bg-panel px-3 py-2 outline-none focus:border-accent"
              placeholder="Investment amount"
            />
            <Button
              disabled={busy}
              className="w-full"
              onClick={() =>
                runAction(async () => {
                  await api.post("/investments/invest", investForm);
                  return "Investment activated.";
                })
              }
            >
              Invest
            </Button>
          </div>
        </div>
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <TransactionTable transactions={transactions} />
        <div className="glass rounded-2xl p-4">
          <p className="mb-3 text-sm font-semibold">KYC upload</p>
          <div className="space-y-2 text-sm">
            <select
              value={kycType}
              onChange={(e) => setKycType(e.target.value)}
              className="w-full rounded-lg border border-line bg-panel px-3 py-2 outline-none focus:border-accent"
            >
              <option value="aadhaar">Aadhaar</option>
              <option value="pan">PAN</option>
              <option value="passport">Passport</option>
            </select>
            <input
              type="file"
              onChange={(e) => setKycFile(e.target.files?.[0] || null)}
              className="w-full rounded-lg border border-line bg-panel px-3 py-2 text-sm"
            />
            <Button
              disabled={busy || !kycFile}
              className="w-full"
              onClick={() =>
                runAction(async () => {
                  const formData = new FormData();
                  formData.append("documentType", kycType);
                  formData.append("document", kycFile);
                  await api.post("/kyc/upload", formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                  });
                  return "KYC uploaded.";
                })
              }
            >
              Upload KYC
            </Button>
            <p className="text-xs text-textSub">
              Current KYC status: <span className="font-semibold">{summary?.kycStatus || "unknown"}</span>
            </p>
          </div>
        </div>
      </section>

      <section className="mt-4 grid gap-2">
        <div className="glass rounded-2xl p-4 text-sm">
          <p className="font-semibold">Your referral code</p>
          <p className="mt-1 text-lg text-brand">{summary?.referralCode || "-"}</p>
        </div>
      </section>

      {(actionMessage || error) && (
        <section className="mt-4">
          {actionMessage && (
            <p className="rounded-lg bg-emerald-500/20 px-3 py-2 text-sm text-emerald-200">{actionMessage}</p>
          )}
          {error && <p className="mt-2 rounded-lg bg-rose-500/20 px-3 py-2 text-sm text-rose-200">{error}</p>}
        </section>
      )}

      <section className="mt-5 flex items-center gap-2 text-xs text-textSub">
        <BellRing className="h-4 w-4" />
        Live audit logs and approval history are maintained for compliance monitoring.
      </section>
    </main>
  );
}
