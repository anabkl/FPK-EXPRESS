import { motion } from "framer-motion";

function SkeletonLine({ className = "" }) {
  return <div className={`animate-pulse rounded-lg bg-slate-200 ${className}`} />;
}

function SkeletonBlock({ className = "" }) {
  return <div className={`animate-pulse rounded-lg bg-slate-100 ${className}`} />;
}

export function SkeletonCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="card overflow-hidden"
      aria-hidden="true"
    >
      <SkeletonBlock className="aspect-[4/3] w-full" />
      <div className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            <SkeletonLine className="h-3 w-20" />
            <SkeletonLine className="h-5 w-36" />
          </div>
          <SkeletonLine className="h-9 w-20" />
        </div>
        <div className="space-y-2">
          <SkeletonLine className="h-3 w-full" />
          <SkeletonLine className="h-3 w-4/5" />
        </div>
        <div className="flex gap-2">
          <SkeletonLine className="h-8 w-20" />
          <SkeletonLine className="h-8 w-16" />
        </div>
        <SkeletonLine className="h-10 w-full" />
      </div>
    </motion.div>
  );
}

export function SkeletonGrid({ count = 8 }) {
  return (
    <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4" role="status" aria-label="Chargement des repas">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}

export function DashboardSkeleton({ variant = "student" }) {
  const isVendor = variant === "vendor";

  return (
    <section className={isVendor ? "space-y-8" : "grid gap-5 lg:grid-cols-[1.15fr_0.85fr]"} role="status">
      {isVendor ? (
        <>
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div className="space-y-3">
              <SkeletonLine className="h-3 w-28" />
              <SkeletonLine className="h-8 w-64" />
              <SkeletonLine className="h-4 w-80 max-w-full" />
            </div>
            <SkeletonLine className="h-11 w-40" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="card p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-3">
                    <SkeletonLine className="h-3 w-24" />
                    <SkeletonLine className="h-7 w-28" />
                  </div>
                  <SkeletonBlock className="h-12 w-12" />
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="card p-5">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div className="space-y-3">
                <SkeletonLine className="h-3 w-36" />
                <SkeletonLine className="h-8 w-64" />
                <SkeletonLine className="h-4 w-80 max-w-full" />
              </div>
              <SkeletonLine className="h-16 w-36" />
            </div>
            <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="space-y-3">
                  <SkeletonLine className="h-3 w-32" />
                  <SkeletonLine className="h-7 w-52" />
                  <SkeletonLine className="h-4 w-44" />
                </div>
                <SkeletonLine className="h-11 w-32" />
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <SkeletonLine key={index} className="h-14 w-full" />
                ))}
              </div>
            </div>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-3">
              <SkeletonBlock className="h-11 w-11" />
              <div className="space-y-2">
                <SkeletonLine className="h-3 w-28" />
                <SkeletonLine className="h-5 w-44" />
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3">
                  <SkeletonBlock className="h-14 w-14" />
                  <div className="flex-1 space-y-2">
                    <SkeletonLine className="h-4 w-32" />
                    <SkeletonLine className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}

export function AIInsightsSkeleton() {
  return (
    <section className="bg-navy py-16 text-white" role="status" aria-label="Chargement des suggestions intelligentes">
      <div className="section-shell">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div className="space-y-3">
            <div className="h-3 w-44 animate-pulse rounded-lg bg-white/20" />
            <div className="h-9 w-80 max-w-full animate-pulse rounded-lg bg-white/20" />
          </div>
          <div className="h-16 w-full max-w-xl animate-pulse rounded-lg bg-white/10" />
        </div>
        <div className="mt-9 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-lg border border-white/10 bg-white/10 p-5">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 animate-pulse rounded-lg bg-white/20" />
              <div className="space-y-2">
                <div className="h-3 w-36 animate-pulse rounded-lg bg-white/20" />
                <div className="h-7 w-48 animate-pulse rounded-lg bg-white/20" />
              </div>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-28 animate-pulse rounded-lg bg-white/10" />
              ))}
            </div>
            <div className="mt-5 h-20 animate-pulse rounded-lg bg-white/20" />
          </div>
          <div className="rounded-lg border border-white/10 bg-white p-5 text-navy shadow-soft">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <SkeletonLine className="h-3 w-32" />
                <SkeletonLine className="h-7 w-52" />
              </div>
              <SkeletonBlock className="h-10 w-10" />
            </div>
            <div className="mt-6 space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between gap-3">
                    <SkeletonLine className="h-3 w-14" />
                    <SkeletonLine className="h-3 w-36" />
                  </div>
                  <SkeletonLine className="h-3 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
