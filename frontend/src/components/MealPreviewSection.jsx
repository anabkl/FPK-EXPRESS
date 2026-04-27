import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import MealCard from "./MealCard.jsx";
import { sectionReveal } from "../utils/motion.js";

export default function MealPreviewSection({ meals, onSelectMeal }) {
  return (
    <section className="py-16">
      <div className="section-shell">
        <motion.div
          variants={sectionReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          className="flex flex-col justify-between gap-4 md:flex-row md:items-end"
        >
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-primary">Meal preview</p>
            <h2 className="mt-3 text-3xl font-black tracking-normal text-navy sm:text-4xl">
              Des repas réalistes pour le campus.
            </h2>
          </div>
          <button onClick={() => onSelectMeal(meals[0])} className="secondary-button">
            Tester une commande
            <ArrowRight size={18} />
          </button>
        </motion.div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {meals.map((meal) => (
            <MealCard key={meal.id} meal={meal} onSelectMeal={onSelectMeal} compact />
          ))}
        </div>
      </div>
    </section>
  );
}
