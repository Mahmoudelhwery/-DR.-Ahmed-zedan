import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Plus,
  Pencil,
  X,
  Check,
  Loader2,
  AlertCircle,
  Users,
  Lock,
  Crown,
  Home,
  ArrowLeft,
  Calendar,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import { getRoles, createRole, updateRole } from "../../services/identityService";

// ── Role icon/color map ───────────────────────────────────────────────────────
const ROLE_META = {
  Client:     { icon: Users,      accent: "from-white/5 to-white/0 border-white/10",                         iconCls: "bg-white/10 border-white/15 text-white/60" },
  Landlord:   { icon: Home,       accent: "from-[var(--gold)]/10 to-[var(--gold)]/0 border-[var(--gold)]/20", iconCls: "bg-[var(--gold)]/10 border-[var(--gold)]/20 text-[var(--gold)]" },
  Admin:      { icon: Lock,       accent: "from-blue-500/10 to-blue-500/0 border-blue-500/20",               iconCls: "bg-blue-500/10 border-blue-500/20 text-blue-300" },
  SuperAdmin: { icon: Crown,      accent: "from-purple-500/10 to-purple-500/0 border-purple-500/20",         iconCls: "bg-purple-500/10 border-purple-500/20 text-purple-300" },
};
const DEFAULT_META = {
  icon: ShieldCheck,
  accent: "from-[var(--gold)]/8 to-transparent border-[var(--gold)]/15",
  iconCls: "bg-[var(--gold)]/10 border-[var(--gold)]/20 text-[var(--gold)]",
};

// ── Toast ─────────────────────────────────────────────────────────────────────
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

// ── Modal ─────────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="bg-[#161616] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 className="text-lg font-semibold text-white" style={{ fontFamily: "Cormorant Garamond, serif" }}>
            {title}
          </h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs text-white/40 uppercase tracking-widest">{label}</label>}
      <input
        className="bg-[#1e1e1e] border border-white/10 text-white text-sm rounded-xl px-4 py-3 outline-none focus:border-[var(--gold)]/50 transition-colors placeholder-white/20"
        {...props}
      />
    </div>
  );
}

function TextArea({ label, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs text-white/40 uppercase tracking-widest">{label}</label>}
      <textarea
        rows={3}
        className="bg-[#1e1e1e] border border-white/10 text-white text-sm rounded-xl px-4 py-3 outline-none focus:border-[var(--gold)]/50 transition-colors placeholder-white/20 resize-none"
        {...props}
      />
    </div>
  );
}

