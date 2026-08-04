import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, ClipboardList, PackageCheck, ReceiptText, Sparkles, Store, TimerReset, WalletCards } from "lucide-react";
import ConfirmModal from "./ConfirmModal.jsx";
import EmptyState from "./EmptyState.jsx";
import { DashboardSkeleton } from "./Skeletons.jsx";
import { cardReveal, subtleLift } from "../utils/motion.js";
import { orderStatusLabel, paymentStatusLabel } from "../utils/labels.js";

const statusSteps = ["Pending", "Preparing", "Ready", "Collected"];

function statusIndex(status) {
  return statusSteps.indexOf(status);
}

export default function StudentDashboard({ user, orders, currentOrder, recommendations, onSelectMeal, onCancelOrder, isLoading = false }) {
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const currentStep = statusIndex(currentOrder?.status || "Pending");

  if (isLoading) return <DashboardSkeleton variant="student" />;

  async function confirmCancellation() {
    setIsCancelling(true);
    try {
      await onCancelOrder(orderToCancel.id);
      setOrderToCancel(null);
    } catch {
      // The parent keeps the modal open and displays the API error toast.
    } finally {
      setIsCancelling(false);
    }
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
      <motion.div variants={cardReveal} initial="hidden" animate="visible" whileHover={subtleLift} className="card p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-primary">Espace étudiant</p>
            <h1 className="mt-2 text-3xl font-black tracking-normal text-navy">Bonjour {user?.full_name?.split(" ")[0]}.</h1>
            <p className="mt-2 max-w-2xl text-base leading-7 text-slate-600">
              Suivez votre commande et préparez votre retrait chez le snack partenaire.
            </p>
          </div>
          <div className="rounded-lg bg-emerald-50 px-4 py-3 text-fresh">
            <div className="flex items-center gap-2">
              <TimerReset size={20} />
              <span className="text-xl font-black">{orders.length}</span>
            </div>
            <p className="mt-1 text-xs font-bold">commandes au total</p>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
          {currentOrder ? (
            <>
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <p className="text-sm font-bold text-slate-500">Commande active · {currentOrder.order_reference}</p>
                  <h2 className="mt-1 text-2xl font-black text-navy">{currentOrder.meal?.name}</h2>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    Retrait {currentOrder.pickup_time} · {currentOrder.total_price} MAD
                  </p>
                  <p className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-slate-600">
                    <Store size={15} /> {currentOrder.snack_partner?.name} · {currentOrder.snack_partner?.address}
                  </p>
                </div>
                <div className="rounded-lg bg-white px-4 py-3 text-sm font-black text-primary shadow-sm">
                  {currentOrder.estimated_waiting_time} min estimées
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-white p-3 text-sm">
                <span className="font-bold text-slate-600">Paiement au retrait</span>
                <span className="font-black text-primary">{paymentStatusLabel(currentOrder.payment_status)}</span>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-4">
                {statusSteps.map((step, index) => {
                  const isDone = index <= currentStep;
                  return (
                    <motion.div
                      key={step}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04, duration: 0.25 }}
                      className={`rounded-lg p-3 ${isDone ? "bg-primary text-white" : "bg-white text-slate-500"}`}
                    >
                      <div className="flex items-center gap-2">
                        {step === "Ready" || step === "Collected" ? <PackageCheck size={18} /> : <Clock size={18} />}
                        <span className="text-sm font-black">{orderStatusLabel(step)}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {currentOrder.status === "Pending" && (
                <button onClick={() => setOrderToCancel(currentOrder)} className="secondary-button mt-4 text-red-600">
                  Annuler la commande
                </button>
              )}
            </>
          ) : (
            <EmptyState
              icon={ClipboardList}
              title="Aucune commande active"
              message="Votre prochaine précommande apparaîtra ici avec son statut de préparation."
              compact
            />
          )}
        </div>
      </motion.div>

      <motion.div variants={cardReveal} initial="hidden" animate="visible" whileHover={subtleLift} className="card p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-softOrange text-primary">
            <Sparkles size={22} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500">Suggestions intelligentes</p>
            <h2 className="text-xl font-black text-navy">Pour votre prochaine pause</h2>
          </div>
        </div>

        {recommendations.length > 0 ? (
          <div className="mt-5 space-y-3">
            {recommendations.slice(0, 3).map(({ meal, reason }) => (
              <motion.button
                key={meal.id}
                onClick={() => onSelectMeal(meal)}
                whileHover={{ x: 3 }}
                className="flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 text-left transition hover:border-primary"
              >
                <img className="h-14 w-14 rounded-lg object-cover" src={meal.image_url} alt={meal.name} />
                <span className="min-w-0">
                  <span className="block truncate font-black text-navy">{meal.name}</span>
                  <span className="mt-1 line-clamp-1 block text-xs font-medium text-slate-500">{reason}</span>
                </span>
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="mt-5">
            <EmptyState
              icon={Sparkles}
              title="Aucune suggestion disponible"
              message="Les suggestions apparaîtront dès que les données du menu seront disponibles."
              compact
            />
          </div>
        )}
      </motion.div>

      <motion.div variants={cardReveal} initial="hidden" animate="visible" className="card p-5 lg:col-span-2">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-navy">
            <ReceiptText size={22} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500">Mes commandes</p>
            <h2 className="text-xl font-black text-navy">Historique des retraits</h2>
          </div>
        </div>
        {orders.length ? (
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {orders.map((order) => (
              <div key={order.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-navy">{order.order_reference} · {order.meal?.name}</p>
                    <p className="mt-1 text-sm font-medium text-slate-500">{order.snack_partner?.name} · retrait {order.pickup_time}</p>
                  </div>
                  <span className="rounded-lg bg-white px-3 py-2 text-xs font-black text-primary">{orderStatusLabel(order.status)}</span>
                </div>
                <p className="mt-3 text-sm font-bold text-slate-600">Paiement au retrait · {paymentStatusLabel(order.payment_status)}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5">
            <EmptyState icon={ClipboardList} title="Aucune commande" message="Précommandez un repas pour créer votre premier historique." compact />
          </div>
        )}
      </motion.div>

      <motion.div variants={cardReveal} initial="hidden" animate="visible" className="card p-5 lg:col-span-2">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-softOrange text-primary">
            <WalletCards size={22} />
          </div>
          <div>
            <h2 className="text-xl font-black text-navy">FPK Wallet — Bientôt disponible</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Une évolution future pourra intégrer une solution de paiement mobile agréée, après validation du modèle, formalisation juridique et partenariat officiel avec un prestataire autorisé.
            </p>
          </div>
        </div>
      </motion.div>

      {orderToCancel && (
        <ConfirmModal
          title="Annuler cette commande ?"
          message={`La commande ${orderToCancel.order_reference} sera annulée. Cette action est disponible uniquement tant qu'elle est en attente.`}
          confirmLabel="Confirmer l'annulation"
          onConfirm={confirmCancellation}
          onClose={() => setOrderToCancel(null)}
          isSubmitting={isCancelling}
        />
      )}
    </section>
  );
}
