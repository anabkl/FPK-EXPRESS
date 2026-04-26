import { ChefHat, GraduationCap, Mail, Store } from "lucide-react";

export default function Footer({ onNavigate }) {
  return (
    <footer className="border-t border-slate-200 bg-white py-10">
      <div className="section-shell flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-white">
            <ChefHat size={23} />
          </div>
          <div>
            <p className="font-black text-navy">FPK-EXPRESS</p>
            <p className="text-sm font-medium text-slate-500">
              AI-powered preorder & pickup platform for FPK Khouribga students.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => onNavigate("student")} className="secondary-button px-3 py-2 text-sm">
            <GraduationCap size={17} />
            Étudiant
          </button>
          <button onClick={() => onNavigate("vendor")} className="secondary-button px-3 py-2 text-sm">
            <Store size={17} />
            Démo vendeur
          </button>
          <a href="mailto:demo@fpk-express.local" className="icon-button" aria-label="Contact">
            <Mail size={18} />
          </a>
        </div>
      </div>
    </footer>
  );
}
