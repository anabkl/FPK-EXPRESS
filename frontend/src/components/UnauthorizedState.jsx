import { motion } from "framer-motion";
import { Home, LogIn, ShieldAlert } from "lucide-react";
import { sectionReveal } from "../utils/motion.js";

const roleLabels = {
  student: "étudiant",
  vendor: "vendeur",
};

export default function UnauthorizedState({ currentRole, requestedRole, onGoHome, onGoDashboard, onSwitchRole }) {
  return (
    <main className="section-shell py-10 sm:py-14">
      <motion.section
        variants={sectionReveal}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-2xl rounded-lg border border-orange-200 bg-softOrange p-6 text-center shadow-soft sm:p-8"
        role="alert"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-white text-primary shadow-sm">
          <ShieldAlert size={28} />
        </div>
        <p className="mt-6 text-sm font-black uppercase tracking-[0.18em] text-primary">Accès limité</p>
        <h1 className="mt-3 text-3xl font-black tracking-normal text-navy">Cet espace n'est pas disponible pour ce rôle.</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm font-semibold leading-6 text-slate-600">
          Vous êtes connecté comme {roleLabels[currentRole] || "utilisateur"} et vous essayez d'ouvrir l'espace{" "}
          {roleLabels[requestedRole] || "protégé"}. Utilisez le compte autorisé ou revenez à votre tableau de bord.
        </p>

        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button onClick={onGoDashboard} className="primary-button">
            Retour à mon tableau de bord
          </button>
          <button onClick={onSwitchRole} className="secondary-button">
            <LogIn size={18} />
            Changer de compte
          </button>
          <button onClick={onGoHome} className="secondary-button">
            <Home size={18} />
            Accueil
          </button>
        </div>
      </motion.section>
    </main>
  );
}
