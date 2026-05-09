import { useNavigate } from "react-router-dom";
import {
  Users,
  ShieldCheck,
  Wallet,
  Settings,
  ArrowRight,
  Crown,
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";

const CARDS = [
  {
    id: "users",
    title: "Users",
    description: "Manage all registered users, roles & accounts",
    icon: Users,
    href: "/admin/users",
    badge: null,
    accent: "from-[var(--gold)]/15 to-[var(--gold)]/5 border-[var(--gold)]/20",
    iconColor: "text-[var(--gold)] bg-[var(--gold)]/10 border-[var(--gold)]/20",
  },
  {
    id: "roles",
    title: "Roles",
    description: "Create & configure system permission roles",
    icon: ShieldCheck,
    href: "/admin/roles",
    badge: null,
    accent: "from-purple-500/15 to-purple-500/5 border-purple-500/20",
    iconColor: "text-purple-300 bg-purple-500/10 border-purple-500/20",
  },
  {
    id: "payout",
    title: "Payout Balance",
    description: "Review pending & processed landlord payouts",
    icon: Wallet,
    href: "/admin/payouts",
    badge: null,
    accent: "from-emerald-500/15 to-emerald-500/5 border-emerald-500/20",
    iconColor: "text-emerald-300 bg-emerald-500/10 border-emerald-500/20",
  },
  {
    id: "settings",
    title: "Platform Settings",
    description: "Configure global platform rules & parameters",
    icon: Settings,
    href: "/admin/settings",
    badge: null,
    accent: "from-blue-500/15 to-blue-500/5 border-blue-500/20",
    iconColor: "text-blue-300 bg-blue-500/10 border-blue-500/20",
  },
];

export default function SuperAdminDashboard() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen text-white relative bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(10,10,10,0.80) 0%, rgba(10,10,10,0.93) 60%, rgba(10,10,10,1) 100%), url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1800&q=80')`,
      }}
    >
      <div className="relative z-10 pt-12">
        <Navbar />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">

          {/* ── Header ── */}
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-12 rounded-2xl bg-[var(--gold)]/10 border border-[var(--gold)]/20 flex items-center justify-center shrink-0">
              <Crown size={20} className="text-[var(--gold)]" />
            </div>
            <div>
              <p className="text-[10px] tracking-[5px] uppercase text-[var(--gold)] mb-1">
                Control Panel
              </p>
              <h1
                className="text-4xl font-semibold text-white"
                style={{ fontFamily: "Cormorant Garamond, serif" }}
              >
                Super Admin Dashboard
              </h1>
            </div>
          </div>

          {/* ── Cards Grid ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {CARDS.map((card) => {
              const Icon = card.icon;
              const isDisabled = card.badge === "Soon";

              return (
                <button
                  key={card.id}
                  onClick={() => !isDisabled && navigate(card.href)}
                  disabled={isDisabled}
                  className={`
                    group relative text-left p-7 rounded-3xl border bg-gradient-to-br transition-all duration-300
                    ${card.accent}
                    ${isDisabled
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/40 active:scale-[0.99]"
                    }
                  `}
                >
                  {/* Badge */}
                  {card.badge && (
                    <span className="absolute top-5 right-5 text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/40">
                      {card.badge}
                    </span>
                  )}

                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border mb-5 ${card.iconColor}`}>
                    <Icon size={20} />
                  </div>

                  {/* Text */}
                  <h2
                    className="text-2xl font-semibold text-white mb-2"
                    style={{ fontFamily: "Cormorant Garamond, serif" }}
                  >
                    {card.title}
                  </h2>
                  <p className="text-sm text-white/40 leading-relaxed">
                    {card.description}
                  </p>

                  {/* Arrow */}
                  {!isDisabled && (
                    <div className="flex items-center gap-1.5 mt-6 text-xs font-medium text-white/30 group-hover:text-[var(--gold)] transition-colors duration-200">
                      <span>Open</span>
                      <ArrowRight
                        size={13}
                        className="group-hover:translate-x-1 transition-transform duration-200"
                      />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
