import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Users,
  Loader2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import { getUsersSummary } from "../../services/userManagementService";

const PAGE_SIZE = 12;

const ROLE_FILTERS = [
  { label: "All Roles", value: "" },
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

// ── User Card ──────────────────────────────────────────────────────────────────
function UserCard({ user, onClick }) {
  const roles = user.roles ?? user.userRoles ?? [];
  const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() || "?";

  return (
    <button
      onClick={onClick}
      className="group w-full text-left flex items-center gap-4 p-5 rounded-2xl border border-white/5 bg-[#0e0e0e] hover:border-[var(--gold)]/30 hover:bg-[#111] transition-all duration-200"
    >
      {/* Avatar */}
      <div className="w-12 h-12 rounded-xl bg-[var(--gold)]/10 border border-[var(--gold)]/20 flex items-center justify-center shrink-0 overflow-hidden">
        {user.profileImageUrl ? (
          <img src={user.profileImageUrl} alt={initials} className="w-full h-full object-cover" />
        ) : (
          <span className="text-sm font-bold text-[var(--gold)]" style={{ fontFamily: "Cormorant Garamond, serif" }}>
            {initials}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate" style={{ fontFamily: "Cormorant Garamond, serif" }}>
          {user.firstName} {user.lastName}
        </p>
        <p className="text-xs text-white/40 truncate mt-0.5">{user.email}</p>

        {/* Role badges */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {roles.length > 0
            ? roles.map((r) => (
                <span key={r} className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${ROLE_BADGE[r] ?? ROLE_BADGE.Client}`}>
                  {r}
                </span>
              ))
            : <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${ROLE_BADGE.Client}`}>Client</span>
          }
        </div>
      </div>

      <ArrowRight size={15} className="shrink-0 text-white/20 group-hover:text-[var(--gold)] group-hover:translate-x-1 transition-all duration-200" />
    </button>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function UsersPage() {
  const navigate = useNavigate();

  const [users,      setUsers]      = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  const [searchInput,   setSearchInput]   = useState("");
  const [search,        setSearch]        = useState("");
  const [selectedRole,  setSelectedRole]  = useState("");
  const [roleDropOpen,  setRoleDropOpen]  = useState(false);
  const [page,          setPage]          = useState(1);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // ── Fetch ──
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // service returns response.data directly — handle both flat and nested shapes
      const res   = await getUsersSummary({ page, pageSize: PAGE_SIZE, search, role: selectedRole });
      const data  = res?.items ? res : (res?.data ?? res);
      const items = data?.items ?? data?.users ?? (Array.isArray(data) ? data : []);
      const total = data?.totalCount ?? data?.total ?? data?.count ?? items.length;
      setUsers(items);
      setTotalCount(total);
    } catch {
      setError("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, search, selectedRole]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 600);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleRoleSelect = (value) => {
    setSelectedRole(value);
    setPage(1);
    setRoleDropOpen(false);
  };

  // ── Pagination helper ──
  const pageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) pages.push(i);
      else if (pages[pages.length - 1] !== "...") pages.push("...");
    }
    return pages;
  };

  return (
    <div
      className="min-h-screen text-white relative bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(10,10,10,0.78) 0%, rgba(10,10,10,0.92) 60%, rgba(10,10,10,1) 100%), url('https://images.unsplash.com/photo-1497366216548-37526070297c?w=1800&q=80')`,
      }}
    >
      <div className="relative z-10 pt-12">
        <Navbar />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          {/* ── Hero ── */}
          <div className="relative w-full h-44 rounded-3xl overflow-hidden mb-10">
            <img
              src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=1800&q=80"
              alt="Users"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-center px-10">
              <p className="text-[10px] tracking-[5px] uppercase text-[var(--gold)] mb-2">User Management</p>
              <h1 className="text-4xl font-semibold text-white" style={{ fontFamily: "Cormorant Garamond, serif" }}>
                All Users
                {totalCount > 0 && <span className="ml-3 text-2xl text-white/30">({totalCount})</span>}
              </h1>
            </div>
          </div>

          {/* ── Search + Filter ── */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-[#111] border border-white/10 text-white text-sm rounded-xl pl-10 pr-4 py-3 outline-none focus:border-[var(--gold)]/40 transition-colors placeholder-white/25"
              />
            </div>

            {/* Role Filter */}
            <div className="relative shrink-0">
              <button
                onClick={() => setRoleDropOpen((v) => !v)}
                className="flex items-center gap-2 px-5 py-3 rounded-xl border border-white/10 bg-[#111] text-sm text-white/60 hover:border-[var(--gold)]/30 transition-colors w-full sm:w-auto min-w-[160px]"
              >
                <span className="flex-1 text-left">
                  {ROLE_FILTERS.find((r) => r.value === selectedRole)?.label ?? "All Roles"}
                </span>
                <ChevronDown size={14} className={`text-[var(--gold)] transition-transform duration-200 ${roleDropOpen ? "rotate-180" : ""}`} />
              </button>

              {roleDropOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-[#161616] border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden">
                  {ROLE_FILTERS.map((r) => (
                    <button
                      key={r.value}
                      onClick={() => handleRoleSelect(r.value)}
                      className={`w-full text-left px-4 py-3 text-sm transition-colors hover:bg-white/5 ${
                        selectedRole === r.value ? "text-[var(--gold)] bg-[var(--gold)]/5" : "text-white/60"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Users List ── */}
          {loading ? (
            <div className="flex items-center justify-center py-24 gap-3 text-white/40">
              <Loader2 size={22} className="animate-spin" />
              <span className="text-sm">Loading users...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-red-400">
              <AlertCircle size={24} />
              <p className="text-sm">{error}</p>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-white/25">
              <Users size={44} />
              <p className="text-sm">No users found</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {users.map((u) => (
                <UserCard
                  key={u.id ?? u.userId}
                  user={u}
                  onClick={() => navigate(`/admin/users/${u.id ?? u.userId}`, { state: { user: u } })}
                />
              ))}
            </div>
          )}

          {/* ── Pagination ── */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-white/10 hover:border-[var(--gold)]/30 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft size={15} />
              </button>

              {pageNumbers().map((item, idx) =>
                item === "..." ? (
                  <span key={`d${idx}`} className="text-white/30 text-sm px-1">...</span>
                ) : (
                  <button
                    key={item}
                    onClick={() => setPage(item)}
                    className={`w-9 h-9 flex items-center justify-center rounded-xl border text-sm font-medium transition-all ${
                      page === item
                        ? "border-[var(--gold)]/60 bg-[var(--gold)]/10 text-[var(--gold)]"
                        : "border-white/10 text-white/40 hover:border-[var(--gold)]/30"
                    }`}
                  >
                    {item}
                  </button>
                )
              )}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-white/10 hover:border-[var(--gold)]/30 disabled:opacity-30 transition-colors"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
