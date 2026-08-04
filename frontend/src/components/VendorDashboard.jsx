import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  ClipboardList,
  Clock,
  DollarSign,
  Flame,
  ListOrdered,
  Pencil,
  Plus,
  Power,
  Store,
  Trash2,
  Utensils,
  X,
} from "lucide-react";
import ChartsSection from "./ChartsSection.jsx";
import ConfirmModal from "./ConfirmModal.jsx";
import EmptyState from "./EmptyState.jsx";
import { DashboardSkeleton } from "./Skeletons.jsx";
import { categories } from "../data/mockData.js";
import { cardReveal, sectionReveal, staggerContainer, subtleLift } from "../utils/motion.js";
import { hasValidationErrors, normalizeMealPayload, validateMealForm } from "../utils/validation.js";
import { orderStatusLabel, paymentStatusLabel } from "../utils/labels.js";

const defaultMeal = {
  name: "",
  category: "Sandwichs",
  price: 20,
  description: "",
  image_url: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80",
  preparation_time: 8,
  is_available: true,
  popularity_score: 70,
  stock_quantity: 30,
};

const orderFilters = ["Tous", "Pending", "Preparing", "Ready", "Collected", "Cancelled"];
const nextStatus = { Pending: "Preparing", Preparing: "Ready", Ready: "Collected" };
const nextStatusAction = { Pending: "Commencer", Preparing: "Marquer prête", Ready: "Confirmer le retrait" };

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
  return message ? <p className="mt-1 text-xs font-bold text-red-600">{message}</p> : null;
}

