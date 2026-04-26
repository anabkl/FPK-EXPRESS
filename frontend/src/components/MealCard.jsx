import { motion } from "framer-motion";
import { Clock, Flame, ShoppingBag, Star } from "lucide-react";

export default function MealCard({ meal, onSelectMeal, compact = false }) {
  const isPopular = meal.popularity_score >= 88;

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
      className="card overflow-hidden transition-shadow hover:shadow-glow"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <img className="h-full w-full object-cover transition duration-500 hover:scale-105" src={meal.image_url} alt={meal.name} />
        {isPopular && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1.5 text-xs font-black text-white shadow-sm">
            <Flame size={14} />
            Populaire
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-primary">{meal.category}</p>
            <h3 className="mt-1 text-lg font-black leading-6 text-navy">{meal.name}</h3>
          </div>
          <p className="shrink-0 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-black text-fresh">{meal.price} MAD</p>
        </div>

        <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{meal.description}</p>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1.5 font-semibold">
            <Clock size={15} />
            {meal.preparation_time} min
          </span>
          <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1.5 font-semibold">
            <Star size={15} />
            {meal.popularity_score}%
          </span>
        </div>

        {!compact && (
          <button onClick={() => onSelectMeal(meal)} className="primary-button mt-5 w-full py-2.5">
            <ShoppingBag size={18} />
            Précommander
          </button>
        )}
      </div>
    </motion.article>
  );
}
