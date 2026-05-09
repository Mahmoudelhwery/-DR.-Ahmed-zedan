import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  ChevronDown,
  Check,
  Loader2,
  AlertCircle,
  Save,
  User,
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import { assignRoleToUser, getRolesLookup } from "../../services/identityService";

const ROLE_OPTIONS = [
  { label: "Client",     value: "Client" },
  { label: "Landlord",   value: "Landlord" },
  { label: "Admin",      value: "Admin" },
  { label: "SuperAdmin", value: "SuperAdmin" },
];

const ROLE_BADGE = {
  SuperAdmin: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  Admin:      "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Landlord:   "bg-[var(--gold)]/20 text-[var(--gold)] border-[var(--gold)]/30",
  Client:     "bg-white/10 text-white/50 border-white/15",
};

// ── Toast ──────────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl text-sm font-medium ${
      type === "success"
        ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300"
        : "bg-red-500/20 border border-red-500/40 text-red-300"
    }`}>
      {type === "success" ? <Check size={16} /> : <AlertCircle size={16} />}
      {message}
    </div>
  );
}

// ── Info Row ───────────────────────────────────────────────────────────────────
function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-4 py-4 border-b border-white/5 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-[var(--gold)]/10 flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={14} className="text-[var(--gold)]" />
      </div>
      <div>
        <p className="text-[10px] text-white/30 uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-sm text-white font-medium">{value}</p>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function UserDetailPage() {
  const { userId } = useParams();
  const navigate   = useNavigate();
  const location   = useLocation();

  // ── Use the user data passed from UsersPage via navigation state ──
  const [user,        setUser]        = useState(location.state?.user ?? null);
  const [rolesLookup, setRolesLookup] = useState([]);
  const [loading,     setLoading]     = useState(!location.state?.user);
  const [error,       setError]       = useState(null);

  const [selectedRole, setSelectedRole] = useState("");
  const [dropOpen,     setDropOpen]     = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [toast,        setToast]        = useState(null);

  const notify = (message, type = "success") => setToast({ message, type });

  // ── Load roles lookup only (user data comes from navigation state) ──
  useEffect(() => {
    const preloaded = location.state?.user;

    async function loadRoles() {
      try {
        const lookupRes = await getRolesLookup();
        const lookup = Array.isArray(lookupRes)
          ? lookupRes
          : lookupRes?.data?.data ?? lookupRes?.data ?? lookupRes ?? [];
        setRolesLookup(Array.isArray(lookup) ? lookup : []);

        // Set initial selected role from user's current roles
        const currentRoles = preloaded?.roles ?? preloaded?.userRoles ?? [];
        if (currentRoles.length > 0) setSelectedRole(currentRoles[0]);
      } catch (err) {
        console.error("Roles lookup error:", err?.response?.status, err?.message);
        // Roles lookup failing is non-critical — use static list
      } finally {
        setLoading(false);
      }
    }

    if (preloaded) {
      // We have user data from navigation state — just load roles
      const currentRoles = preloaded?.roles ?? preloaded?.userRoles ?? [];
      if (currentRoles.length > 0) setSelectedRole(currentRoles[0]);
      loadRoles();
    } else {
      // No state passed (e.g. user navigated directly to URL)
      setError("Please navigate from the Users list to view user details.");
      setLoading(false);
    }
  }, [userId]);

  // ── Save role → POST /api/v1/IdentityManagement/users/{userId}/roles ──
  // Body: { roleName }
  const handleSave = async () => {
    if (!selectedRole) return;
    setSaving(true);
    try {
      await assignRoleToUser(userId, selectedRole);
      notify(`Role changed to "${selectedRole}" successfully!`);
      // Update local state directly
      setUser((prev) => ({ ...prev, roles: [selectedRole], userRoles: [selectedRole] }));
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.errors?.[0] || "Failed to update role. Please try again.";
      notify(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  const currentRoles = user?.roles ?? user?.userRoles ?? [];
  const initials = `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase() || "?";

  return (
    <div
      className="min-h-screen text-white relative bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(10,10,10,0.8) 0%, rgba(10,10,10,0.94) 60%, rgba(10,10,10,1) 100%), url('https://images.unsplash.com/photo-1497366216548-37526070297c?w=1800&q=80')`,
      }}
    >
      <div className="relative z-10 pt-12">
        <Navbar />

        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          {/* ── Back Button ── */}
          <button
            onClick={() => navigate("/admin/users")}
            className="group flex items-center gap-2 text-sm text-white/40 hover:text-[var(--gold)] transition-colors mb-8"
          >
            <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform duration-200" />
            Back to Users
          </button>

          {loading ? (
            <div className="flex items-center justify-center py-32 gap-3 text-white/40">
              <Loader2 size={22} className="animate-spin" />
              <span className="text-sm">Loading...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-32 gap-3 text-red-400">
              <AlertCircle size={26} />
              <p className="text-sm">{error}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-5">

              {/* ── User Profile Card ── */}
              <div className="rounded-3xl border border-white/5 bg-[#0e0e0e] p-8">
                {/* Avatar + Name */}
                <div className="flex items-center gap-6 mb-7">
                  <div className="w-20 h-20 rounded-2xl bg-[var(--gold)]/10 border border-[var(--gold)]/20 flex items-center justify-center overflow-hidden shrink-0">
                    {user?.profileImageUrl ? (
                      <img src={user.profileImageUrl} alt={initials} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl font-semibold text-[var(--gold)]" style={{ fontFamily: "Cormorant Garamond, serif" }}>
                        {initials}
                      </span>
                    )}
                  </div>

                  <div>
                    <h1 className="text-3xl font-semibold text-white" style={{ fontFamily: "Cormorant Garamond, serif" }}>
                      {user?.firstName} {user?.lastName}
                    </h1>
                    <p className="text-sm text-white/40 mt-1">{user?.email}</p>

                    {/* Role badges */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {currentRoles.length > 0
                        ? currentRoles.map((r) => (
                            <span key={r} className={`text-xs px-3 py-1 rounded-full border font-medium ${ROLE_BADGE[r] ?? ROLE_BADGE.Client}`}>
                              {r}
                            </span>
                          ))
                        : <span className={`text-xs px-3 py-1 rounded-full border font-medium ${ROLE_BADGE.Client}`}>Client</span>
                      }
                    </div>
                  </div>
                </div>

                {/* Info rows */}
                <div className="border-t border-white/5 pt-1">
                  <InfoRow icon={Mail}     label="Email"   value={user?.email} />
                  <InfoRow icon={Phone}    label="Phone"   value={user?.phoneNumber} />
                  <InfoRow icon={Calendar} label="Joined"  value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" }) : null} />
                  <InfoRow icon={User}     label="User ID" value={user?.id ?? userId} />
                </div>
              </div>

              {/* ── Change Role Card ── */}
              <div className="rounded-3xl border border-white/5 bg-[#0e0e0e] p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 rounded-xl bg-[var(--gold)]/10 flex items-center justify-center">
                    <ShieldCheck size={16} className="text-[var(--gold)]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white" style={{ fontFamily: "Cormorant Garamond, serif" }}>
                      Change Role
                    </h2>
                    <p className="text-xs text-white/30">Select a role then press Save</p>
                  </div>
                </div>

                {/* Dropdown */}
                <div className="relative mb-5">
                  <button
                    onClick={() => setDropOpen((v) => !v)}
                    className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl border border-white/10 bg-[#141414] text-sm hover:border-[var(--gold)]/30 transition-colors"
                  >
                    <span className={selectedRole ? "text-white" : "text-white/30"}>
                      {selectedRole || "Select a role..."}
                    </span>
                    <ChevronDown size={15} className={`text-[var(--gold)] transition-transform duration-200 ${dropOpen ? "rotate-180" : ""}`} />
                  </button>

                  {dropOpen && (
                    <div className="absolute left-0 right-0 mt-2 bg-[#181818] border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden">
                      {ROLE_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => { setSelectedRole(opt.value); setDropOpen(false); }}
                          className={`w-full flex items-center justify-between px-4 py-3.5 text-sm transition-colors hover:bg-white/5 ${
                            selectedRole === opt.value ? "text-[var(--gold)] bg-[var(--gold)]/5" : "text-white/60"
                          }`}
                        >
                          {opt.label}
                          {selectedRole === opt.value && <Check size={14} className="text-[var(--gold)]" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Save */}
                <button
                  onClick={handleSave}
                  disabled={saving || !selectedRole}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-[var(--gold)] text-black hover:opacity-90 transition-opacity disabled:opacity-40"
                >
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                  {saving ? "Saving..." : "Save Role"}
                </button>
              </div>

            </div>
          )}
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