export default function VendorDashboard({
  user,
  profile,
  meals,
  orders,
  stats,
  onSaveMeal,
  onDeleteMeal,
  onToggleMeal,
  onStatusChange,
  onMarkPaid,
  onTogglePartner,
  onToast,
  isLoading = false,
}) {
  const [form, setForm] = useState(defaultMeal);
  const [errors, setErrors] = useState({});
  const [editingMeal, setEditingMeal] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [orderFilter, setOrderFilter] = useState("Tous");
  const [confirmation, setConfirmation] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const filteredOrders = useMemo(
    () => orders.filter((order) => orderFilter === "Tous" || order.status === orderFilter),
    [orders, orderFilter],
  );

  async function handleSubmit(event) {
    event.preventDefault();
    const categoryValues = categories.filter((item) => item.value !== "Tous").map((item) => item.value);
    const nextErrors = validateMealForm(form, categoryValues);
    if (hasValidationErrors(nextErrors)) {
      setErrors(nextErrors);
      onToast?.({ type: "error", title: "Plat non valide", message: Object.values(nextErrors)[0] });
      return;
    }

    setErrors({});
    setIsSaving(true);
    try {
      await onSaveMeal(normalizeMealPayload(form), editingMeal?.id);
      setForm(defaultMeal);
      setEditingMeal(null);
    } catch {
      // Preserve the form so the vendor can correct or retry the request.
    } finally {
      setIsSaving(false);
    }
  }

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const { [field]: _removed, ...rest } = current;
      return rest;
    });
  }

  function startEditing(meal) {
    setEditingMeal(meal);
    setForm({
      name: meal.name,
      category: meal.category,
      price: meal.price,
      description: meal.description,
      image_url: meal.image_url,
      preparation_time: meal.preparation_time,
      is_available: meal.is_available,
      popularity_score: meal.popularity_score,
      stock_quantity: meal.stock_quantity,
    });
    setErrors({});
  }

  function stopEditing() {
    setEditingMeal(null);
    setForm(defaultMeal);
    setErrors({});
  }

  async function runConfirmation() {
    setIsConfirming(true);
    try {
      if (confirmation.type === "order") await onStatusChange(confirmation.item.id, "Cancelled");
      if (confirmation.type === "meal") await onDeleteMeal(confirmation.item.id);
      setConfirmation(null);
    } catch {
      // Keep the confirmation visible when the API rejects the action.
    } finally {
      setIsConfirming(false);
    }
  }

  const cards = [
    { label: "Commandes aujourd'hui", value: stats.total_orders, icon: ListOrdered, tone: "bg-softOrange text-primary" },
    { label: "Valeur des commandes", value: `${stats.estimated_order_value} MAD`, icon: DollarSign, tone: "bg-emerald-50 text-fresh" },
    { label: "Attente moyenne", value: `${stats.average_waiting_time} min`, icon: Clock, tone: "bg-sky-50 text-sky-600" },
    { label: "Plat le plus commandé", value: stats.popular_meal, icon: Flame, tone: "bg-slate-100 text-navy" },
  ];

  if (isLoading) return <DashboardSkeleton variant="vendor" />;

  return (
    <section className="space-y-8">
      <motion.div variants={sectionReveal} initial="hidden" animate="visible" className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-primary">Espace vendeur</p>
          <h1 className="mt-2 text-3xl font-black tracking-normal text-navy">Tableau de bord partenaire.</h1>
          <p className="mt-2 max-w-2xl text-base leading-7 text-slate-600">
            Gérez les plats, préparez les commandes et organisez les retraits.
          </p>
        </div>
        <button
          onClick={() => onTogglePartner(!profile?.partner?.is_open)}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-black text-white ${profile?.partner?.is_open ? "bg-fresh" : "bg-navy"}`}
        >
          <Store size={18} />
          {profile?.partner?.name || user?.full_name} · {profile?.partner?.is_open ? "Ouvert" : "Fermé"}
        </button>
      </motion.div>

      <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <motion.div key={card.label} variants={cardReveal} whileHover={subtleLift} className="card p-5 transition-shadow hover:shadow-glow">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-slate-500">{card.label}</p>
                  <p className="mt-2 text-2xl font-black text-navy">{card.value}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${card.tone}`}><Icon size={24} /></div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
        <motion.form onSubmit={handleSubmit} variants={cardReveal} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-softOrange text-primary">
              {editingMeal ? <Pencil size={22} /> : <Plus size={22} />}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500">Gestion du menu</p>
              <h2 className="text-xl font-black text-navy">{editingMeal ? "Modifier le plat" : "Ajouter un plat"}</h2>
            </div>
            {editingMeal && <button type="button" onClick={stopEditing} className="icon-button ml-auto" aria-label="Annuler la modification"><X size={18} /></button>}
          </div>

          <div className="mt-5 grid gap-4">
            <label className="block">
              <span className="text-sm font-bold text-slate-700">Nom</span>
              <input value={form.name} onChange={(event) => updateForm("name", event.target.value)} className={fieldClass(errors.name)} placeholder="Ex: Wrap Poulet" required />
              <FieldError message={errors.name} />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-bold text-slate-700">Catégorie</span>
                <select value={form.category} onChange={(event) => updateForm("category", event.target.value)} className={fieldClass(errors.category)}>
                  {categories.filter((item) => item.value !== "Tous").map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
                <FieldError message={errors.category} />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-slate-700">Prix MAD</span>
                <input type="number" min="1" max="100" value={form.price} onChange={(event) => updateForm("price", event.target.value)} className={fieldClass(errors.price)} />
                <FieldError message={errors.price} />
              </label>
            </div>
            <label className="block">
              <span className="text-sm font-bold text-slate-700">Description</span>
              <textarea value={form.description} onChange={(event) => updateForm("description", event.target.value)} className={textAreaClass(errors.description)} placeholder="Ingrédients, format, bénéfice étudiant..." required />
              <FieldError message={errors.description} />
            </label>
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block">
                <span className="text-sm font-bold text-slate-700">Préparation min</span>
                <input type="number" min="1" max="60" value={form.preparation_time} onChange={(event) => updateForm("preparation_time", event.target.value)} className={fieldClass(errors.preparation_time)} />
                <FieldError message={errors.preparation_time} />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-slate-700">Popularité</span>
                <input type="number" min="0" max="100" value={form.popularity_score} onChange={(event) => updateForm("popularity_score", event.target.value)} className={fieldClass(errors.popularity_score)} />
                <FieldError message={errors.popularity_score} />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-slate-700">Stock</span>
                <input type="number" min="0" max="1000" value={form.stock_quantity} onChange={(event) => updateForm("stock_quantity", event.target.value)} className={fieldClass(errors.stock_quantity)} />
                <FieldError message={errors.stock_quantity} />
              </label>
            </div>
            <label className="block">
              <span className="text-sm font-bold text-slate-700">Image URL</span>
              <input value={form.image_url} onChange={(event) => updateForm("image_url", event.target.value)} className={fieldClass(errors.image_url)} />
              <FieldError message={errors.image_url} />
            </label>
            <button disabled={isSaving} className="primary-button">
              {editingMeal ? <Pencil size={18} /> : <Plus size={18} />}
              {isSaving ? "Enregistrement..." : editingMeal ? "Enregistrer les modifications" : "Ajouter au menu"}
            </button>
          </div>
        </motion.form>

        <motion.div variants={cardReveal} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="card p-5">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-bold text-slate-500">Commandes reçues</p>
              <h2 className="text-xl font-black text-navy">Retraits à préparer</h2>
            </div>
            <p className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-bold text-slate-600">{orders.length} commandes</p>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {orderFilters.map((filter) => (
              <button key={filter} onClick={() => setOrderFilter(filter)} className={`shrink-0 rounded-lg px-3 py-2 text-xs font-black transition ${orderFilter === filter ? "bg-navy text-white" : "bg-slate-100 text-slate-600"}`}>
                {filter === "Tous" ? filter : orderStatusLabel(filter)}
              </button>
            ))}
          </div>

          {filteredOrders.length > 0 ? (
            <div className="mt-5 space-y-3">
              {filteredOrders.slice(0, 12).map((order, index) => (
                <motion.div key={order.id} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ delay: index * 0.035, duration: 0.28 }} className="rounded-lg border border-slate-200 bg-slate-50 p-4 transition-colors hover:border-orange-200">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div className="min-w-0">
                      <p className="truncate font-black text-navy">{order.order_reference} · {order.meal?.name} x{order.quantity}</p>
                      <p className="mt-1 text-sm font-medium text-slate-500">{order.student_name?.split(" ")[0]} · retrait {order.pickup_time} · {order.total_price} MAD</p>
                      <p className="mt-2 text-xs font-bold text-slate-600">{orderStatusLabel(order.status)} · {paymentStatusLabel(order.payment_status)}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {nextStatus[order.status] && (
                        <button onClick={() => onStatusChange(order.id, nextStatus[order.status])} className="primary-button py-2 text-xs">
                          <CheckCircle2 size={15} /> {nextStatusAction[order.status]}
                        </button>
                      )}
                      {order.status === "Collected" && order.payment_status === "PayOnPickup" && (
                        <button onClick={() => onMarkPaid(order.id)} className="secondary-button py-2 text-xs">Marquer comme payé au retrait</button>
                      )}
                      {["Pending", "Preparing", "Ready"].includes(order.status) && (
                        <button onClick={() => setConfirmation({ type: "order", item: order })} className="icon-button text-red-600" aria-label={`Annuler ${order.order_reference}`}><X size={17} /></button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="mt-5"><EmptyState icon={ClipboardList} title="Aucune commande disponible" message="Les précommandes correspondant à ce filtre apparaîtront ici." compact /></div>
          )}
        </motion.div>
      </div>

      <motion.div variants={cardReveal} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.18 }} className="card p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-bold text-slate-500">Gestion des plats</p>
            <h2 className="text-xl font-black text-navy">Menu du snack</h2>
          </div>
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-black text-fresh">{meals.filter((meal) => meal.is_available).length} actifs</p>
        </div>
        {meals.length > 0 ? (
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {meals.map((meal) => (
              <motion.div key={meal.id} variants={cardReveal} whileHover={subtleLift} className="rounded-lg border border-slate-200 bg-slate-50 p-4 transition-colors hover:border-orange-200">
                <div className="flex items-center gap-3">
                  <img className="h-14 w-14 rounded-lg object-cover" src={meal.image_url} alt={meal.name} />
                  <div className="min-w-0">
                    <p className="truncate font-black text-navy">{meal.name}</p>
                    <p className="text-sm font-bold text-slate-500">{meal.price} MAD · stock {meal.stock_quantity}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className={`text-xs font-black ${meal.is_available ? "text-fresh" : "text-red-600"}`}>{meal.is_available ? "Disponible" : "Indisponible"}</span>
                  <div className="flex gap-1">
                    <button onClick={() => startEditing(meal)} className="icon-button" aria-label={`Modifier ${meal.name}`} title="Modifier"><Pencil size={16} /></button>
                    <button onClick={() => onToggleMeal(meal)} className="icon-button" aria-label={`Changer la disponibilité de ${meal.name}`} title="Disponibilité"><Power size={16} /></button>
                    <button onClick={() => setConfirmation({ type: "meal", item: meal })} className="icon-button text-red-600" aria-label={`Supprimer ${meal.name}`} title="Supprimer"><Trash2 size={16} /></button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="mt-5"><EmptyState icon={Utensils} title="Aucun plat au menu" message="Ajoutez un premier plat pour commencer à recevoir des précommandes." compact /></div>
        )}
      </motion.div>

      <ChartsSection stats={stats} />

      {confirmation && (
        <ConfirmModal
          title={confirmation.type === "order" ? "Annuler cette commande ?" : "Supprimer ce plat ?"}
          message={confirmation.type === "order" ? `La commande ${confirmation.item.order_reference} sera annulée et son stock restauré.` : `Le plat ${confirmation.item.name} sera supprimé uniquement s'il ne possède aucune commande.`}
          confirmLabel={confirmation.type === "order" ? "Confirmer l'annulation" : "Confirmer la suppression"}
          onConfirm={runConfirmation}
          onClose={() => setConfirmation(null)}
          isSubmitting={isConfirming}
        />
      )}
    </section>
  );
}
