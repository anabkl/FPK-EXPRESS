import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChefHat, LayoutDashboard, LogIn, LogOut, Menu, Moon, ShoppingBag, Store, Sun, UserRound, Wifi, WifiOff, X } from "lucide-react";

const navItems = [
  { key: "landing", label: "Accueil", icon: ChefHat },
  { key: "student", label: "Étudiant", icon: ShoppingBag },
  { key: "vendor", label: "Vendeur", icon: Store },
];

function ApiStatus({ isApiOnline, mobile = false }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold ${
        isApiOnline ? "bg-emerald-50 text-fresh" : "bg-slate-100 text-slate-500"
      } ${mobile ? "w-full justify-center" : ""}`}
    >
      {isApiOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
      {isApiOnline ? "API active" : "Mode démo"}
    </span>
  );
}

function NavButton({ item, isActive, onClick, mobile = false }) {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
        mobile ? "w-full justify-start" : ""
      } ${isActive ? "bg-softOrange text-primary" : "text-slate-600 hover:bg-slate-100 hover:text-navy"}`}
      aria-current={isActive ? "page" : undefined}
    >
      <Icon size={16} />
      {item.label}
    </button>
  );
}

function ThemeToggle({ theme, onToggleTheme, mobile = false }) {
  const isDark = theme === "dark";
  const Icon = isDark ? Sun : Moon;

  return (
    <button
      onClick={onToggleTheme}
      className={`icon-button ${mobile ? "!w-full justify-start gap-2 px-3 text-sm font-semibold" : ""}`}
      aria-label={isDark ? "Activer le mode clair" : "Activer le mode sombre"}
      title={isDark ? "Mode clair" : "Mode sombre"}
    >
      <Icon size={18} />
      {mobile && <span>{isDark ? "Mode clair" : "Mode sombre"}</span>}
    </button>
  );
}

function SessionActions({ userRole, activeView, onLoginClick, onLogout, mobile = false }) {
  if (!userRole) {
    return (
      <button
        onClick={onLoginClick}
        className={`inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-primary hover:text-primary ${
          activeView === "login" ? "border-primary bg-softOrange text-primary" : ""
        } ${mobile ? "w-full justify-start" : ""}`}
      >
        <LogIn size={16} />
        Connexion
      </button>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${mobile ? "w-full" : ""}`}>
      <span
        className={`inline-flex items-center gap-2 rounded-lg bg-softOrange px-3 py-2 text-xs font-black uppercase tracking-[0.08em] text-primary ${
          mobile ? "flex-1 justify-center" : ""
        }`}
      >
        <UserRound size={14} />
        {userRole === "vendor" ? "Vendor" : "Student"}
      </span>
      <button onClick={onLogout} className="icon-button" aria-label="Se déconnecter" title="Déconnexion">
        <LogOut size={18} />
      </button>
    </div>
  );
}

export default function Navbar({ activeView, onNavigate, isApiOnline, theme, onToggleTheme, userRole, onLogout }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function handleNavigate(key) {
    onNavigate(key);
    setIsMenuOpen(false);
  }

  function handleLogoutClick() {
    onLogout();
    setIsMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="section-shell flex min-h-16 items-center justify-between gap-3 py-3">
        <button
          onClick={() => handleNavigate("landing")}
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

        <nav className="hidden items-center gap-2 md:flex" aria-label="Navigation principale">
          {navItems.map((item) => {
            const isActive = activeView === item.key;
            return (
              <NavButton
                key={item.key}
                item={item}
                isActive={isActive}
                onClick={() => handleNavigate(item.key)}
              />
            );
          })}
          <ApiStatus isApiOnline={isApiOnline} />
          <SessionActions
            userRole={userRole}
            activeView={activeView}
            onLoginClick={() => handleNavigate("login")}
            onLogout={handleLogoutClick}
          />
          <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
          <button onClick={() => handleNavigate("vendor")} className="icon-button" aria-label="Ouvrir le dashboard vendeur">
            <LayoutDashboard size={18} />
          </button>
        </nav>

        <button
          onClick={() => setIsMenuOpen((value) => !value)}
          className="icon-button md:hidden"
          aria-label={isMenuOpen ? "Fermer le menu mobile" : "Ouvrir le menu mobile"}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.nav
            id="mobile-navigation"
            initial={{ opacity: 0, height: 0, y: -8 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -8 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-slate-200 bg-white md:hidden"
            aria-label="Navigation mobile"
          >
            <div className="section-shell grid gap-2 py-3">
              {navItems.map((item) => (
                <NavButton
                  key={item.key}
                  item={item}
                  isActive={activeView === item.key}
                  onClick={() => handleNavigate(item.key)}
                  mobile
                />
              ))}
              <div className="grid grid-cols-[1fr_auto] gap-2 pt-1">
                <ApiStatus isApiOnline={isApiOnline} mobile />
                <button
                  onClick={() => handleNavigate("vendor")}
                  className="icon-button"
                  aria-label="Ouvrir le dashboard vendeur"
                >
                  <LayoutDashboard size={18} />
                </button>
              </div>
              <SessionActions
                userRole={userRole}
                activeView={activeView}
                onLoginClick={() => handleNavigate("login")}
                onLogout={handleLogoutClick}
                mobile
              />
              <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} mobile />
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
