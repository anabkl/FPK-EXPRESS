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
import Footer from "./components/Footer.jsx";
import ErrorState from "./components/ErrorState.jsx";
import LoadingState from "./components/LoadingState.jsx";
import { ToastViewport, useToasts } from "./components/Toast.jsx";
import { api } from "./api/client.js";
import {
  sampleMeals,
  sampleOrders,
  samplePeakHours,
  sampleStats,
} from "./data/mockData.js";

const fallbackRecommendations = {
  summary: {
    active_orders: 3,
    top_recommendation: "Sandwich Poulet",
    campus_load: "Normale",
    insight: "Les précommandes peuvent économiser 12 à 20 minutes pendant les pics de pause.",
  },
  recommendations: sampleMeals.slice(0, 4).map((meal) => ({
    meal,
    reason: meal.category === "Healthy" ? "Option équilibrée et rapide." : "Très demandé pendant les pauses FPK.",
    confidence: Math.min(0.96, 0.62 + meal.popularity_score / 260),
  })),
};

const ROLE_STORAGE_KEY = "fpk-express-role";
const roleViews = {
  student: "student",
  vendor: "vendor",
};

function getSavedRole() {
  const savedRole = window.localStorage.getItem(ROLE_STORAGE_KEY);
  return roleViews[savedRole] ? savedRole : null;
}

