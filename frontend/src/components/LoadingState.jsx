import { motion } from "framer-motion";
import { LoaderCircle } from "lucide-react";

export default function LoadingState({ label = "Chargement des données...", compact = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={`rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm ${compact ? "px-4 py-3" : "p-5"}`}
      role="status"
    >
      <div className="flex items-center gap-3">
        <LoaderCircle className="animate-spin text-primary" size={20} />
        <p className="text-sm font-bold">{label}</p>
      </div>
    </motion.div>
  );
}
