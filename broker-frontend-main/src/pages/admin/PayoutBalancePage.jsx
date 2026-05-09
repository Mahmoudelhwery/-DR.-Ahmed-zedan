import { useState, useEffect } from "react";
import { Wallet, TrendingUp, ArrowLeft, Loader2, AlertCircle, RefreshCw, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import axiosInstance from "../../services/axiosInstance";

async function getPayoutBalance() {
  const res = await axiosInstance.get("/api/v1/AdminPayouts/balance");
  return res.data;
}

function StatCard({ label, value, sub, icon: Icon, accent, iconCls }) {
  return (
    <div className={`rounded-2xl border bg-gradient-to-br p-6 ${accent}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${iconCls}`}>
          <Icon size={18} />
        </div>
      </div>
      <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1">{label}</p>
      <p className="text-3xl font-semibold text-white" style={{ fontFamily: "Cormorant Garamond, serif" }}>
        {value ?? "—"}
      </p>
      {sub && <p className="text-xs text-white/30 mt-1">{sub}</p>}
    </div>
  );
}

export default function PayoutBalancePage() {
  const navigate = useNavigate();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fmt = (n, currency = "EGP") =>
    n != null
      ? new Intl.NumberFormat("en-EG", { style: "currency", currency, maximumFractionDigits: 2 }).format(n)
      : "—";

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await getPayoutBalance();
      // handle: direct obj | { data: obj } | { data: { data: obj } }
      const body = res?.totalBalance != null || res?.balance != null
        ? res
        : res?.data?.data ?? res?.data ?? res;
      setData(body);
    } catch (err) {
      setError(`Failed to load balance. (${err?.response?.status ?? err?.message})`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Derive display fields from whatever shape the API returns
  const total    = data?.totalBalance ?? data?.balance ?? data?.totalAmount ?? data?.amount;
  const pending  = data?.pendingBalance ?? data?.pendingAmount ?? data?.pendingPayout;
  const paid     = data?.paidBalance ?? data?.paidAmount ?? data?.completedAmount;
  const currency = data?.currency ?? "EGP";

  return (
    <div
      className="min-h-screen text-white relative bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(10,10,10,0.80) 0%, rgba(10,10,10,0.93) 60%, rgba(10,10,10,1) 100%), url('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1800&q=80')`,
      }}
    >
      <div className="relative z-10 pt-12">
        <Navbar />

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          {/* ── Back ── */}
          <button onClick={() => navigate("/dashboard")} className="group flex items-center gap-2 text-sm text-white/40 hover:text-[var(--gold)] transition-colors mb-8">
            <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform duration-200" />
            Back to Dashboard
          </button>

          {/* ── Hero Banner ── */}
          <div className="relative w-full h-44 rounded-3xl overflow-hidden mb-10">
            <img src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1800&q=80" alt="Balance" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-center px-10">
              <p className="text-[10px] tracking-[5px] uppercase text-[var(--gold)] mb-2">Financial Overview</p>
              <h1 className="text-4xl font-semibold text-white" style={{ fontFamily: "Cormorant Garamond, serif" }}>
                Payout Balance
              </h1>
            </div>
          </div>

          {/* ── Refresh Button ── */}
          <div className="flex justify-end mb-6">
            <button
              onClick={load}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-white/10 text-white/50 hover:border-[var(--gold)]/40 hover:text-[var(--gold)] transition-all disabled:opacity-40"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {/* ── Content ── */}
          {loading ? (
            <div className="flex items-center justify-center py-32 gap-3 text-white/40">
              <Loader2 size={22} className="animate-spin" />
              <span className="text-sm">Loading balance...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-32 gap-3 text-red-400">
              <AlertCircle size={26} />
              <p className="text-sm">{error}</p>
              <button onClick={load} className="text-xs text-[var(--gold)] hover:underline mt-1">Try again</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard
                label="Total Balance"
                value={fmt(total, currency)}
                sub="Platform total"
                icon={Wallet}
                accent="from-[var(--gold)]/12 to-[var(--gold)]/3 border-[var(--gold)]/20"
                iconCls="bg-[var(--gold)]/10 border-[var(--gold)]/20 text-[var(--gold)]"
              />
              <StatCard
                label="Pending Payouts"
                value={fmt(pending, currency)}
                sub="Awaiting transfer"
                icon={TrendingUp}
                accent="from-orange-500/10 to-orange-500/3 border-orange-500/20"
                iconCls="bg-orange-500/10 border-orange-500/20 text-orange-300"
              />
              <StatCard
                label="Paid Out"
                value={fmt(paid, currency)}
                sub="Successfully transferred"
                icon={DollarSign}
                accent="from-emerald-500/10 to-emerald-500/3 border-emerald-500/20"
                iconCls="bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
              />
            </div>
          )}

          {/* ── Raw data debug (only in dev) ── */}
          {data && import.meta.env.DEV && (
            <details className="mt-8 text-xs text-white/20">
              <summary className="cursor-pointer hover:text-white/40">Raw API response</summary>
              <pre className="mt-2 p-3 rounded-xl bg-white/5 overflow-auto">{JSON.stringify(data, null, 2)}</pre>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}
