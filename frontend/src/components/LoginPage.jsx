import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ChefHat, Eye, EyeOff, GraduationCap, ShieldCheck, Store } from "lucide-react";
import { cardReveal, sectionReveal, staggerContainer, subtleLift } from "../utils/motion.js";
import { sanitizeText } from "../utils/validation.js";

const roles = [
  {
    key: "student",
    label: "étudiant",
    title: "Espace étudiant",
    description: "Précommander, suivre votre retrait et retrouver votre historique.",
    icon: GraduationCap,
    badge: "Précommande",
  },
  {
    key: "vendor",
    label: "vendeur",
    title: "Espace vendeur",
    description: "Gérer le menu, préparer les commandes et suivre le service.",
    icon: Store,
    badge: "Tableau de bord",
  },
];

function fieldClass(hasError) {
  return `mt-2 h-11 w-full rounded-lg border px-3 outline-none transition focus:ring-4 ${
    hasError
      ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100"
      : "border-slate-200 bg-white focus:border-primary focus:ring-orange-100"
  }`;
}

function PasswordField({ label, value, onChange, error, autoComplete }) {
  const [visible, setVisible] = useState(false);
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <span className="relative block">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          className={`${fieldClass(error)} pr-11`}
          autoComplete={autoComplete}
          minLength={8}
          required
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="absolute right-2 top-[14px] flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-navy"
          aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </span>
      {error && <p className="mt-1 text-xs font-bold text-red-600">{error}</p>}
    </label>
  );
}