export default function App() {
  const { toasts, showToast, removeToast } = useToasts();
  const [theme, setTheme] = useState(() => {
    const savedTheme = window.localStorage.getItem("fpk-express-theme");
    if (savedTheme === "dark" || savedTheme === "light") return savedTheme;
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  const [userRole, setUserRole] = useState(getSavedRole);
  const [loginRole, setLoginRole] = useState(() => getSavedRole() || "student");
  const [activeView, setActiveView] = useState(() => roleViews[getSavedRole()] || "landing");
  const [meals, setMeals] = useState(sampleMeals);
  const [orders, setOrders] = useState(sampleOrders);
  const [stats, setStats] = useState(sampleStats);
  const [recommendations, setRecommendations] = useState(fallbackRecommendations);
  const [peakHours, setPeakHours] = useState(samplePeakHours);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [currentOrderId, setCurrentOrderId] = useState(sampleOrders[1]?.id);
  const [isApiOnline, setIsApiOnline] = useState(false);
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  async function refreshData({ showLoading = false } = {}) {
    if (showLoading) setIsLoading(true);
    try {
      const [mealData, orderData, statData, recommendationData, peakData] = await Promise.all([
        api.getMeals(),
        api.getOrders(),
        api.getStats(),
        api.getRecommendations(),
        api.getPeakHours(),
      ]);
      setMeals(mealData);
      setOrders(orderData);
      setStats(statData);
      setRecommendations(recommendationData);
      setPeakHours(peakData);
      setIsApiOnline(true);
      setApiError("");
      if (!currentOrderId && orderData.length) setCurrentOrderId(orderData[0].id);
    } catch {
      setIsApiOnline(false);
      setApiError("Le backend n'est pas joignable pour le moment. Le mode démo reste disponible avec les données locales.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    refreshData({ showLoading: true });
    const timer = window.setInterval(refreshData, 20000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const isDark = theme === "dark";
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.style.colorScheme = isDark ? "dark" : "light";
    window.localStorage.setItem("fpk-express-theme", theme);
  }, [theme]);

  const currentOrder = useMemo(() => {
    return orders.find((order) => order.id === currentOrderId) || orders.find((order) => order.status !== "Completed");
  }, [orders, currentOrderId]);

  async function handleCreateOrder(payload) {
    const meal = meals.find((item) => item.id === Number(payload.meal_id));
    try {
      const created = await api.createOrder(payload);
      setOrders((previous) => [created, ...previous]);
      setCurrentOrderId(created.id);
      setApiError("");
      showToast({
        type: "success",
        title: "Commande créée",
        message: `${created.meal?.name || meal?.name || "Votre repas"} est confirmé pour ${created.pickup_time}.`,
      });
      await refreshData();
      return created;
    } catch {
      const localOrder = {
        id: Date.now(),
        ...payload,
        meal_id: Number(payload.meal_id),
        quantity: Number(payload.quantity),
        status: "Pending",
        total_price: Number(((meal?.price || 0) * Number(payload.quantity) + 1).toFixed(2)),
        estimated_waiting_time: (meal?.preparation_time || 8) + 6,
        created_at: new Date().toISOString(),
        meal,
      };
      setOrders((previous) => [localOrder, ...previous]);
      setCurrentOrderId(localOrder.id);
      setApiError("Commande ajoutée en mode démo local. Elle sera synchronisée quand l'API sera disponible.");
      showToast({
        type: "warning",
        title: "API indisponible",
        message: "Commande créée en mode démo local.",
      });
      return localOrder;
    }
  }

  async function handleAddMeal(payload) {
    try {
      const created = await api.createMeal(payload);
      setMeals((previous) => [created, ...previous]);
      setApiError("");
      showToast({
        type: "success",
        title: "Plat ajouté",
        message: `${created.name} est maintenant disponible dans le menu.`,
      });
      await refreshData();
    } catch {
      setMeals((previous) => [{ id: Date.now(), ...payload }, ...previous]);
      setApiError("Plat ajouté en mode démo local. Le backend n'a pas confirmé l'enregistrement.");
      showToast({
        type: "warning",
        title: "API indisponible",
        message: "Plat ajouté localement pour garder la démo fluide.",
      });
    }
  }

  async function handleStatusChange(orderId, status) {
    try {
      const updated = await api.updateOrderStatus(orderId, status);
      setOrders((previous) => previous.map((order) => (order.id === orderId ? updated : order)));
      setApiError("");
      showToast({
        type: "success",
        title: "Statut mis à jour",
        message: `Commande #${orderId} passée à ${status}.`,
      });
      await refreshData();
    } catch {
      setOrders((previous) => previous.map((order) => (order.id === orderId ? { ...order, status } : order)));
      setApiError("Statut modifié localement. La mise à jour API sera à refaire quand le backend sera disponible.");
      showToast({
        type: "warning",
        title: "Mise à jour locale",
        message: `Commande #${orderId} passée à ${status} en mode démo.`,
      });
    }
  }

  function handleNavigate(view) {
    if (roleViews[view] && userRole !== view) {
      setLoginRole(view);
      setActiveView("login");
      return;
    }
    setActiveView(view);
  }

  function handleLogin(role) {
    window.localStorage.setItem(ROLE_STORAGE_KEY, role);
    setUserRole(role);
    setLoginRole(role);
    setActiveView(roleViews[role]);
    showToast({
      type: "success",
      title: role === "vendor" ? "Bienvenue vendeur" : "Bienvenue étudiant",
      message: "Session locale activée pour la démo FPK-EXPRESS.",
    });
  }

  function handleLogout() {
    window.localStorage.removeItem(ROLE_STORAGE_KEY);
    setUserRole(null);
    setSelectedMeal(null);
    setActiveView("landing");
    showToast({
      type: "info",
      title: "Déconnexion",
      message: "La session locale a été fermée.",
    });
  }

  function handleSelectMeal(meal) {
    if (userRole !== "student") {
      setLoginRole("student");
      setActiveView("login");
      showToast({
        type: "info",
        title: "Connexion étudiant",
        message: "Connectez-vous en mode étudiant pour finaliser une précommande.",
      });
      return;
    }
    setSelectedMeal(meal);
  }

  return (
    <div className="min-h-screen bg-canvas text-navy transition-colors duration-300">
      <ToastViewport toasts={toasts} onDismiss={removeToast} />
      <Navbar
        activeView={activeView}
        onNavigate={handleNavigate}
        isApiOnline={isApiOnline}
        theme={theme}
        userRole={userRole}
        onToggleTheme={() => setTheme((value) => (value === "dark" ? "light" : "dark"))}
        onLogout={handleLogout}
      />

      {(isLoading || apiError) && (
        <div className="section-shell pt-4">
          {isLoading ? (
            <LoadingState label="Synchronisation avec l'API FPK-EXPRESS..." compact />
          ) : (
            <ErrorState
              title="Mode démo activé"
              message={apiError}
              actionLabel="Réessayer"
              onAction={() => refreshData({ showLoading: true })}
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
          <AIInsights recommendations={recommendations} peakHours={peakHours} stats={stats} isLoading={isLoading} />
          <MealPreviewSection meals={meals.slice(0, 4)} onSelectMeal={handleSelectMeal} />
        </main>
      )}

      {activeView === "login" && (
        <LoginPage preferredRole={loginRole} onLogin={handleLogin} onNavigate={handleNavigate} />
      )}

      {activeView === "student" && userRole === "student" && (
        <main className="section-shell py-8 sm:py-10">
          <StudentDashboard
            currentOrder={currentOrder}
            recommendations={recommendations.recommendations || []}
            onSelectMeal={handleSelectMeal}
            isLoading={isLoading}
          />
          <MealGrid meals={meals} orders={orders} onSelectMeal={handleSelectMeal} isLoading={isLoading} />
        </main>
      )}

      {activeView === "vendor" && userRole === "vendor" && (
        <main className="section-shell py-8 sm:py-10">
          <VendorDashboard
            meals={meals}
            orders={orders}
            stats={stats}
            onAddMeal={handleAddMeal}
            onStatusChange={handleStatusChange}
            onToast={showToast}
            isLoading={isLoading}
          />
        </main>
      )}

      <Footer onNavigate={handleNavigate} />

      {selectedMeal && (
        <OrderModal
          meal={selectedMeal}
          orders={orders}
          onClose={() => setSelectedMeal(null)}
          onSubmit={handleCreateOrder}
          onToast={showToast}
        />
      )}
    </div>
  );
}
