import { motion } from "framer-motion";
import { CheckCircle2, Clock, Users, UtensilsCrossed } from "lucide-react";

const stats = [
  { label: "23 étudiants sondés", value: "23", icon: Users },
  { label: "81% attendent plus de 15 min", value: "81%", icon: Clock },
  { label: "95% sautent ou mal mangent parfois", value: "95%", icon: UtensilsCrossed },
  { label: "100% intéressés par la précommande", value: "100%", icon: CheckCircle2 },
];

export default function StatsSection() {
  return (
    <section className="section-shell py-12">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: index * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -5, scale: 1.01 }}
              className="card p-5 transition-shadow hover:shadow-glow"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-3xl font-black text-navy">{stat.value}</p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{stat.label}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-softOrange text-primary shadow-sm">
                  <Icon size={24} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