export default function LoginPage({ preferredRole = "student", onLogin, onRegister, onNavigate }) {
  const [selectedRole, setSelectedRole] = useState(preferredRole);
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirmation: "" });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    setSelectedRole(preferredRole);
    if (preferredRole === "vendor") setMode("login");
  }, [preferredRole]);

  const selectedRoleConfig = roles.find((role) => role.key === selectedRole) || roles[0];

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
    setApiError("");
  }

  function selectRole(role) {
    setSelectedRole(role);
    if (role === "vendor") setMode("login");
    setErrors({});
    setApiError("");
  }

  function validate() {
    const nextErrors = {};
    const email = sanitizeText(form.email, { maxLength: 255 }).toLowerCase();
    if (mode === "register") {
      const fullName = sanitizeText(form.fullName, { maxLength: 120 });
      if (fullName.length < 2 || !/[A-Za-zÀ-ÖØ-öø-ÿ]/.test(fullName)) {
        nextErrors.fullName = "Saisissez un nom complet valide.";
      }
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = "Saisissez une adresse e-mail valide.";
    if (form.password.length < 8) nextErrors.password = "Le mot de passe doit contenir au moins 8 caractères.";
    if (mode === "register" && form.password !== form.confirmation) {
      nextErrors.confirmation = "Les mots de passe ne correspondent pas.";
    }
    return nextErrors;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate();
    if (Object.values(nextErrors).some(Boolean)) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    setApiError("");
    try {
      if (mode === "register") {
        await onRegister({
          full_name: sanitizeText(form.fullName, { maxLength: 120 }),
          email: sanitizeText(form.email, { maxLength: 255 }).toLowerCase(),
          password: form.password,
        });
      } else {
        await onLogin({
          email: sanitizeText(form.email, { maxLength: 255 }).toLowerCase(),
          password: form.password,
        }, selectedRole);
      }
    } catch (error) {
      setApiError(error.message || "Connexion impossible pour le moment.");
    } finally {
      setIsSubmitting(false);
    }
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
              <p className="mt-8 text-sm font-black uppercase tracking-[0.18em] text-orange-200">Connexion FPK-EXPRESS</p>
              <h1 className="mt-3 text-3xl font-black tracking-normal sm:text-4xl">
                Accédez à votre espace campus.
              </h1>
              <p className="mt-4 text-base leading-7 text-slate-300">
                Une session sécurisée pour précommander auprès des snacks partenaires ou gérer les retraits.
              </p>

              <div className="mt-8 rounded-lg border border-white/10 bg-white/10 p-4 backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-orange-200">
                    <ShieldCheck size={21} />
                  </div>
                  <div>
                    <p className="font-black">Session protégée</p>
                    <p className="mt-1 text-sm text-slate-300">Mot de passe chiffré et accès limité à votre rôle.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-primary">Accès au produit</p>
              <h2 className="mt-2 text-2xl font-black text-navy">
                {mode === "register" ? "Créer un compte étudiant" : `Connexion ${selectedRoleConfig.label}`}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Les comptes vendeurs sont fournis uniquement aux snacks partenaires validés.
              </p>
            </div>

            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mt-5 grid gap-3 sm:grid-cols-2">
              {roles.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.key;
                return (
                  <motion.button
                    key={role.key}
                    type="button"
                    variants={cardReveal}
                    whileHover={subtleLift}
                    onClick={() => selectRole(role.key)}
                    className={`rounded-lg border p-4 text-left transition ${
                      isSelected ? "border-primary bg-softOrange shadow-glow" : "border-slate-200 bg-slate-50 hover:border-orange-200"
                    }`}
                    aria-pressed={isSelected}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${isSelected ? "bg-primary text-white" : "bg-white text-primary"}`}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <h3 className="font-black text-navy">{role.title}</h3>
                        <p className="mt-1 text-xs font-bold text-slate-500">{role.badge}</p>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>

            {selectedRole === "student" && (
              <div className="mt-5 flex rounded-lg bg-slate-100 p-1">
                {[
                  ["login", "Se connecter"],
                  ["register", "Créer un compte"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => { setMode(value); setErrors({}); setApiError(""); }}
                    className={`h-10 flex-1 rounded-lg text-sm font-black transition ${mode === value ? "bg-white text-primary shadow-sm" : "text-slate-500"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-5 grid gap-4">
              {mode === "register" && (
                <label className="block">
                  <span className="text-sm font-bold text-slate-700">Nom complet</span>
                  <input
                    value={form.fullName}
                    onChange={(event) => updateForm("fullName", event.target.value)}
                    className={fieldClass(errors.fullName)}
                    autoComplete="name"
                    required
                  />
                  {errors.fullName && <p className="mt-1 text-xs font-bold text-red-600">{errors.fullName}</p>}
                </label>
              )}
              <label className="block">
                <span className="text-sm font-bold text-slate-700">Adresse e-mail</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => updateForm("email", event.target.value)}
                  className={fieldClass(errors.email)}
                  autoComplete="email"
                  required
                />
                {errors.email && <p className="mt-1 text-xs font-bold text-red-600">{errors.email}</p>}
              </label>
              <PasswordField
                label="Mot de passe"
                value={form.password}
                onChange={(event) => updateForm("password", event.target.value)}
                error={errors.password}
                autoComplete={mode === "register" ? "new-password" : "current-password"}
              />
              {mode === "register" && (
                <PasswordField
                  label="Confirmer le mot de passe"
                  value={form.confirmation}
                  onChange={(event) => updateForm("confirmation", event.target.value)}
                  error={errors.confirmation}
                  autoComplete="new-password"
                />
              )}
            </div>

            {selectedRole === "vendor" && (
              <p className="mt-4 rounded-lg bg-softOrange p-3 text-sm font-bold text-slate-700">
                Compte vendeur de démonstration disponible auprès du porteur du projet.
              </p>
            )}
            {mode === "register" && (
              <p className="mt-4 text-xs leading-5 text-slate-500">
                Les informations du compte servent uniquement à fournir l'accès et à gérer vos commandes.
              </p>
            )}
            {apiError && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-bold text-red-700">{apiError}</p>}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button disabled={isSubmitting} className="primary-button flex-1">
                {isSubmitting ? "Vérification..." : mode === "register" ? "Créer mon compte" : "Se connecter"}
                {!isSubmitting && <ArrowRight size={18} />}
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
