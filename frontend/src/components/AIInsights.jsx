import { motion } from "framer-motion";
import { Activity, BrainCircuit, Clock, Sparkles, TrendingUp } from "lucide-react";
import EmptyState from "./EmptyState.jsx";
import { AIInsightsSkeleton } from "./Skeletons.jsx";
import { cardReveal, sectionReveal, staggerContainer, subtleLift } from "../utils/motion.js";

export default function AIInsights({ recommendations, peakHours, stats, isLoading = false }) {
  const summary = recommendations?.summary || {};
  const recommendationItems = recommendations?.recommendations || [];
  const predictions = peakHours?.predictions || [];
  const topPredictions = predictions.slice(0, 5);

  if (isLoading) return <AIInsightsSkeleton />;

  return (
    <section className="bg-navy py-16 text-white">
      <div className="section-shell">
        <motion.div
          variants={sectionReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          className="flex flex-col justify-between gap-5 md:flex-row md:items-end"
        >
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-orange-300">AI insights preview</p>
            <h2 className="mt-3 text-3xl font-black tracking-normal sm:text-4xl">
              Des signaux simples pour fluidifier la pause.
            </h2>
          </div>
          <p className="max-w-2xl text-base leading-7 text-slate-300">
            La V1 utilise les commandes, les scores de popularité et le rythme des pauses pour recommander les bons
            plats au bon moment.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-9 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]"
        >
          <motion.div
            variants={cardReveal}
            whileHover={subtleLift}
            className="rounded-lg border border-white/10 bg-white/10 p-5 backdrop-blur"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-white">
                <BrainCircuit size={24} />
              </div>
              <div>
                <p className="text-sm font-semibold text-orange-200">Moteur de recommandation</p>
                <h3 className="text-2xl font-black">{summary.top_recommendation || "Sandwich Poulet"}</h3>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                { label: "Commandes actives", value: summary.active_orders ?? 3, icon: Activity },
                { label: "Charge campus", value: summary.campus_load || "Normale", icon: TrendingUp },
                { label: "Attente moyenne", value: `${stats?.average_waiting_time || 9.8} min`, icon: Clock },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.label}
                    variants={cardReveal}
                    className="rounded-lg border border-white/10 bg-white/10 p-4"
                  >
                    <Icon size={20} className="text-orange-200" />
                    <p className="mt-3 text-xl font-black">{item.value}</p>
                    <p className="mt-1 text-sm text-slate-300">{item.label}</p>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-5 rounded-lg bg-white p-4 text-navy">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-1 text-primary" size={20} />
                <p className="text-sm font-semibold leading-6">{summary.insight}</p>
              </div>
            </div>

            {recommendationItems.length === 0 && (
              <div className="mt-5">
                <EmptyState
                  icon={Sparkles}
                  title="Aucune recommandation IA"
                  message="Le moteur affichera ses suggestions dès que les données de menu seront disponibles."
                  compact
                />
              </div>
            )}
          </motion.div>

          <motion.div
            variants={cardReveal}
            whileHover={subtleLift}
            className="rounded-lg border border-white/10 bg-white p-5 text-navy shadow-soft"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-slate-500">Peak hour prediction</p>
                <h3 className="text-2xl font-black">Prévoir les pics de demande</h3>
              </div>
              <Clock className="text-primary" size={26} />
            </div>

            <div className="mt-6 space-y-4">
              {topPredictions.map((point, index) => (
                <motion.div
                  key={point.hour}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.035, duration: 0.28 }}
                >
                  <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                    <span className="font-black">{point.hour}</span>
                    <span className="font-semibold text-slate-500">{point.recommendation}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-lg bg-slate-100">
                    <div
                      className={`h-full rounded-lg ${point.demand_score >= 80 ? "bg-primary" : "bg-fresh"}`}
                      style={{ width: `${point.demand_score}%` }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
