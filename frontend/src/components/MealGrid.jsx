import { useMemo, useState } from "react";
import { Search, SearchX, SlidersHorizontal } from "lucide-react";
import MealCard from "./MealCard.jsx";
import EmptyState from "./EmptyState.jsx";
import { categories } from "../data/mockData.js";

export default function MealGrid({ meals, orders, onSelectMeal }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Tous");

  const filteredMeals = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return meals.filter((meal) => {
      const matchesCategory = category === "Tous" || meal.category === category;
      const matchesQuery =
        !normalizedQuery ||
        meal.name.toLowerCase().includes(normalizedQuery) ||
        meal.description.toLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [meals, category, query]);

  const activeOrders = orders.filter((order) => ["Pending", "Preparing"].includes(order.status)).length;

  return (
    <section className="mt-8">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-primary">Student side</p>
          <h2 className="mt-2 text-3xl font-black tracking-normal text-navy">Commander sans attendre.</h2>
          <p className="mt-2 max-w-2xl text-base leading-7 text-slate-600">
            Rechercher un repas, filtrer par besoin et réserver un créneau de pickup.
          </p>
        </div>

        <div className="rounded-lg border border-orange-200 bg-softOrange px-4 py-3 text-sm font-bold text-primary">
          {activeOrders} commandes en préparation
        </div>
      </div>

      <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher: sandwich, café, healthy..."
            className="h-12 w-full rounded-lg border border-slate-200 bg-white pl-11 pr-4 text-sm font-medium outline-none transition focus:border-primary focus:ring-4 focus:ring-orange-100"
          />
        </label>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 sm:flex">
            <SlidersHorizontal size={18} />
          </span>
          {categories.map((item) => (
            <button
              key={item.value}
              onClick={() => setCategory(item.value)}
              className={`shrink-0 rounded-lg px-3 py-2 text-sm font-bold transition ${
                category === item.value ? "bg-navy text-white" : "border border-slate-200 bg-white text-slate-600 hover:text-primary"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {filteredMeals.map((meal) => (
          <MealCard key={meal.id} meal={meal} onSelectMeal={onSelectMeal} />
        ))}
      </div>

      {filteredMeals.length === 0 && (
        <div className="mt-6">
          <EmptyState
            icon={SearchX}
            title="Aucun repas trouvé"
            message="Essayez une autre catégorie ou une recherche plus simple pour retrouver les options disponibles."
            actionLabel="Réinitialiser les filtres"
            onAction={() => {
              setQuery("");
              setCategory("Tous");
            }}
          />
        </div>
      )}
    </section>
  );
}
