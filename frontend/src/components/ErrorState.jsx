import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function ErrorState({
  title = "Une erreur est survenue",
  message,
  actionLabel = "Réessayer",
  onAction,
  compact = false,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={`rounded-lg border border-orange-200 bg-softOrange text-navy shadow-sm ${compact ? "p-4" : "p-6"}`}
      role="status"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white text-primary shadow-sm">
            <AlertTriangle size={22} />
          </div>
          <div>
            <h3 className="font-black text-navy">{title}</h3>
            {message && <p className="mt-1 text-sm font-medium leading-6 text-slate-600">{message}</p>}
          </div>
        </div>

        {onAction && (
          <button onClick={onAction} className="secondary-button shrink-0 px-3 py-2 text-sm">
            <RefreshCw size={16} />
            {actionLabel}
          </button>
        )}
      </div>
    </motion.div>
  );
}
