import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ChefHat, GraduationCap, ShieldCheck, Store } from "lucide-react";
import { cardReveal, sectionReveal, staggerContainer, subtleLift } from "../utils/motion.js";

const roles = [
  {
    key: "student",
    label: "Student",
    title: "Espace étudiant",
    description: "Commander, suivre votre pickup et voir les recommandations rapides pour la pause.",
    icon: GraduationCap,
    badge: "Précommande",
  },
  {
    key: "vendor",
    label: "Vendor",
    title: "Espace vendeur",
    description: "Gérer le menu, préparer les commandes et suivre les indicateurs de service.",
    icon: Store,
    badge: "Dashboard",
  },
];

export default function LoginPage({ preferredRole = "student", onLogin, onNavigate }) {
  const [selectedRole, setSelectedRole] = useState(preferredRole);

  useEffect(() => {
    setSelectedRole(preferredRole);
  }, [preferredRole]);

  const selectedRoleConfig = roles.find((role) => role.key === selectedRole) || roles[0];

  function handleSubmit(event) {
    event.preventDefault();
    onLogin(selectedRole);
  }

  return (
    <main className="section-shell py-10 sm:py-14">
      <motion.section
        variants={sectionReveal}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-5xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft"
      >
        <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative overflow-hidden bg-navy p-6 text-white sm:p-8">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,122,0,0.28),rgba(22,163,74,0.14)_48%,rgba(15,23,42,0))]" />
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-white shadow-glow">
                <ChefHat size={26} />
              </div>
              <p className="mt-8 text-sm font-black uppercase tracking-[0.18em] text-orange-200">FPK-EXPRESS Login</p>
              <h1 className="mt-3 text-3xl font-black tracking-normal sm:text-4xl">
                Choisissez votre espace de démonstration.
              </h1>
              <p className="mt-4 text-base leading-7 text-slate-300">
                Une connexion simple pour la V1: aucun mot de passe, aucun JWT. Le rôle est sauvegardé localement pour
                garder le flow rapide pendant la présentation.
              </p>

              <div className="mt-8 rounded-lg border border-white/10 bg-white/10 p-4 backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-orange-200">
                    <ShieldCheck size={21} />
                  </div>
                  <div>
                    <p className="font-black">Mode démo sécurisé</p>
                    <p className="mt-1 text-sm text-slate-300">Session locale uniquement, sans données sensibles.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-primary">Sélection du rôle</p>
              <h2 className="mt-2 text-2xl font-black text-navy">Continuer comme {selectedRoleConfig.label}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Vous pourrez vous déconnecter depuis la navbar et changer de rôle à tout moment.
              </p>
            </div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="mt-6 grid gap-4 sm:grid-cols-2"
            >
              {roles.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.key;
                return (
                  <motion.button
                    key={role.key}
                    type="button"
                    variants={cardReveal}
                    whileHover={subtleLift}
                    onClick={() => setSelectedRole(role.key)}
                    className={`rounded-lg border p-5 text-left transition ${
                      isSelected
                        ? "border-primary bg-softOrange shadow-glow"
                        : "border-slate-200 bg-slate-50 hover:border-orange-200"
                    }`}
                    aria-pressed={isSelected}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${isSelected ? "bg-primary text-white" : "bg-white text-primary"}`}>
                        <Icon size={24} />
                      </div>
                      <span className="rounded-lg bg-white px-3 py-1.5 text-xs font-black text-primary">{role.badge}</span>
                    </div>
                    <h3 className="mt-5 text-lg font-black text-navy">{role.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{role.description}</p>
                  </motion.button>
                );
              })}
            </motion.div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button className="primary-button flex-1">
                Entrer dans l'espace {selectedRoleConfig.label}
                <ArrowRight size={18} />
              </button>
              <button type="button" onClick={() => onNavigate("landing")} className="secondary-button">
                Retour accueil
              </button>
            </div>
          </form>
        </div>
      </motion.section>
    </main>
  );
}
