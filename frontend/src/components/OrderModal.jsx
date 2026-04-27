import { useMemo, useState } from "react";
import { CheckCircle2, Clock, Minus, Plus, ReceiptText, X } from "lucide-react";
import {
  DEPARTMENTS,
  hasValidationErrors,
  normalizeOrderPayload,
  validateStudentOrder,
} from "../utils/validation.js";

function getDefaultPickupTime() {
  const date = new Date();
  date.setMinutes(date.getMinutes() + 20);
  const roundedMinutes = Math.ceil(date.getMinutes() / 5) * 5;
  if (roundedMinutes === 60) {
    date.setHours(date.getHours() + 1);
    date.setMinutes(0);
  } else {
    date.setMinutes(roundedMinutes);
  }
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function fieldClass(hasError) {
  return `mt-2 h-11 w-full rounded-lg border px-3 outline-none transition focus:ring-4 ${
    hasError
      ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100"
      : "border-slate-200 bg-white focus:border-primary focus:ring-orange-100"
  }`;
}

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-xs font-bold text-red-600">{message}</p>;
}

export default function OrderModal({ meal, orders, onClose, onSubmit, onToast }) {
  const [studentName, setStudentName] = useState("Étudiant FPK");
  const [department, setDepartment] = useState("GI");
  const [pickupTime, setPickupTime] = useState(getDefaultPickupTime());
  const [quantity, setQuantity] = useState(1);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const estimatedWait = useMemo(() => {
    const activeOrders = orders.filter((order) => ["Pending", "Preparing"].includes(order.status)).length;
    return Math.min(meal.preparation_time + activeOrders * 3 + (quantity - 1) * 2, 45);
  }, [orders, meal.preparation_time, quantity]);

  const total = Number((meal.price * quantity + 1).toFixed(2));

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateStudentOrder({ studentName, department, pickupTime, quantity });

    if (hasValidationErrors(nextErrors)) {
      setErrors(nextErrors);
      onToast?.({
        type: "error",
        title: "Vérifiez la commande",
        message: Object.values(nextErrors)[0],
      });
      return;
    }

    setErrors({});
    try {
      setIsSubmitting(true);
      const order = await onSubmit(normalizeOrderPayload({
        studentName,
        department,
        mealId: meal.id,
        quantity,
        pickupTime,
      }));
      setCreatedOrder(order);
    } catch {
      onToast?.({
        type: "error",
        title: "Commande non envoyée",
        message: "Une erreur est survenue pendant la confirmation.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function updateField(field, value) {
    setErrors((current) => {
      if (!current[field]) return current;
      const { [field]: _removed, ...rest } = current;
      return rest;
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-soft">
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.14em] text-primary">Précommande</p>
            <h2 className="text-2xl font-black text-navy">{meal.name}</h2>
          </div>
          <button onClick={onClose} className="icon-button" aria-label="Fermer">
            <X size={20} />
          </button>
        </div>

        {createdOrder ? (
          <div className="p-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-lg bg-emerald-50 text-fresh">
              <CheckCircle2 size={34} />
            </div>
            <h3 className="mt-5 text-2xl font-black text-navy">Commande confirmée</h3>
            <p className="mt-2 text-slate-600">
              Pickup à {createdOrder.pickup_time} · Statut initial: {createdOrder.status}
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-sm font-bold text-slate-500">Total</p>
                <p className="mt-1 text-xl font-black text-navy">{createdOrder.total_price} MAD</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-sm font-bold text-slate-500">Attente estimée</p>
                <p className="mt-1 text-xl font-black text-navy">{createdOrder.estimated_waiting_time} min</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-sm font-bold text-slate-500">Commande</p>
                <p className="mt-1 text-xl font-black text-navy">#{createdOrder.id}</p>
              </div>
            </div>
            <button onClick={onClose} className="primary-button mt-6">
              Voir mon dashboard
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-5 p-5 md:grid-cols-[0.8fr_1.2fr]">
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
              <img className="h-52 w-full object-cover" src={meal.image_url} alt={meal.name} />
              <div className="p-4">
                <p className="text-sm font-bold text-primary">{meal.category}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{meal.description}</p>
                <div className="mt-4 flex items-center gap-2 rounded-lg bg-white p-3 text-sm font-bold text-slate-700">
                  <Clock size={18} className="text-primary" />
                  Attente estimée: {estimatedWait} min
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-bold text-slate-700">Nom étudiant</span>
                <input
                  value={studentName}
                  onChange={(event) => {
                    setStudentName(event.target.value);
                    updateField("studentName");
                  }}
                  className={fieldClass(errors.studentName)}
                  aria-invalid={Boolean(errors.studentName)}
                  required
                />
                <FieldError message={errors.studentName} />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-slate-700">Département</span>
                <select
                  value={department}
                  onChange={(event) => {
                    setDepartment(event.target.value);
                    updateField("department");
                  }}
                  className={fieldClass(errors.department)}
                  aria-invalid={Boolean(errors.department)}
                >
                  {DEPARTMENTS.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
                <FieldError message={errors.department} />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-slate-700">Heure de pickup</span>
                <input
                  type="time"
                  value={pickupTime}
                  onChange={(event) => {
                    setPickupTime(event.target.value);
                    updateField("pickupTime");
                  }}
                  className={fieldClass(errors.pickupTime)}
                  aria-invalid={Boolean(errors.pickupTime)}
                  required
                />
                <FieldError message={errors.pickupTime} />
              </label>

              <div>
                <span className="text-sm font-bold text-slate-700">Quantité</span>
                <div className="mt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setQuantity((value) => Math.max(1, value - 1));
                      updateField("quantity");
                    }}
                    className="icon-button"
                    aria-label="Diminuer la quantité"
                  >
                    <Minus size={18} />
                  </button>
                  <span className="flex h-10 min-w-12 items-center justify-center rounded-lg border border-slate-200 bg-white text-lg font-black">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setQuantity((value) => Math.min(10, value + 1));
                      updateField("quantity");
                    }}
                    className="icon-button"
                    aria-label="Augmenter la quantité"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                <FieldError message={errors.quantity} />
              </div>

              <div className="rounded-lg bg-softOrange p-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="inline-flex items-center gap-2 font-bold text-slate-700">
                    <ReceiptText size={18} />
                    Total avec service
                  </span>
                  <span className="text-2xl font-black text-primary">{total} MAD</span>
                </div>
                <p className="mt-2 text-sm font-medium text-slate-600">Inclut 1 MAD de frais de service V1.</p>
              </div>

              <button disabled={isSubmitting} className="primary-button w-full">
                {isSubmitting ? "Confirmation..." : "Confirmer la précommande"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
