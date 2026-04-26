import { ChefHat, LayoutDashboard, ShoppingBag, Store, Wifi, WifiOff } from "lucide-react";

const navItems = [
  { key: "landing", label: "Accueil", icon: ChefHat },
  { key: "student", label: "Étudiant", icon: ShoppingBag },
  { key: "vendor", label: "Vendeur", icon: Store },
];

export default function Navbar({ activeView, onNavigate, isApiOnline }) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="section-shell flex min-h-16 flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={() => onNavigate("landing")}
          className="flex items-center gap-3 text-left"
          aria-label="Retour à l'accueil"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-white shadow-glow">
            <ChefHat size={24} />
          </span>
          <span>
            <span className="block text-base font-black tracking-tight">FPK-EXPRESS</span>
            <span className="block text-xs font-medium text-slate-500">AI-powered preorder & pickup</span>
          </span>
        </button>

        <nav className="flex flex-wrap items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  isActive ? "bg-softOrange text-primary" : "text-slate-600 hover:bg-slate-100 hover:text-navy"
                }`}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
          <span
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold ${
              isApiOnline ? "bg-emerald-50 text-fresh" : "bg-slate-100 text-slate-500"
            }`}
          >
            {isApiOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
            {isApiOnline ? "API active" : "Mode démo"}
          </span>
          <button onClick={() => onNavigate("vendor")} className="icon-button" aria-label="Ouvrir le dashboard vendeur">
            <LayoutDashboard size={18} />
          </button>
        </nav>
      </div>
    </header>
  );
}
