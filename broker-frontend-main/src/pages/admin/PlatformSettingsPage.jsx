import { useState, useEffect, useCallback } from "react";
import {
  Settings,
  ArrowLeft,
  Loader2,
  AlertCircle,
  RefreshCw,
  Save,
  Pencil,
  X,
  Check,
  ChevronDown,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
  Hash,
  Percent,
  Info,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import axiosInstance from "../../services/axiosInstance";

/* ─── API calls ─────────────────────────────────────────── */
async function fetchSettings() {
  const res = await axiosInstance.get("/api/v1/PlatformSettings");
  const body = res.data;
  // handle { data: [...] } or raw array
  return Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : [];
}

async function updateSetting(key, value) {
  const res = await axiosInstance.put(`/api/v1/PlatformSettings/${encodeURIComponent(key)}`, { newValue: String(value) });
  return res.data;
}

/* ─── Helpers ───────────────────────────────────────────── */
function groupByCategory(settings) {
  return settings.reduce((acc, s) => {
    const cat = s.key.split(".")[0] ?? "General";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {});
}

function categoryLabel(cat) {
  const map = {
    Catalog: "Catalog",
    Financial: "Financial",
    Rentals: "Rentals",
    Subscriptions: "Subscriptions",
    General: "General",
  };
  return map[cat] ?? cat;
}

function categoryColor(cat) {
  const map = {
    Catalog: { bg: "from-violet-500/12 to-violet-500/3", border: "border-violet-500/20", icon: "text-violet-400 bg-violet-500/10 border-violet-500/25", badge: "bg-violet-500/15 text-violet-300" },
    Financial: { bg: "from-[var(--gold)]/12 to-[var(--gold)]/3", border: "border-[var(--gold)]/20", icon: "text-[var(--gold)] bg-[var(--gold)]/10 border-[var(--gold)]/25", badge: "bg-[var(--gold)]/15 text-[var(--gold)]" },
    Rentals: { bg: "from-sky-500/12 to-sky-500/3", border: "border-sky-500/20", icon: "text-sky-400 bg-sky-500/10 border-sky-500/25", badge: "bg-sky-500/15 text-sky-300" },
    Subscriptions: { bg: "from-emerald-500/12 to-emerald-500/3", border: "border-emerald-500/20", icon: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25", badge: "bg-emerald-500/15 text-emerald-300" },
    General: { bg: "from-white/8 to-white/2", border: "border-white/10", icon: "text-white/60 bg-white/8 border-white/12", badge: "bg-white/10 text-white/50" },
  };
  return map[cat] ?? map.General;
}

function dataTypeIcon(type) {
  if (type === "Boolean") return ToggleLeft;
  if (type === "Decimal") return Percent;
  return Hash;
}

function formatValue(value, type) {
  if (type === "Boolean") return value === "true" || value === true ? "Enabled" : "Disabled";
  return value;
}

/* ─── Single Setting Row ─────────────────────────────────── */
function SettingRow({ setting, colors, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(setting.value);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [rowError, setRowError] = useState(null);

  const TypeIcon = dataTypeIcon(setting.dataType);
  const isBool = setting.dataType === "Boolean";
  const boolVal = setting.value === "true" || setting.value === true;

  const startEdit = () => { setDraft(setting.value); setEditing(true); setRowError(null); };
  const cancel = () => { setEditing(false); setRowError(null); };

  const save = async () => {
    setSaving(true);
    setRowError(null);
    try {
      await onSave(setting.key, draft);
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setRowError(e?.response?.data?.message ?? e?.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const toggleBool = async () => {
    const next = !boolVal;
    setSaving(true);
    setRowError(null);
    try {
      await onSave(setting.key, String(next));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setRowError(e?.response?.data?.message ?? e?.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`group rounded-2xl border bg-gradient-to-br p-5 transition-all duration-300 hover:shadow-lg hover:shadow-black/30 ${colors.bg} ${colors.border}`}>
      <div className="flex items-start justify-between gap-4">
        {/* Left: icon + info */}
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className={`mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center border flex-shrink-0 ${colors.icon}`}>
            <TypeIcon size={15} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <p className="text-sm font-medium text-white leading-tight">{setting.displayName}</p>
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ${colors.badge}`}>
                {setting.dataType}
              </span>
              {!setting.canUpdate && (
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 font-semibold uppercase tracking-wider">
                  Read-only
                </span>
              )}
            </div>
            <p className="text-xs text-white/35 leading-relaxed mb-3">{setting.description}</p>
            <p className="text-[10px] text-white/20 font-mono">{setting.key}</p>
          </div>
        </div>

        {/* Right: value + controls */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {isBool ? (
            /* ── Boolean toggle ── */
            <div className="flex items-center gap-2">
              {saved && <Check size={14} className="text-emerald-400" />}
              {rowError && <AlertCircle size={14} className="text-red-400" title={rowError} />}
              <button
                onClick={toggleBool}
                disabled={!setting.canUpdate || saving}
                className="relative transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                title={boolVal ? "Enabled — click to disable" : "Disabled — click to enable"}
              >
                {saving ? (
                  <Loader2 size={28} className="animate-spin text-white/30" />
                ) : boolVal ? (
                  <ToggleRight size={34} className="text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
                ) : (
                  <ToggleLeft size={34} className="text-white/30" />
                )}
              </button>
              <span className={`text-xs font-medium w-14 ${boolVal ? "text-emerald-400" : "text-white/30"}`}>
                {boolVal ? "Enabled" : "Disabled"}
              </span>
            </div>
          ) : editing ? (
            /* ── Editing mode ── */
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={draft}
                onChange={e => setDraft(e.target.value)}
                className="w-24 bg-white/5 border border-white/15 text-white text-sm rounded-xl px-3 py-1.5 text-right focus:outline-none focus:border-[var(--gold)]/50 focus:bg-white/8 transition-all"
                autoFocus
                onKeyDown={e => { if (e.key === "Enter") save(); if (e.key === "Escape") cancel(); }}
              />
              <button
                onClick={save}
                disabled={saving}
                className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/25 flex items-center justify-center transition-all disabled:opacity-40"
              >
                {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
              </button>
              <button
                onClick={cancel}
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white/70 flex items-center justify-center transition-all"
              >
                <X size={13} />
              </button>
            </div>
          ) : (
            /* ── View mode ── */
            <div className="flex items-center gap-3">
              {saved && <Check size={14} className="text-emerald-400" />}
              <span className="text-lg font-semibold text-white" style={{ fontFamily: "Cormorant Garamond, serif" }}>
                {formatValue(setting.value, setting.dataType)}
              </span>
              {setting.canUpdate && (
                <button
                  onClick={startEdit}
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-white/30 hover:text-[var(--gold)] hover:border-[var(--gold)]/30 hover:bg-[var(--gold)]/8 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                >
                  <Pencil size={13} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Inline error */}
      {rowError && (
        <p className="mt-2 text-xs text-red-400 flex items-center gap-1.5">
          <AlertCircle size={12} /> {rowError}
        </p>
      )}

      {/* Last updated */}
      <p className="mt-2 text-[10px] text-white/18 text-right">
        Updated {new Date(setting.updatedAt).toLocaleDateString("en-EG", { year: "numeric", month: "short", day: "numeric" })}
      </p>
    </div>
  );
}

/* ─── Category Section ───────────────────────────────────── */
function CategorySection({ category, settings, onSave }) {
  const [open, setOpen] = useState(true);
  const colors = categoryColor(category);

  return (
    <div className="mb-8">
      {/* Section header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 mb-4 group"
      >
        <div className={`w-7 h-7 rounded-lg border flex items-center justify-center flex-shrink-0 transition-colors ${colors.icon}`}>
          <Settings size={13} />
        </div>
        <h2 className="text-sm font-semibold tracking-widest uppercase text-white/50 group-hover:text-white/70 transition-colors flex-1 text-left">
          {categoryLabel(category)}
        </h2>
        <span className={`text-[10px] px-2 py-0.5 rounded-full ${colors.badge}`}>{settings.length}</span>
        {open
          ? <ChevronDown size={14} className="text-white/30 group-hover:text-white/50 transition-colors" />
          : <ChevronRight size={14} className="text-white/30 group-hover:text-white/50 transition-colors" />
        }
      </button>

      {/* Settings rows */}
      {open && (
        <div className="space-y-3">
          {settings.map(s => (
            <SettingRow key={s.key} setting={s} colors={colors} onSave={onSave} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────── */
export default function PlatformSettingsPage() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSettings();
      setSettings(data);
    } catch (e) {
      setError(`Failed to load settings. (${e?.response?.status ?? e?.message})`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = useCallback(async (key, value) => {
    await updateSetting(key, value);
    // Optimistically update local state
    setSettings(prev => prev.map(s => s.key === key ? { ...s, value: String(value), updatedAt: new Date().toISOString() } : s));
  }, []);

  const groups = groupByCategory(settings);

  return (
    <div
      className="min-h-screen text-white relative bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(10,10,10,0.82) 0%, rgba(10,10,10,0.95) 60%, rgba(10,10,10,1) 100%), url('https://images.unsplash.com/photo-1518770660439-4636190af475?w=1800&q=80')`,
      }}
    >
      <div className="relative z-10 pt-12">
        <Navbar />

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          {/* ── Back ── */}
          <button
            onClick={() => navigate("/dashboard")}
            className="group flex items-center gap-2 text-sm text-white/40 hover:text-[var(--gold)] transition-colors mb-8"
          >
            <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform duration-200" />
            Back to Dashboard
          </button>

          {/* ── Hero Banner ── */}
          <div className="relative w-full h-44 rounded-3xl overflow-hidden mb-10">
            <img
              src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=1800&q=80"
              alt="Platform Settings"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-center px-10">
              <p className="text-[10px] tracking-[5px] uppercase text-[var(--gold)] mb-2">System Configuration</p>
              <h1 className="text-4xl font-semibold text-white" style={{ fontFamily: "Cormorant Garamond, serif" }}>
                Platform Settings
              </h1>
            </div>
          </div>

          {/* ── Info bar ── */}
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-blue-500/8 border border-blue-500/15 mb-8">
            <Info size={15} className="text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-white/45 leading-relaxed">
              Hover over a setting to reveal the <strong className="text-white/60">Edit</strong> button.
              For Boolean settings, click the toggle directly. Changes are saved immediately to the server.
            </p>
          </div>

          {/* ── Refresh ── */}
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
              <span className="text-sm">Loading settings...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-32 gap-3 text-red-400">
              <AlertCircle size={26} />
              <p className="text-sm">{error}</p>
              <button onClick={load} className="text-xs text-[var(--gold)] hover:underline mt-1">Try again</button>
            </div>
          ) : settings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 gap-3 text-white/25">
              <Settings size={36} />
              <p className="text-sm">No settings found.</p>
            </div>
          ) : (
            Object.entries(groups).map(([cat, items]) => (
              <CategorySection key={cat} category={cat} settings={items} onSave={handleSave} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
