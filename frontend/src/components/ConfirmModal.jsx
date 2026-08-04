import { AlertTriangle, X } from "lucide-react";

export default function ConfirmModal({ title, message, confirmLabel, onConfirm, onClose, isSubmitting = false }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-navy/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-soft" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-red-50 text-red-600">
            <AlertTriangle size={22} />
          </div>
          <button onClick={onClose} className="icon-button" aria-label="Fermer la confirmation">
            <X size={19} />
          </button>
        </div>
        <h2 id="confirm-title" className="mt-4 text-xl font-black text-navy">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{message}</p>
        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="secondary-button" disabled={isSubmitting}>Retour</button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-3 text-sm font-black text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Confirmation..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
