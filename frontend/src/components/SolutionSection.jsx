import { motion } from "framer-motion";
import { BadgeCheck, BellRing, ScanLine } from "lucide-react";

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
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-primary">Solution</p>
          <h2 className="mt-3 text-3xl font-black tracking-normal text-navy sm:text-4xl">
            Une cantine plus prévisible, pensée pour le rythme FPK.
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-700">
            FPK-EXPRESS transforme les pauses en créneaux organisés: moins d'attente, plus de choix, et une
            meilleure visibilité pour les vendeurs.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {solutions.map((solution, index) => {
            const Icon = solution.icon;
            return (
              <motion.div
                key={solution.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
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
        </div>
      </div>
    </section>
  );
}
