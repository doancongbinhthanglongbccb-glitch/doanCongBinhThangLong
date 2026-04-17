import type { ElementType } from "react";

type AdminStatCardProps = {
  title: string;
  value: string | number;
  description: string;
  icon: ElementType;
  tone?: "primary" | "success" | "warning" | "secondary";
};

const toneClasses = {
  primary: "border-red-200 bg-red-50 text-red-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  secondary: "border-slate-200 bg-slate-50 text-slate-700",
};

const AdminStatCard = ({ title, value, description, icon: Icon, tone = "secondary" }: AdminStatCardProps) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">{title}</p>
          <p className="text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-lg border ${toneClasses[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};

export default AdminStatCard;
