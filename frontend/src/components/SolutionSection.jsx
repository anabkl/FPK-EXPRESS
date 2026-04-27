import { motion } from "framer-motion";
import { BadgeCheck, BellRing, ScanLine } from "lucide-react";
import { cardReveal, sectionReveal, staggerContainer, subtleLift } from "../utils/motion.js";

const solutions = [
  {
    title: "Précommande mobile",
    text: "L'étudiant choisit son plat, l'heure de pickup et confirme avant la pause.",
    icon: ScanLine,
  },
  {
    title: "Production anticipée",
    text: "Le vendeur voit les commandes en temps réel et prépare selon le flux prévu.",
    icon: BellRing,
  },
  {
    title: "Pickup sans friction",
    text: "Le statut Ready indique quand récupérer le repas, sans file longue.",
    icon: BadgeCheck,
  },
];

export default function SolutionSection() {
  return (
    <section className="bg-softOrange py-16">
      <div className="section-shell grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <motion.div
          variants={sectionReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
        >
          <p className="text-sm font-black uppercase tracking-[0.18em] text-primary">Solution</p>
          <h2 className="mt-3 text-3xl font-black tracking-normal text-navy sm:text-4xl">
            Une cantine plus prévisible, pensée pour le rythme FPK.
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-700">
            FPK-EXPRESS transforme les pauses en créneaux organisés: moins d'attente, plus de choix, et une
            meilleure visibilité pour les vendeurs.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid gap-4 md:grid-cols-3"
        >
          {solutions.map((solution) => {
            const Icon = solution.icon;
            return (
              <motion.div
                key={solution.title}
                variants={cardReveal}
                whileHover={subtleLift}
                className="rounded-lg bg-white p-5 shadow-soft"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50 text-fresh">
                  <Icon size={24} />
                </div>
                <h3 className="text-lg font-black text-navy">{solution.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{solution.text}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
