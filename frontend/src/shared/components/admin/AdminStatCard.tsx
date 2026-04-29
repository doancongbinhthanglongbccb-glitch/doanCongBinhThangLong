import type { ElementType } from "react";

type AdminStatCardProps = {
  title: string;
  value: string | number;
  description: string;
  icon: ElementType;
  tone?: "primary" | "success" | "warning" | "secondary";
};

const toneClasses = {
  primary: "border-admin-stat-primary-border bg-admin-stat-primary-bg text-admin-stat-primary-fg",
  success: "border-admin-stat-success-border bg-admin-stat-success-bg text-admin-stat-success-fg",
  warning: "border-admin-stat-warning-border bg-admin-stat-warning-bg text-admin-stat-warning-fg",
  secondary: "border-admin-stat-secondary-border bg-admin-stat-secondary-bg text-admin-stat-secondary-fg",
};

const AdminStatCard = ({ title, value, description, icon: Icon, tone = "secondary" }: AdminStatCardProps) => {
  return (
    <div className="admin-card">
      <div className="flex items-start justify-between gap-admin-grid">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-admin-label text-muted-foreground">{title}</p>
          <p className="text-3xl font-semibold tracking-tight text-card-foreground">{value}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border ${toneClasses[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};

export default AdminStatCard;
