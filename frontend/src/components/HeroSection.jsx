import { motion } from "framer-motion";
import { ArrowRight, Clock, Sparkles, Utensils } from "lucide-react";

const heroContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.08,
    },
  },
};

const heroItem = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.58, ease: [0.22, 1, 0.36, 1] } },
};

export default function HeroSection({ onNavigate, meals }) {
  const heroMeal = meals[0];

  return (
    <section className="relative overflow-hidden border-b border-orange-100/80">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,122,0,0.14),rgba(22,163,74,0.08)_46%,rgba(15,23,42,0.04))]" />
      <motion.div
        variants={heroContainer}
        initial="hidden"
        animate="visible"
        className="section-shell relative grid gap-10 pb-16 pt-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pb-24 lg:pt-18"
      >
        <motion.div variants={heroItem}>
          <motion.span
            variants={heroItem}
            className="inline-flex items-center gap-2 rounded-lg border border-orange-200 bg-white/90 px-3 py-2 text-sm font-bold text-primary shadow-sm backdrop-blur"
          >
            <Sparkles size={16} />
            FPK-EXPRESS
          </motion.span>
          <motion.p variants={heroItem} className="mt-4 max-w-xl text-sm font-black uppercase text-fresh">
            AI-powered preorder & pickup platform for FPK Khouribga students.
          </motion.p>
          <motion.h1 variants={heroItem} className="mt-4 max-w-4xl text-4xl font-black leading-tight tracking-normal text-navy sm:text-5xl lg:text-6xl">
            Commandez votre repas avant la pause. Récupérez-le sans faire la queue.
          </motion.h1>
          <motion.p variants={heroItem} className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            Une solution intelligente pour les étudiants de la FPK Khouribga afin de gagner du temps, éviter le stress
            et manger mieux.
          </motion.p>

          <motion.div variants={heroItem} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button onClick={() => onNavigate("student")} className="primary-button">
              <Utensils size={20} />
              Commander maintenant
            </button>
            <button onClick={() => onNavigate("vendor")} className="secondary-button">
              Voir la démo
              <ArrowRight size={20} />
            </button>
          </motion.div>

          <motion.div variants={heroItem} className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
            {[
              ["12-20 min", "temps économisé"],
              ["1 MAD", "frais de service V1"],
              ["100%", "intérêt validé"],
            ].map(([value, label]) => (
              <motion.div
                key={label}
                whileHover={{ y: -4 }}
                className="rounded-lg border border-white/80 bg-white/90 p-4 shadow-sm backdrop-blur"
              >
                <p className="text-xl font-black text-navy">{value}</p>
                <p className="mt-1 text-sm text-slate-500">{label}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          variants={heroItem}
          whileHover={{ y: -6 }}
          className="relative"
        >
          <div className="overflow-hidden rounded-lg border border-white bg-white shadow-soft">
            <div className="relative h-72 sm:h-96">
              <img className="h-full w-full object-cover" src={heroMeal?.image_url} alt={heroMeal?.name || "Repas FPK"} />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white sm:p-7">
                <div className="mb-3 inline-flex items-center gap-2 rounded-lg bg-white/15 px-3 py-2 text-sm font-semibold backdrop-blur">
                  <Clock size={16} />
                  Prêt en {heroMeal?.preparation_time || 8} min
                </div>
                <h2 className="text-2xl font-black">{heroMeal?.name || "Sandwich Poulet"}</h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-white/80">
                  Préparé avant la pause, récupéré au comptoir sans perdre le temps entre deux cours.
                </p>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-5 right-4 w-64 rounded-lg border border-slate-200 bg-white p-4 shadow-soft sm:right-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-slate-500">Commande #EXP24</p>
                <p className="mt-1 text-xl font-black text-fresh">Ready</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50 text-fresh">
                <Utensils size={24} />
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