// ── Role Card ─────────────────────────────────────────────────────────────────
function RoleCard({ role, onEdit }) {
  const meta = ROLE_META[role.name] ?? DEFAULT_META;
  const Icon = meta.icon;

  const formattedDate = role.createdAt
    ? new Date(role.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    : null;

  return (
    <div className={`group flex items-start gap-5 p-6 rounded-2xl border bg-gradient-to-r ${meta.accent} transition-all duration-200 hover:scale-[1.005]`}>
      {/* Icon */}
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${meta.iconCls}`}>
        <Icon size={20} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-base font-semibold text-white" style={{ fontFamily: "Cormorant Garamond, serif" }}>
            {role.displayName || role.name}
          </p>
          {role.isActive === false && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/25 text-red-400 uppercase tracking-wider">
              Inactive
            </span>
          )}
        </div>

        {role.description && (
          <p className="text-xs text-white/35 mt-0.5 line-clamp-1">{role.description}</p>
        )}

        {/* Meta row */}
        <div className="flex items-center gap-4 mt-2 flex-wrap">
          {role.userCount !== undefined && (
            <span className="flex items-center gap-1 text-[11px] text-white/30">
              <Users size={11} />
              {role.userCount} {role.userCount === 1 ? "user" : "users"}
            </span>
          )}
          {formattedDate && (
            <span className="flex items-center gap-1 text-[11px] text-white/30">
              <Calendar size={11} />
              {formattedDate}
            </span>
          )}
          {role.createdBy && (
            <span className="flex items-center gap-1 text-[11px] text-white/30">
              <User size={11} />
              {role.createdBy}
            </span>
          )}
        </div>
      </div>

      {/* Edit Button */}
      <button
        onClick={() => onEdit(role)}
        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium border border-white/10 text-white/50 hover:border-[var(--gold)]/50 hover:text-[var(--gold)] hover:bg-[var(--gold)]/5 transition-all duration-200 shrink-0 mt-0.5"
      >
        <Pencil size={12} />
        Edit
      </button>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function RolesManagement() {
  const navigate = useNavigate();

  const [roles,      setRoles]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [toast,      setToast]      = useState(null);

  const [showCreate, setShowCreate] = useState(false);
  const [showEdit,   setShowEdit]   = useState(false);

  // Create form: roleName, displayName, description
  const [createForm, setCreateForm] = useState({ roleName: "", displayName: "", description: "" });

  // Edit form: roleId, displayName, description
  const [editForm,   setEditForm]   = useState({ roleId: "", displayName: "", description: "" });

  const [submitting, setSubmitting] = useState(false);

  const notify = (message, type = "success") => setToast({ message, type });

  // ── Fetch roles from API ──────────────────────────────────────────────────
  const fetchRoles = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getRoles();
      const data = res.data?.data ?? res.data ?? [];
      setRoles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch roles:", err);
      setError("Failed to load roles. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRoles(); }, []);

  // ── Create Role → POST /api/v1/IdentityManagement/roles ──────────────────
  // Body: { roleName, displayName, description }
  const handleCreate = async () => {
    if (!createForm.roleName.trim()) return;
    setSubmitting(true);
    try {
      await createRole({
        roleName:    createForm.roleName.trim(),
        displayName: createForm.displayName.trim() || createForm.roleName.trim(),
        description: createForm.description.trim(),
      });
      notify("Role created successfully!");
      setShowCreate(false);
      setCreateForm({ roleName: "", displayName: "", description: "" });
      fetchRoles();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.errors?.[0] || "Failed to create role";
      notify(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Open Edit Modal ───────────────────────────────────────────────────────
  const openEdit = (role) => {
    setEditForm({
      roleId:      role.id,
      displayName: role.displayName || role.name || "",
      description: role.description ?? "",
    });
    setShowEdit(true);
  };

  // ── Update Role → PUT /api/v1/IdentityManagement/roles/{roleId} ──────────
  // Body: { displayName, description }
  const handleUpdate = async () => {
    if (!editForm.displayName.trim()) return;
    setSubmitting(true);
    try {
      await updateRole(editForm.roleId, {
        displayName: editForm.displayName.trim(),
        description: editForm.description.trim(),
      });
      notify("Role updated successfully!");
      setShowEdit(false);
      fetchRoles();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.errors?.[0] || "Failed to update role";
      notify(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen text-white relative bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(10,10,10,0.78) 0%, rgba(10,10,10,0.92) 60%, rgba(10,10,10,1) 100%), url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1800&q=80')`,
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
              src="https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1800&q=80"
              alt="Roles"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-center px-10">
              <p className="text-[10px] tracking-[5px] uppercase text-[var(--gold)] mb-2">Identity Management</p>
              <h1 className="text-4xl font-semibold text-white" style={{ fontFamily: "Cormorant Garamond, serif" }}>
                Roles Management
              </h1>
            </div>
          </div>

          {/* ── Create Role Button ── */}
          <div className="flex justify-end mb-6">
            <button
              onClick={() => { setCreateForm({ roleName: "", displayName: "", description: "" }); setShowCreate(true); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-[var(--gold)] text-black hover:opacity-90 transition-opacity"
            >
              <Plus size={15} />
              Create Role
            </button>
          </div>

          {/* ── Roles List ── */}
          {loading ? (
            <div className="flex items-center justify-center py-24 gap-3 text-white/40">
              <Loader2 size={22} className="animate-spin" />
              <span className="text-sm">Loading roles...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-red-400/60">
              <AlertCircle size={40} />
              <p className="text-sm">{error}</p>
              <button
                onClick={fetchRoles}
                className="mt-2 text-xs px-4 py-2 rounded-xl border border-white/10 text-white/40 hover:text-white hover:border-white/30 transition-all"
              >
                Retry
              </button>
            </div>
          ) : roles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-white/30">
              <ShieldCheck size={40} />
              <p className="text-sm">No roles found</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {roles.map((role) => (
                <RoleCard key={role.id} role={role} onEdit={openEdit} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Create Modal ── */}
      {showCreate && (
        <Modal title="Create New Role" onClose={() => setShowCreate(false)}>
          <div className="flex flex-col gap-4">
            <Field
              label="Role Name *"
              placeholder="e.g. Moderator"
              value={createForm.roleName}
              onChange={(e) => setCreateForm((p) => ({ ...p, roleName: e.target.value }))}
            />
            <Field
              label="Display Name"
              placeholder="e.g. Content Moderator"
              value={createForm.displayName}
              onChange={(e) => setCreateForm((p) => ({ ...p, displayName: e.target.value }))}
            />
            <TextArea
              label="Description (optional)"
              placeholder="Brief description..."
              value={createForm.description}
              onChange={(e) => setCreateForm((p) => ({ ...p, description: e.target.value }))}
            />
            <div className="flex justify-end gap-3 pt-1">
              <button onClick={() => setShowCreate(false)} className="text-sm text-white/40 hover:text-white transition-colors px-4 py-2">
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={submitting || !createForm.roleName.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-[var(--gold)] text-black hover:opacity-90 disabled:opacity-40 transition-opacity"
              >
                {submitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                Create
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Edit Modal ── */}
      {showEdit && (
        <Modal title={`Edit — ${editForm.displayName}`} onClose={() => setShowEdit(false)}>
          <div className="flex flex-col gap-4">
            <Field
              label="Display Name *"
              placeholder="e.g. Content Moderator"
              value={editForm.displayName}
              onChange={(e) => setEditForm((p) => ({ ...p, displayName: e.target.value }))}
            />
            <TextArea
              label="Description"
              placeholder="Brief description..."
              value={editForm.description}
              onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
            />
            <div className="flex justify-end gap-3 pt-1">
              <button onClick={() => setShowEdit(false)} className="text-sm text-white/40 hover:text-white transition-colors px-4 py-2">
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={submitting || !editForm.displayName.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-[var(--gold)] text-black hover:opacity-90 disabled:opacity-40 transition-opacity"
              >
                {submitting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                Save Changes
              </button>
            </div>
          </div>
        </Modal>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
