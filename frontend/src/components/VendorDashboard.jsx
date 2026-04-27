import { useState } from "react";
import { motion } from "framer-motion";
import { ClipboardList, Clock, DollarSign, Flame, ListOrdered, Plus, Store, Utensils } from "lucide-react";
import ChartsSection from "./ChartsSection.jsx";
import EmptyState from "./EmptyState.jsx";
import { DashboardSkeleton } from "./Skeletons.jsx";
import { categories } from "../data/mockData.js";
import { cardReveal, sectionReveal, staggerContainer, subtleLift } from "../utils/motion.js";
import { hasValidationErrors, normalizeMealPayload, validateMealForm } from "../utils/validation.js";

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

function fieldClass(hasError) {
  return `mt-2 h-11 w-full rounded-lg border px-3 outline-none transition focus:ring-4 ${
    hasError
      ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100"
      : "border-slate-200 bg-white focus:border-primary focus:ring-orange-100"
  }`;
}

function textAreaClass(hasError) {
  return `mt-2 min-h-24 w-full rounded-lg border p-3 outline-none transition focus:ring-4 ${
    hasError
      ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100"
      : "border-slate-200 focus:border-primary focus:ring-orange-100"
  }`;
}

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-xs font-bold text-red-600">{message}</p>;
}

export default function VendorDashboard({ meals, orders, stats, onAddMeal, onStatusChange, onToast, isLoading = false }) {
  const [form, setForm] = useState(defaultMeal);
  const [errors, setErrors] = useState({});

  async function handleSubmit(event) {
    event.preventDefault();
    const categoryValues = categories.filter((item) => item.value !== "Tous").map((item) => item.value);
    const nextErrors = validateMealForm(form, categoryValues);

    if (hasValidationErrors(nextErrors)) {
      setErrors(nextErrors);
      onToast?.({
        type: "error",
        title: "Plat non valide",
        message: Object.values(nextErrors)[0],
      });
      return;
    }

    setErrors({});
    await onAddMeal(normalizeMealPayload(form));
    setForm(defaultMeal);
  }

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const { [field]: _removed, ...rest } = current;
      return rest;
    });
  }

  const cards = [
    { label: "Total orders", value: stats.total_orders, icon: ListOrdered, tone: "bg-softOrange text-primary" },
    { label: "Revenue today", value: `${stats.revenue_today} MAD`, icon: DollarSign, tone: "bg-emerald-50 text-fresh" },
    { label: "Average waiting time", value: `${stats.average_waiting_time} min`, icon: Clock, tone: "bg-sky-50 text-sky-600" },
    { label: "Popular meal", value: stats.popular_meal, icon: Flame, tone: "bg-slate-100 text-navy" },
  ];

  if (isLoading) return <DashboardSkeleton variant="vendor" />;

  return (
    <section className="space-y-8">
      <motion.div
        variants={sectionReveal}
        initial="hidden"
        animate="visible"
        className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end"
      >
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
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
      >
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              variants={cardReveal}
              whileHover={subtleLift}
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
      </motion.div>

      <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
        <motion.form
          onSubmit={handleSubmit}
          variants={cardReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="card p-5"
        >
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
                onChange={(event) => updateForm("name", event.target.value)}
                className={fieldClass(errors.name)}
                placeholder="Ex: Wrap Poulet"
                aria-invalid={Boolean(errors.name)}
                required
              />
              <FieldError message={errors.name} />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-bold text-slate-700">Catégorie</span>
                <select
                  value={form.category}
                  onChange={(event) => updateForm("category", event.target.value)}
                  className={fieldClass(errors.category)}
                  aria-invalid={Boolean(errors.category)}
                >
                  {categories.filter((item) => item.value !== "Tous").map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
                <FieldError message={errors.category} />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-slate-700">Prix MAD</span>
                <input
                  type="number"
                  min="5"
                  max="35"
                  value={form.price}
                  onChange={(event) => updateForm("price", event.target.value)}
                  className={fieldClass(errors.price)}
                  aria-invalid={Boolean(errors.price)}
                />
                <FieldError message={errors.price} />
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-bold text-slate-700">Description</span>
              <textarea
                value={form.description}
                onChange={(event) => updateForm("description", event.target.value)}
                className={textAreaClass(errors.description)}
                placeholder="Ingrédients, format, bénéfice étudiant..."
                aria-invalid={Boolean(errors.description)}
                required
              />
              <FieldError message={errors.description} />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-bold text-slate-700">Préparation min</span>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={form.preparation_time}
                  onChange={(event) => updateForm("preparation_time", event.target.value)}
                  className={fieldClass(errors.preparation_time)}
                  aria-invalid={Boolean(errors.preparation_time)}
                />
                <FieldError message={errors.preparation_time} />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-slate-700">Popularité</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={form.popularity_score}
                  onChange={(event) => updateForm("popularity_score", event.target.value)}
                  className={fieldClass(errors.popularity_score)}
                  aria-invalid={Boolean(errors.popularity_score)}
                />
                <FieldError message={errors.popularity_score} />
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-bold text-slate-700">Image URL</span>
              <input
                value={form.image_url}
                onChange={(event) => updateForm("image_url", event.target.value)}
                className={fieldClass(errors.image_url)}
                aria-invalid={Boolean(errors.image_url)}
              />
              <FieldError message={errors.image_url} />
            </label>

            <button className="primary-button">
              <Plus size={18} />
              Ajouter au menu
            </button>
          </div>
        </motion.form>

        <motion.div
          variants={cardReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="card p-5"
        >
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-bold text-slate-500">Orders list</p>
              <h2 className="text-xl font-black text-navy">Commandes récentes</h2>
            </div>
            <p className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-bold text-slate-600">{orders.length} commandes</p>
          </div>

          {orders.length > 0 ? (
            <div className="mt-5 space-y-3">
              {orders.slice(0, 8).map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ delay: index * 0.035, duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ x: 2 }}
                  className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 transition-colors hover:border-orange-200 md:grid-cols-[1fr_auto] md:items-center"
                >
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
                </motion.div>
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
        </motion.div>
      </div>

      <motion.div
        variants={cardReveal}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.18 }}
        className="card p-5"
      >
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
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4"
          >
            {meals.map((meal) => (
              <motion.div
                key={meal.id}
                variants={cardReveal}
                whileHover={subtleLift}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4 transition-colors hover:border-orange-200"
              >
                <div className="flex items-center gap-3">
                  <img className="h-14 w-14 rounded-lg object-cover" src={meal.image_url} alt={meal.name} />
                  <div className="min-w-0">
                    <p className="truncate font-black text-navy">{meal.name}</p>
                    <p className="text-sm font-bold text-slate-500">{meal.price} MAD · {meal.preparation_time} min</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
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
      </motion.div>

      <ChartsSection stats={stats} />
    </section>
  );
}
