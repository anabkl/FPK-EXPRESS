import { useState } from "react";
import { motion } from "framer-motion";
import { ClipboardList, Clock, DollarSign, Flame, ListOrdered, Plus, Store, Utensils } from "lucide-react";
import ChartsSection from "./ChartsSection.jsx";
import EmptyState from "./EmptyState.jsx";
import { categories } from "../data/mockData.js";

const defaultMeal = {
  name: "",
  category: "Sandwichs",
  price: 20,
  description: "",
  image_url: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80",
  preparation_time: 8,
  is_available: true,
  popularity_score: 70,
};

const statuses = ["Pending", "Preparing", "Ready", "Completed"];

export default function VendorDashboard({ meals, orders, stats, onAddMeal, onStatusChange }) {
  const [form, setForm] = useState(defaultMeal);

  async function handleSubmit(event) {
    event.preventDefault();
    await onAddMeal({
      ...form,
      price: Number(form.price),
      preparation_time: Number(form.preparation_time),
      popularity_score: Number(form.popularity_score),
    });
    setForm(defaultMeal);
  }

  const cards = [
    { label: "Total orders", value: stats.total_orders, icon: ListOrdered, tone: "bg-softOrange text-primary" },
    { label: "Revenue today", value: `${stats.revenue_today} MAD`, icon: DollarSign, tone: "bg-emerald-50 text-fresh" },
    { label: "Average waiting time", value: `${stats.average_waiting_time} min`, icon: Clock, tone: "bg-sky-50 text-sky-600" },
    { label: "Popular meal", value: stats.popular_meal, icon: Flame, tone: "bg-slate-100 text-navy" },
  ];

  return (
    <section className="space-y-8">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-primary">Vendor side</p>
          <h1 className="mt-2 text-3xl font-black tracking-normal text-navy">Dashboard vendeur.</h1>
          <p className="mt-2 max-w-2xl text-base leading-7 text-slate-600">
            Gérer les plats, suivre les commandes et anticiper les pics de pause.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-3 text-sm font-black text-white">
          <Store size={18} />
          Mock vendor mode
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -5, scale: 1.01 }}
              className="card p-5 transition-shadow hover:shadow-glow"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-slate-500">{card.label}</p>
                  <p className="mt-2 text-2xl font-black text-navy">{card.value}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${card.tone}`}>
                  <Icon size={24} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
        <form onSubmit={handleSubmit} className="card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-softOrange text-primary">
              <Plus size={22} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500">Add meal form</p>
              <h2 className="text-xl font-black text-navy">Ajouter un plat</h2>
            </div>
          </div>

          <div className="mt-5 grid gap-4">
            <label className="block">
              <span className="text-sm font-bold text-slate-700">Nom</span>
              <input
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-primary focus:ring-4 focus:ring-orange-100"
                placeholder="Ex: Wrap Poulet"
                required
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-bold text-slate-700">Catégorie</span>
                <select
                  value={form.category}
                  onChange={(event) => setForm({ ...form, category: event.target.value })}
                  className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-primary focus:ring-4 focus:ring-orange-100"
                >
                  {categories.filter((item) => item.value !== "Tous").map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-bold text-slate-700">Prix MAD</span>
                <input
                  type="number"
                  min="5"
                  max="35"
                  value={form.price}
                  onChange={(event) => setForm({ ...form, price: event.target.value })}
                  className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-primary focus:ring-4 focus:ring-orange-100"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-bold text-slate-700">Description</span>
              <textarea
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                className="mt-2 min-h-24 w-full rounded-lg border border-slate-200 p-3 outline-none focus:border-primary focus:ring-4 focus:ring-orange-100"
                placeholder="Ingrédients, format, bénéfice étudiant..."
                required
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-bold text-slate-700">Préparation min</span>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={form.preparation_time}
                  onChange={(event) => setForm({ ...form, preparation_time: event.target.value })}
                  className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-primary focus:ring-4 focus:ring-orange-100"
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-slate-700">Popularité</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={form.popularity_score}
                  onChange={(event) => setForm({ ...form, popularity_score: event.target.value })}
                  className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-primary focus:ring-4 focus:ring-orange-100"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-bold text-slate-700">Image URL</span>
              <input
                value={form.image_url}
                onChange={(event) => setForm({ ...form, image_url: event.target.value })}
                className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-primary focus:ring-4 focus:ring-orange-100"
              />
            </label>

            <button className="primary-button">
              <Plus size={18} />
              Ajouter au menu
            </button>
          </div>
        </form>

        <div className="card p-5">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-bold text-slate-500">Orders list</p>
              <h2 className="text-xl font-black text-navy">Commandes récentes</h2>
            </div>
            <p className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-bold text-slate-600">{orders.length} commandes</p>
          </div>

          {orders.length > 0 ? (
            <div className="mt-5 space-y-3">
              {orders.slice(0, 8).map((order) => (
                <div key={order.id} className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1fr_auto] md:items-center">
                  <div className="min-w-0">
                    <p className="truncate font-black text-navy">
                      #{order.id} · {order.meal?.name} x{order.quantity}
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-500">
                      {order.student_name} · {order.student_department} · pickup {order.pickup_time}
                    </p>
                  </div>
                  <select
                    value={order.status}
                    onChange={(event) => onStatusChange(order.id, event.target.value)}
                    className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold outline-none focus:border-primary"
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-5">
              <EmptyState
                icon={ClipboardList}
                title="Aucune commande disponible"
                message="Les nouvelles précommandes étudiantes apparaîtront ici dès leur confirmation."
                compact
              />
            </div>
          )}
        </div>
      </div>

      <div className="card p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-bold text-slate-500">Manage meals</p>
            <h2 className="text-xl font-black text-navy">Menu disponible</h2>
          </div>
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-black text-fresh">
            {meals.filter((meal) => meal.is_available).length} actifs
          </p>
        </div>
        {meals.length > 0 ? (
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {meals.map((meal) => (
              <div key={meal.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <img className="h-14 w-14 rounded-lg object-cover" src={meal.image_url} alt={meal.name} />
                  <div className="min-w-0">
                    <p className="truncate font-black text-navy">{meal.name}</p>
                    <p className="text-sm font-bold text-slate-500">{meal.price} MAD · {meal.preparation_time} min</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5">
            <EmptyState
              icon={Utensils}
              title="Aucun plat au menu"
              message="Ajoutez un premier plat pour commencer à recevoir des précommandes."
              compact
            />
          </div>
        )}
      </div>

      <ChartsSection stats={stats} />
    </section>
  );
}
