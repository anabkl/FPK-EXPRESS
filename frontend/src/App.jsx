import { useEffect, useMemo, useState } from "react";
import Navbar from "./components/Navbar.jsx";
import HeroSection from "./components/HeroSection.jsx";
import StatsSection from "./components/StatsSection.jsx";
import ProblemSection from "./components/ProblemSection.jsx";
import SolutionSection from "./components/SolutionSection.jsx";
import HowItWorks from "./components/HowItWorks.jsx";
import AIInsights from "./components/AIInsights.jsx";
import MealGrid from "./components/MealGrid.jsx";
import MealPreviewSection from "./components/MealPreviewSection.jsx";
import OrderModal from "./components/OrderModal.jsx";
import StudentDashboard from "./components/StudentDashboard.jsx";
import VendorDashboard from "./components/VendorDashboard.jsx";
import LoginPage from "./components/LoginPage.jsx";
import UnauthorizedState from "./components/UnauthorizedState.jsx";
import Footer from "./components/Footer.jsx";
import ErrorState from "./components/ErrorState.jsx";
import LoadingState from "./components/LoadingState.jsx";
import { ToastViewport, useToasts } from "./components/Toast.jsx";
import { api } from "./api/client.js";
import { clearLegacyRoleSession, clearSession, getAccessToken, isStudent, isVendor, normalizeRole, setAccessToken } from "./utils/session.js";
import { sampleMeals } from "./data/mockData.js";

const emptyStats = {
  total_orders: 0,
  estimated_order_value: 0,
  average_waiting_time: 0,
  popular_meal: "Aucun plat",
  orders_by_state: [],
  orders_per_hour: [],
  popular_meals: [],
  waiting_time_by_hour: [],
};

const emptyRecommendations = {
  summary: { active_orders: 0, top_recommendation: "Aucun plat disponible", campus_load: "Normale", insight: "" },
  recommendations: [],
};

const roleViews = { student: "student", vendor: "vendor" };

function getRoleView(role) {
  if (isStudent(role)) return "student";
  if (isVendor(role)) return "vendor";
  return "landing";
}

function developmentMeals() {
  return sampleMeals.map((meal) => ({
    ...meal,
    stock_quantity: 50,
    snack_partner: { id: 0, name: "Données locales de développement", address: "FPK Khouribga", is_open: true },
  }));
}

