import { motion } from "framer-motion";
import { Clock, ClipboardList, PackageCheck, Sparkles, TimerReset } from "lucide-react";
import EmptyState from "./EmptyState.jsx";
import { DashboardSkeleton } from "./Skeletons.jsx";
import { statusSteps } from "../data/mockData.js";
import { cardReveal, subtleLift } from "../utils/motion.js";

function statusIndex(status) {
  return statusSteps.indexOf(status);
}

export default function StudentDashboard({ currentOrder, recommendations, onSelectMeal, isLoading = false }) {
  const currentStep = statusIndex(currentOrder?.status || "Pending");

  if (isLoading) return <DashboardSkeleton variant="student" />;

  return (
    <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
      <motion.div
        variants={cardReveal}
        initial="hidden"
        animate="visible"
        whileHover={subtleLift}
        className="card p-5"
      >
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-primary">Student dashboard</p>
            <h1 className="mt-2 text-3xl font-black tracking-normal text-navy">Votre pause, organisée.</h1>
            <p className="mt-2 max-w-2xl text-base leading-7 text-slate-600">
              Suivi en temps réel de la commande et recommandations adaptées au campus.
            </p>
          </div>
          <div className="rounded-lg bg-emerald-50 px-4 py-3 text-fresh">
            <div className="flex items-center gap-2">
              <TimerReset size={20} />
              <span className="text-xl font-black">18 min</span>
            </div>
            <p className="mt-1 text-xs font-bold">gagnées aujourd'hui</p>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
          {currentOrder ? (
            <>
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <p className="text-sm font-bold text-slate-500">Commande actuelle</p>
                  <h2 className="mt-1 text-2xl font-black text-navy">{currentOrder.meal?.name}</h2>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    Pickup {currentOrder.pickup_time} · {currentOrder.total_price} MAD
                  </p>
                </div>
                <div className="rounded-lg bg-white px-4 py-3 text-sm font-black text-primary shadow-sm">
                  {currentOrder.estimated_waiting_time} min estimées
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {statusSteps.map((step, index) => {
                  const isDone = index <= currentStep;
                  return (
                    <motion.div
                      key={step}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04, duration: 0.25 }}
                      className={`rounded-lg p-4 ${isDone ? "bg-primary text-white" : "bg-white text-slate-500"}`}
                    >
                      <div className="flex items-center gap-2">
                        {step === "Ready" ? <PackageCheck size={19} /> : <Clock size={19} />}
                        <span className="font-black">{step}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
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

      <motion.div
        variants={cardReveal}
        initial="hidden"
        animate="visible"
        whileHover={subtleLift}
        className="card p-5"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-softOrange text-primary">
            <Sparkles size={22} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500">Recommended meals</p>
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
              title="Aucune recommandation IA"
              message="Les suggestions apparaîtront dès que le menu ou l'API de recommandations sera disponible."
              compact
            />
          </div>
        )}
      </motion.div>
    </section>
  );
}
