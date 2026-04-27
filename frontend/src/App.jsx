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
import Footer from "./components/Footer.jsx";
import ErrorState from "./components/ErrorState.jsx";
import LoadingState from "./components/LoadingState.jsx";
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

export default function App() {
  const [activeView, setActiveView] = useState("landing");
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
      return localOrder;
    }
  }

  async function handleAddMeal(payload) {
    try {
      const created = await api.createMeal(payload);
      setMeals((previous) => [created, ...previous]);
      setApiError("");
      await refreshData();
    } catch {
      setMeals((previous) => [{ id: Date.now(), ...payload }, ...previous]);
      setApiError("Plat ajouté en mode démo local. Le backend n'a pas confirmé l'enregistrement.");
    }
  }

  async function handleStatusChange(orderId, status) {
    try {
      const updated = await api.updateOrderStatus(orderId, status);
      setOrders((previous) => previous.map((order) => (order.id === orderId ? updated : order)));
      setApiError("");
      await refreshData();
    } catch {
      setOrders((previous) => previous.map((order) => (order.id === orderId ? { ...order, status } : order)));
      setApiError("Statut modifié localement. La mise à jour API sera à refaire quand le backend sera disponible.");
    }
  }

  return (
    <div className="min-h-screen bg-canvas text-navy">
      <Navbar activeView={activeView} onNavigate={setActiveView} isApiOnline={isApiOnline} />

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
          <HeroSection onNavigate={setActiveView} meals={meals} />
          <StatsSection />
          <ProblemSection />
          <SolutionSection />
          <HowItWorks />
          <AIInsights recommendations={recommendations} peakHours={peakHours} stats={stats} />
          <MealPreviewSection meals={meals.slice(0, 4)} onSelectMeal={setSelectedMeal} />
        </main>
      )}

      {activeView === "student" && (
        <main className="section-shell py-8 sm:py-10">
          <StudentDashboard
            currentOrder={currentOrder}
            recommendations={recommendations.recommendations || []}
            onSelectMeal={setSelectedMeal}
          />
          <MealGrid meals={meals} orders={orders} onSelectMeal={setSelectedMeal} />
        </main>
      )}

      {activeView === "vendor" && (
        <main className="section-shell py-8 sm:py-10">
          <VendorDashboard
            meals={meals}
            orders={orders}
            stats={stats}
            onAddMeal={handleAddMeal}
            onStatusChange={handleStatusChange}
          />
        </main>
      )}

      <Footer onNavigate={setActiveView} />

      {selectedMeal && (
        <OrderModal
          meal={selectedMeal}
          orders={orders}
          onClose={() => setSelectedMeal(null)}
          onSubmit={handleCreateOrder}
        />
      )}
    </div>
  );
}