export default function App() {
  const { toasts, showToast, removeToast } = useToasts();
  const [theme, setTheme] = useState(() => {
    const savedTheme = window.localStorage.getItem("fpk-express-theme");
    if (savedTheme === "dark" || savedTheme === "light") return savedTheme;
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  const [user, setUser] = useState(null);
  const [loginRole, setLoginRole] = useState("student");
  const [activeView, setActiveView] = useState("landing");
  const [unauthorizedRole, setUnauthorizedRole] = useState(null);
  const [meals, setMeals] = useState([]);
  const [vendorMeals, setVendorMeals] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(emptyStats);
  const [recommendations, setRecommendations] = useState(emptyRecommendations);
  const [peakHours, setPeakHours] = useState({ predictions: [] });
  const [vendorProfile, setVendorProfile] = useState(null);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [pendingMeal, setPendingMeal] = useState(null);
  const [isApiOnline, setIsApiOnline] = useState(false);
  const [publicError, setPublicError] = useState("");
  const [protectedError, setProtectedError] = useState("");
  const [isPublicLoading, setIsPublicLoading] = useState(true);
  const [isProtectedLoading, setIsProtectedLoading] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  async function refreshPublicData({ showLoading = false } = {}) {
    if (showLoading) setIsPublicLoading(true);
    try {
      const [mealData, recommendationData, peakData] = await Promise.all([
        api.getMeals(),
        api.getRecommendations(),
        api.getPeakHours(),
      ]);
      setMeals(mealData);
      setRecommendations(recommendationData);
      setPeakHours(peakData);
      setIsApiOnline(true);
      setPublicError("");
    } catch (error) {
      setIsApiOnline(false);
      if (import.meta.env.DEV) {
        setMeals(developmentMeals());
        setRecommendations(emptyRecommendations);
        setPeakHours({ predictions: [] });
        setPublicError("L'API est indisponible. Des données locales clairement identifiées sont affichées uniquement pour le développement; aucune commande ne sera simulée.");
      } else {
        setMeals([]);
        setPublicError(error.message || "Le service est momentanément indisponible.");
      }
    } finally {
      setIsPublicLoading(false);
    }
  }

  async function refreshStudentData({ showLoading = false } = {}) {
    if (showLoading) setIsProtectedLoading(true);
    try {
      const orderData = await api.getOrders();
      setOrders(orderData);
      setProtectedError("");
      setIsApiOnline(true);
    } catch (error) {
      setProtectedError(error.message || "Impossible de charger vos commandes.");
      if (error.status === 401) handleExpiredSession();
    } finally {
      setIsProtectedLoading(false);
    }
  }

  async function refreshVendorData({ showLoading = false } = {}) {
    if (showLoading) setIsProtectedLoading(true);
    try {
      const [mealData, orderData, statData, profileData] = await Promise.all([
        api.getVendorMeals(),
        api.getVendorOrders(),
        api.getStats(),
        api.getVendorProfile(),
      ]);
      setVendorMeals(mealData);
      setOrders(orderData);
      setStats(statData);
      setVendorProfile(profileData);
      setProtectedError("");
      setIsApiOnline(true);
    } catch (error) {
      setProtectedError(error.message || "Impossible de charger le tableau de bord vendeur.");
      if (error.status === 401) handleExpiredSession();
    } finally {
      setIsProtectedLoading(false);
    }
  }

  function handleExpiredSession() {
    clearSession();
    setUser(null);
    setOrders([]);
    setVendorMeals([]);
    setVendorProfile(null);
    setStats(emptyStats);
    setLoginRole("student");
    setActiveView("login");
    showToast({ type: "warning", title: "Session expirée", message: "Reconnectez-vous pour continuer." });
  }

  useEffect(() => {
    clearLegacyRoleSession();
    refreshPublicData({ showLoading: true });

    async function restoreSession() {
      const token = getAccessToken();
      if (!token) {
        setIsAuthLoading(false);
        return;
      }
      try {
        const currentUser = await api.getMe();
        setUser(currentUser);
        setActiveView(getRoleView(currentUser.role));
        if (isStudent(currentUser.role)) await refreshStudentData({ showLoading: true });
        if (isVendor(currentUser.role)) await refreshVendorData({ showLoading: true });
      } catch {
        clearSession();
      } finally {
        setIsAuthLoading(false);
      }
    }

    restoreSession();
  }, []);

  useEffect(() => {
    const isDark = theme === "dark";
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.style.colorScheme = isDark ? "dark" : "light";
    window.localStorage.setItem("fpk-express-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (!user) return undefined;
    const timer = window.setInterval(() => {
      if (isStudent(user.role)) refreshStudentData();
      if (isVendor(user.role)) refreshVendorData();
    }, 15000);
    return () => window.clearInterval(timer);
  }, [user?.id]);

  const currentOrder = useMemo(
    () => orders.find((order) => ["Pending", "Preparing", "Ready"].includes(order.status)),
    [orders],
  );

  async function completeAuthentication(authResult, expectedRole) {
    if (expectedRole && authResult.user.role !== expectedRole) {
      throw new Error(`Ce compte ne correspond pas à l'espace ${expectedRole === "vendor" ? "vendeur" : "étudiant"}.`);
    }
    setAccessToken(authResult.access_token);
    setUser(authResult.user);
    setLoginRole(authResult.user.role);
    setUnauthorizedRole(null);
    setActiveView(getRoleView(authResult.user.role));
    if (isStudent(authResult.user.role)) await refreshStudentData({ showLoading: true });
    if (isVendor(authResult.user.role)) await refreshVendorData({ showLoading: true });
    if (pendingMeal && isStudent(authResult.user.role)) {
      setSelectedMeal(pendingMeal);
      setPendingMeal(null);
    }
    showToast({
      type: "success",
      title: "Connexion réussie",
      message: `Bienvenue ${authResult.user.full_name}.`,
    });
  }

  async function handleLogin(credentials, expectedRole) {
    const result = await api.login(credentials);
    await completeAuthentication(result, expectedRole);
  }

  async function handleRegister(credentials) {
    const result = await api.register(credentials);
    await completeAuthentication(result, "student");
  }

  async function handleCreateOrder(payload) {
    try {
      const created = await api.createOrder(payload);
      setOrders((previous) => [created, ...previous]);
      setPublicError("");
      showToast({
        type: "success",
        title: "Commande créée",
        message: `${created.order_reference} est confirmée pour ${created.pickup_time}. Paiement au retrait.`,
      });
      refreshPublicData();
      return created;
    } catch (error) {
      showToast({ type: "error", title: "Commande non créée", message: error.message });
      throw error;
    }
  }

  async function handleCancelOrder(orderId) {
    try {
      const updated = await api.cancelOrder(orderId);
      setOrders((previous) => previous.map((order) => (order.id === orderId ? updated : order)));
      showToast({ type: "success", title: "Commande annulée", message: `${updated.order_reference} a été annulée.` });
      refreshPublicData();
    } catch (error) {
      showToast({ type: "error", title: "Annulation impossible", message: error.message });
      throw error;
    }
  }

  async function handleSaveMeal(payload, mealId) {
    try {
      const saved = mealId ? await api.updateMeal(mealId, payload) : await api.createMeal(payload);
      setVendorMeals((previous) => mealId ? previous.map((meal) => (meal.id === mealId ? saved : meal)) : [saved, ...previous]);
      showToast({ type: "success", title: mealId ? "Plat modifié" : "Plat ajouté", message: `${saved.name} est enregistré.` });
      refreshPublicData();
      return saved;
    } catch (error) {
      showToast({ type: "error", title: "Enregistrement impossible", message: error.message });
      throw error;
    }
  }

  async function handleToggleMeal(meal) {
    try {
      const saved = await api.updateMeal(meal.id, { is_available: !meal.is_available });
      setVendorMeals((previous) => previous.map((item) => (item.id === meal.id ? saved : item)));
      showToast({ type: "success", title: "Disponibilité mise à jour", message: `${saved.name} est ${saved.is_available ? "disponible" : "indisponible"}.` });
      refreshPublicData();
    } catch (error) {
      showToast({ type: "error", title: "Mise à jour impossible", message: error.message });
    }
  }

  async function handleDeleteMeal(mealId) {
    try {
      await api.deleteMeal(mealId);
      setVendorMeals((previous) => previous.filter((meal) => meal.id !== mealId));
      showToast({ type: "success", title: "Plat supprimé", message: "Le menu a été mis à jour." });
      refreshPublicData();
    } catch (error) {
      showToast({ type: "error", title: "Suppression impossible", message: error.message });
      throw error;
    }
  }

  async function handleStatusChange(orderId, status) {
    try {
      const updated = await api.updateOrderStatus(orderId, status);
      setOrders((previous) => previous.map((order) => (order.id === orderId ? updated : order)));
      showToast({ type: "success", title: "Statut mis à jour", message: `${updated.order_reference} a été mise à jour.` });
      refreshVendorData();
    } catch (error) {
      showToast({ type: "error", title: "Transition refusée", message: error.message });
      throw error;
    }
  }

  async function handleMarkPaid(orderId) {
    try {
      const updated = await api.markOrderPaid(orderId);
      setOrders((previous) => previous.map((order) => (order.id === orderId ? updated : order)));
      showToast({ type: "success", title: "Paiement confirmé", message: `${updated.order_reference} est payée au retrait.` });
      refreshVendorData();
    } catch (error) {
      showToast({ type: "error", title: "Confirmation impossible", message: error.message });
    }
  }

  async function handleTogglePartner(isOpen) {
    try {
      const partner = await api.updatePartner(isOpen);
      setVendorProfile((current) => ({ ...current, partner }));
      showToast({ type: "success", title: "Snack mis à jour", message: `Le snack est maintenant ${partner.is_open ? "ouvert" : "fermé"}.` });
      refreshPublicData();
    } catch (error) {
      showToast({ type: "error", title: "Mise à jour impossible", message: error.message });
    }
  }

  function handleNavigate(view) {
    const requiredRole = roleViews[view];
    if (requiredRole && !user) {
      setLoginRole(view);
      setActiveView("login");
      return;
    }
    if (requiredRole && user.role !== requiredRole) {
      setUnauthorizedRole(requiredRole);
      setActiveView("unauthorized");
      return;
    }
    setUnauthorizedRole(null);
    setActiveView(view);
  }

  function handleLogout() {
    clearSession();
    setUser(null);
    setOrders([]);
    setVendorMeals([]);
    setVendorProfile(null);
    setStats(emptyStats);
    setLoginRole("student");
    setUnauthorizedRole(null);
    setSelectedMeal(null);
    setPendingMeal(null);
    setProtectedError("");
    setActiveView("landing");
    refreshPublicData();
    showToast({ type: "info", title: "Déconnexion", message: "Votre session a été fermée." });
  }

  function handleSelectMeal(meal) {
    if (!user) {
      setPendingMeal(meal);
      setLoginRole("student");
      setActiveView("login");
      showToast({ type: "info", title: "Connexion requise", message: "Connectez-vous comme étudiant pour précommander." });
      return;
    }
    if (!isStudent(user.role)) {
      setUnauthorizedRole("student");
      setActiveView("unauthorized");
      return;
    }
    setSelectedMeal(meal);
  }

  function handleSwitchRole() {
    handleLogout();
    setLoginRole(normalizeRole(unauthorizedRole) || "student");
    setActiveView("login");
  }

  const activeError = activeView === "landing" ? publicError : protectedError || publicError;
  const isLoading = isAuthLoading || (activeView === "landing" ? isPublicLoading : isProtectedLoading);

  return (
    <div className="min-h-screen bg-canvas text-navy transition-colors duration-300">
      <ToastViewport toasts={toasts} onDismiss={removeToast} />
      <Navbar
        activeView={activeView}
        onNavigate={handleNavigate}
        isApiOnline={isApiOnline}
        theme={theme}
        user={user}
        onToggleTheme={() => setTheme((value) => (value === "dark" ? "light" : "dark"))}
        onLogout={handleLogout}
      />

      {(isLoading || activeError) && (
        <div className="section-shell pt-4">
          {isLoading ? (
            <LoadingState label="Synchronisation avec FPK-EXPRESS..." compact />
          ) : (
            <ErrorState
              title="Service momentanément indisponible"
              message={activeError}
              actionLabel="Réessayer"
              onAction={() => user ? (isVendor(user.role) ? refreshVendorData({ showLoading: true }) : refreshStudentData({ showLoading: true })) : refreshPublicData({ showLoading: true })}
              compact
            />
          )}
        </div>
      )}

      {activeView === "landing" && (
        <main>
          <HeroSection onNavigate={handleNavigate} meals={meals} />
          <StatsSection />
          <ProblemSection />
          <SolutionSection />
          <HowItWorks />
          <AIInsights recommendations={recommendations} peakHours={peakHours} stats={stats} isLoading={isPublicLoading} />
          <MealPreviewSection meals={meals.slice(0, 4)} onSelectMeal={handleSelectMeal} />
        </main>
      )}

      {activeView === "login" && (
        <LoginPage preferredRole={loginRole} onLogin={handleLogin} onRegister={handleRegister} onNavigate={handleNavigate} />
      )}

      {activeView === "unauthorized" && (
        <UnauthorizedState
          currentRole={user?.role}
          requestedRole={unauthorizedRole}
          onGoHome={() => handleNavigate("landing")}
          onGoDashboard={() => handleNavigate(getRoleView(user?.role))}
          onSwitchRole={handleSwitchRole}
        />
      )}

      {activeView === "student" && isStudent(user?.role) && (
        <main className="section-shell py-8 sm:py-10">
          <StudentDashboard
            user={user}
            orders={orders}
            currentOrder={currentOrder}
            recommendations={recommendations.recommendations || []}
            onSelectMeal={handleSelectMeal}
            onCancelOrder={handleCancelOrder}
            isLoading={isProtectedLoading}
          />
          <MealGrid meals={meals} orders={orders} onSelectMeal={handleSelectMeal} isLoading={isPublicLoading} />
        </main>
      )}

      {activeView === "vendor" && isVendor(user?.role) && (
        <main className="section-shell py-8 sm:py-10">
          <VendorDashboard
            user={user}
            profile={vendorProfile}
            meals={vendorMeals}
            orders={orders}
            stats={stats}
            onSaveMeal={handleSaveMeal}
            onDeleteMeal={handleDeleteMeal}
            onToggleMeal={handleToggleMeal}
            onStatusChange={handleStatusChange}
            onMarkPaid={handleMarkPaid}
            onTogglePartner={handleTogglePartner}
            onToast={showToast}
            isLoading={isProtectedLoading}
          />
        </main>
      )}

      <Footer onNavigate={handleNavigate} />

      {selectedMeal && (
        <OrderModal
          meal={selectedMeal}
          orders={orders}
          user={user}
          onClose={() => setSelectedMeal(null)}
          onSubmit={handleCreateOrder}
          onToast={showToast}
        />
      )}
    </div>
  );
}
