"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  BadgeIndianRupee,
  CircleUserRound,
  CreditCard,
  QrCode,
  ShieldAlert,
  UploadCloud
} from "lucide-react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { toAssetUrl } from "@/lib/media";
import Button from "@/components/ui/Button";
import StatCard from "@/components/dashboard/StatCard";

export default function AdminPage() {
  const { user, loading } = useAuthGuard({ requireAdmin: true });
  const { logout } = useAuth();

  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [depositRequests, setDepositRequests] = useState([]);
  const [paymentSettings, setPaymentSettings] = useState(null);
  const [settingsForm, setSettingsForm] = useState({
    upiId: "",
    accountName: "",
    bankName: "",
    accountNumberMasked: "",
    instructions: "",
    depositsEnabled: true
  });
  const [qrFile, setQrFile] = useState(null);
  const [notifyForm, setNotifyForm] = useState({
    title: "",
    message: "",
    targetRole: "all"
  });
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const fetchAdminData = async () => {
    try {
      const [analyticsRes, usersRes, txRes, depositsRes, paymentRes] = await Promise.all([
        api.get("/admin/analytics"),
        api.get("/admin/users"),
        api.get("/admin/transactions/pending"),
        api.get("/admin/deposits?status=pending"),
        api.get("/admin/payment-settings")
      ]);
      setAnalytics(analyticsRes.data.analytics);
      setUsers(usersRes.data.users);
      setTransactions(txRes.data.transactions);
      setDepositRequests(depositsRes.data.deposits);
      setPaymentSettings(paymentRes.data.settings);
      setSettingsForm({
        upiId: paymentRes.data.settings?.upiId || "",
        accountName: paymentRes.data.settings?.accountName || "",
        bankName: paymentRes.data.settings?.bankName || "",
        accountNumberMasked: paymentRes.data.settings?.accountNumberMasked || "",
        instructions: paymentRes.data.settings?.instructions || "",
        depositsEnabled: Boolean(paymentRes.data.settings?.depositsEnabled)
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load admin data.");
    }
  };

  useEffect(() => {
    if (!loading && user?.role === "admin") {
      fetchAdminData();
    }
  }, [loading, user]);

  const handleDecision = async (id, status) => {
    setError("");
    setFeedback("");
    try {
      await api.patch(`/admin/transactions/${id}/decision`, { status });
      setFeedback(`Transaction ${status}.`);
      fetchAdminData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update transaction.");
    }
  };

  const handleDepositDecision = async (id, status) => {
    setError("");
    setFeedback("");
    try {
      await api.patch(`/admin/deposits/${id}/decision`, {
        status,
        note: status === "rejected" ? "Payment proof mismatch. Please submit a valid screenshot." : undefined
      });
      setFeedback(`Deposit ${status}.`);
      fetchAdminData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to review deposit.");
    }
  };

  const handleKyc = async (userId, status) => {
    setError("");
    setFeedback("");
    try {
      await api.patch(`/admin/kyc/${userId}`, {
        status,
        rejectionReason: status === "rejected" ? "Document mismatch. Please resubmit." : undefined
      });
      setFeedback(`KYC ${status}.`);
      fetchAdminData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update KYC.");
    }
  };

  const savePaymentSettings = async () => {
    setError("");
    setFeedback("");
    try {
      await api.patch("/admin/payment-settings", settingsForm);
      setFeedback("Payment settings updated.");
      fetchAdminData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update payment settings.");
    }
  };

  const uploadQr = async () => {
    if (!qrFile) {
      setError("Please select a QR image first.");
      return;
    }
    setError("");
    setFeedback("");
    try {
      const formData = new FormData();
      formData.append("qrImage", qrFile);
      await api.patch("/admin/payment-settings/qr", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setQrFile(null);
      setFeedback("QR image updated.");
      fetchAdminData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload QR image.");
    }
  };

  const sendNotification = async () => {
    setError("");
    setFeedback("");
    try {
      await api.post("/admin/notifications", notifyForm);
      setNotifyForm({ title: "", message: "", targetRole: "all" });
      setFeedback("Notification sent.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send notification.");
    }
  };

  if (loading || !user) {
    return <div className="p-8 text-center text-textSub">Loading admin controls...</div>;
  }

  return (
    <main className="section-wrap py-8">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-accent">Admin Dashboard</p>
          <h1 className="text-3xl">TrustVest Operations</h1>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard">
            <Button variant="secondary">User Dashboard</Button>
          </Link>
          <Button variant="ghost" onClick={logout}>
            Logout
          </Button>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Users" value={analytics?.users || 0} icon={CircleUserRound} />
        <StatCard label="Active Investments" value={analytics?.activeInvestments || 0} icon={Activity} tone="accent" />
        <StatCard label="Pending Deposits" value={analytics?.pendingDeposits || 0} icon={BadgeIndianRupee} />
        <StatCard
          label="Pending Withdrawals"
          value={analytics?.pendingWithdrawals || 0}
          icon={ShieldAlert}
          tone="accent"
        />
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="glass rounded-2xl p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold">UPI Payment Settings</p>
            <span
              className={`rounded-full px-2 py-1 text-xs ${
                settingsForm.depositsEnabled
                  ? "bg-emerald-500/15 text-emerald-200"
                  : "bg-rose-500/15 text-rose-200"
              }`}
            >
              {settingsForm.depositsEnabled ? "Deposits Enabled" : "Deposits Disabled"}
            </span>
          </div>
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <label>
              UPI ID
              <input
                type="text"
                value={settingsForm.upiId}
                onChange={(e) => setSettingsForm((p) => ({ ...p, upiId: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-line bg-panel px-3 py-2 outline-none focus:border-accent"
              />
            </label>
            <label>
              Account Name
              <input
                type="text"
                value={settingsForm.accountName}
                onChange={(e) => setSettingsForm((p) => ({ ...p, accountName: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-line bg-panel px-3 py-2 outline-none focus:border-accent"
              />
            </label>
            <label>
              Bank Name
              <input
                type="text"
                value={settingsForm.bankName}
                onChange={(e) => setSettingsForm((p) => ({ ...p, bankName: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-line bg-panel px-3 py-2 outline-none focus:border-accent"
              />
            </label>
            <label>
              Masked Account Number
              <input
                type="text"
                value={settingsForm.accountNumberMasked}
                onChange={(e) =>
                  setSettingsForm((p) => ({ ...p, accountNumberMasked: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-line bg-panel px-3 py-2 outline-none focus:border-accent"
              />
            </label>
          </div>
          <label className="mt-3 block text-sm">
            Instructions
            <textarea
              rows={3}
              value={settingsForm.instructions}
              onChange={(e) => setSettingsForm((p) => ({ ...p, instructions: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-line bg-panel px-3 py-2 outline-none focus:border-accent"
            />
          </label>
          <label className="mt-3 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={settingsForm.depositsEnabled}
              onChange={(e) =>
                setSettingsForm((p) => ({ ...p, depositsEnabled: e.target.checked }))
              }
            />
            Enable deposits
          </label>
          <div className="mt-3">
            <Button onClick={savePaymentSettings}>Save Payment Settings</Button>
          </div>
        </div>

        <div className="glass rounded-2xl p-4">
          <p className="mb-3 text-sm font-semibold">QR Management</p>
          <div className="rounded-xl border border-line bg-panel p-3">
            <div className="mb-3 flex items-center gap-2 text-xs text-textSub">
              <QrCode className="h-4 w-4 text-accent" />
              Current QR code
            </div>
            <div className="overflow-hidden rounded-lg border border-line bg-bg/80 p-2">
              {paymentSettings?.qrImageUrl ? (
                <img
                  src={toAssetUrl(paymentSettings.qrImageUrl)}
                  alt="Current QR"
                  className="h-52 w-full object-contain"
                />
              ) : (
                <div className="flex h-52 items-center justify-center text-sm text-textSub">
                  No QR uploaded yet.
                </div>
              )}
            </div>
            <label className="mt-3 block rounded-lg border border-dashed border-line bg-bg/70 px-3 py-2 text-sm">
              <span className="mb-2 inline-flex items-center gap-1 text-xs text-textSub">
                <UploadCloud className="h-4 w-4 text-accent" />
                Upload new QR image
              </span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => setQrFile(e.target.files?.[0] || null)}
                className="block w-full text-xs"
              />
            </label>
            <div className="mt-3">
              <Button onClick={uploadQr} disabled={!qrFile}>
                Update QR Image
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-4 glass rounded-2xl p-4">
        <p className="mb-3 text-sm font-semibold">Pending UPI Deposit Verification</p>
        <div className="space-y-3">
          {depositRequests.length ? (
            depositRequests.map((item) => (
              <article key={item._id} className="rounded-xl border border-line bg-panel p-3">
                <div className="grid gap-3 md:grid-cols-[1.4fr_0.6fr]">
                  <div>
                    <p className="text-sm font-semibold">
                      {item.user?.fullName} | INR {Number(item.amount).toLocaleString("en-IN")}
                    </p>
                    <p className="mt-1 text-xs text-textSub">Email: {item.user?.email}</p>
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
                    <div className="mt-3 flex gap-2">
                      <Button onClick={() => handleDepositDecision(item._id, "approved")} className="px-3 py-1.5 text-xs">
                        Approve & Credit
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => handleDepositDecision(item._id, "rejected")}
                        className="px-3 py-1.5 text-xs"
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                  <div className="overflow-hidden rounded-lg border border-line bg-bg/80 p-2">
                    {item.screenshotUrl ? (
                      <img
                        src={toAssetUrl(item.screenshotUrl)}
                        alt="Deposit screenshot"
                        className="h-40 w-full rounded-md object-cover"
                      />
                    ) : (
                      <div className="flex h-40 items-center justify-center text-xs text-textSub">
                        Screenshot missing
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))
          ) : (
            <p className="text-sm text-textSub">No pending deposit requests.</p>
          )}
        </div>
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <div className="glass rounded-2xl p-4">
          <p className="mb-3 text-sm font-semibold">Pending withdrawal transactions</p>
          <div className="space-y-2">
            {transactions.length ? (
              transactions.map((tx) => (
                <div key={tx._id} className="rounded-xl border border-line bg-panel p-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p>
                      <span className="capitalize">{tx.type}</span> - INR {tx.amount}
                    </p>
                    <p className="text-xs text-textSub">{tx.user?.email}</p>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <Button onClick={() => handleDecision(tx._id, "completed")} className="px-3 py-1.5 text-xs">
                      Approve
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => handleDecision(tx._id, "rejected")}
                      className="px-3 py-1.5 text-xs"
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-textSub">No pending withdrawals.</p>
            )}
          </div>
        </div>

        <div className="glass rounded-2xl p-4">
          <p className="mb-3 text-sm font-semibold">Broadcast notification</p>
          <div className="space-y-2 text-sm">
            <input
              type="text"
              value={notifyForm.title}
              onChange={(e) => setNotifyForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="Title"
              className="w-full rounded-lg border border-line bg-panel px-3 py-2 outline-none focus:border-accent"
            />
            <textarea
              value={notifyForm.message}
              onChange={(e) => setNotifyForm((p) => ({ ...p, message: e.target.value }))}
              placeholder="Message"
              rows={4}
              className="w-full rounded-lg border border-line bg-panel px-3 py-2 outline-none focus:border-accent"
            />
            <select
              value={notifyForm.targetRole}
              onChange={(e) => setNotifyForm((p) => ({ ...p, targetRole: e.target.value }))}
              className="w-full rounded-lg border border-line bg-panel px-3 py-2 outline-none focus:border-accent"
            >
              <option value="all">All users</option>
              <option value="user">Users only</option>
              <option value="admin">Admins only</option>
            </select>
            <Button className="w-full" onClick={sendNotification}>
              Send Notification
            </Button>
          </div>
        </div>
      </section>

      <section className="mt-4 glass rounded-2xl p-4">
        <p className="mb-3 text-sm font-semibold">User and KYC management</p>
        <div className="overflow-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs text-textSub">
              <tr>
                <th className="py-2">Name</th>
                <th className="py-2">Email</th>
                <th className="py-2">KYC</th>
                <th className="py-2">Wallet</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((item) => (
                <tr key={item._id} className="border-t border-line">
                  <td className="py-3">{item.fullName}</td>
                  <td className="py-3">{item.email}</td>
                  <td className="py-3 capitalize">{item.kyc?.status || "not_submitted"}</td>
                  <td className="py-3">INR {item.wallet?.balance || 0}</td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <Button onClick={() => handleKyc(item._id, "verified")} className="px-3 py-1.5 text-xs">
                        Verify KYC
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => handleKyc(item._id, "rejected")}
                        className="px-3 py-1.5 text-xs"
                      >
                        Reject
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {!users.length && (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-textSub">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {(feedback || error) && (
        <section className="mt-4">
          {feedback && <p className="rounded-lg bg-emerald-500/20 px-3 py-2 text-sm text-emerald-200">{feedback}</p>}
          {error && <p className="mt-2 rounded-lg bg-rose-500/20 px-3 py-2 text-sm text-rose-200">{error}</p>}
        </section>
      )}

      <section className="mt-5 flex items-center gap-2 text-xs text-textSub">
        <CreditCard className="h-4 w-4" />
        Manual UPI verification audit is active for every submitted UTR and screenshot.
      </section>
    </main>
  );
}
