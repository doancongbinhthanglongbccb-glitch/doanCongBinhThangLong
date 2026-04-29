import AdminStatCard from "@/shared/components/admin/AdminStatCard";
import type { DashboardSectionStat } from "../hooks/useDashboardContent";

type DashboardStatGridProps = {
  stats: DashboardSectionStat[];
};

const DashboardStatGrid = ({ stats }: DashboardStatGridProps) => {
  return (
    <div className="grid gap-admin-grid md:grid-cols-2 xl:grid-cols-4">
      {stats.map((item) => {
        const Icon = item.icon;
        return (
          <AdminStatCard
            key={item.label}
            title={item.label}
            value={item.value}
            description={item.note}
            icon={Icon}
            tone={item.tone}
          />
        );
      })}
    </div>
  );
};

export default DashboardStatGrid;
