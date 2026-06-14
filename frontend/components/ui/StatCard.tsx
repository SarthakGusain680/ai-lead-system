// Dashboard stat box (e.g. "Total Leads: 42")
interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  color?: string;
}

export default function StatCard({ title, value, subtitle, color = "text-blue-400" }: StatCardProps) {
  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <p className="text-slate-400 text-sm font-medium">{title}</p>
      <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
      {subtitle && <p className="text-slate-500 text-xs mt-1">{subtitle}</p>}
    </div>
  );
}