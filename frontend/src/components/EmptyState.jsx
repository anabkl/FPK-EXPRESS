import { motion } from "framer-motion";
import { Inbox } from "lucide-react";

export default function EmptyState({
  icon: Icon = Inbox,
  title = "Aucun résultat",
  message = "Les données apparaîtront ici dès qu'elles seront disponibles.",
  actionLabel,
  onAction,
  compact = false,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
      className={`rounded-lg border border-dashed border-slate-300 bg-white text-center ${compact ? "p-5" : "p-8"}`}
    >
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        <Icon size={24} />
      </div>
      <h3 className="mt-4 font-black text-navy">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-slate-500">{message}</p>
      {onAction && actionLabel && (
        <button onClick={onAction} className="secondary-button mt-5 px-3 py-2 text-sm">
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
}
