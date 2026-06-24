import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const COLORS = ["#FF7A00", "#16A34A", "#0F172A", "#38BDF8", "#F59E0B", "#64748B"];

export default function ChartsSection({ stats }) {
  const ordersPerHour = stats?.orders_per_hour || [];
  const popularMeals = stats?.popular_meals || [];
  const waitingTime = stats?.waiting_time_by_hour || [];

  return (
    <section className="grid gap-5 xl:grid-cols-3">
      <div className="card p-5 xl:col-span-2">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-slate-500">Commandes par heure</p>
            <h3 className="text-xl font-black text-navy">Flux de commandes</h3>
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ordersPerHour}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip cursor={{ fill: "#FFF7ED" }} />
              <Bar dataKey="orders" fill="#FF7A00" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card p-5">
        <p className="text-sm font-bold text-slate-500">Plats les plus commandés</p>
        <h3 className="text-xl font-black text-navy">Choix fréquents</h3>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={popularMeals} dataKey="orders" nameKey="name" innerRadius={48} outerRadius={88} paddingAngle={3}>
                {popularMeals.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card p-5 xl:col-span-3">
        <p className="text-sm font-bold text-slate-500">Attente moyenne</p>
        <h3 className="text-xl font-black text-navy">Temps d'attente estimé</h3>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={waitingTime}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="minutes" stroke="#16A34A" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
