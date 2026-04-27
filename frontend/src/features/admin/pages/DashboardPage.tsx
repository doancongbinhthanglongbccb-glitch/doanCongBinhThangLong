import { Activity, BookOpen, CheckCircle2, Database, Library, ShieldCheck, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useOutletContext } from "react-router-dom";
import type { CmsData } from "@/shared/types/cms";
import AdminSectionCard from "@/shared/components/admin/AdminSectionCard";
import AdminStatCard from "@/shared/components/admin/AdminStatCard";

type AdminOutletContext = {
  data: CmsData;
};

const parseTimeValue = (value?: string) => {
  if (!value) {
    return 0;
  }

  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const Dashboard = () => {
  const { t } = useTranslation();
  const { data } = useOutletContext<AdminOutletContext>();
  const checklistItems = t("admin.dashboard.checklistItems", { returnObjects: true }) as string[];
  const sectionStats = [
    {
      label: t("admin.dashboard.stats.activitiesTitle"),
      value: data.activities.length,
      icon: ShieldCheck,
      note: t("admin.dashboard.stats.activitiesNote"),
      tone: "primary" as const,
    },
    {
      label: t("admin.dashboard.stats.guongBacTitle"),
      value: data.guongBac.length,
      icon: Sparkles,
      note: t("admin.dashboard.stats.guongBacNote"),
      tone: "secondary" as const,
    },
    {
      label: t("admin.dashboard.stats.libraryTitle"),
      value: data.thuVien.length,
      icon: Library,
      note: t("admin.dashboard.stats.libraryNote"),
      tone: "success" as const,
    },
    {
      label: t("admin.dashboard.stats.digitalLearningTitle"),
      value: data.binhDanHocVu.length,
      icon: BookOpen,
      note: t("admin.dashboard.stats.digitalLearningNote"),
      tone: "warning" as const,
    },
  ];

  const totalItems = sectionStats.reduce((sum, item) => sum + item.value, 0);

  const latestItems = [...data.activities]
    .sort((a, b) => parseTimeValue(b.updatedAt || b.createdAt || b.publishedAt) - parseTimeValue(a.updatedAt || a.createdAt || a.publishedAt))
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {sectionStats.map((item) => {
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

      <AdminSectionCard
        title={t("admin.dashboard.title")}
        description={t("admin.dashboard.description")}
        actions={
          <div className="text-sm font-medium text-slate-600">
            {t("admin.dashboard.totalContent")}: {totalItems}
          </div>
        }
      >
        <div className="grid gap-3 md:grid-cols-3">
          {checklistItems.map((item) => (
            <div key={item} className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-700" />
              <p className="text-sm leading-6 text-slate-700">{item}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 inline-flex items-center gap-2 text-xs text-slate-600">
          <Database className="h-4 w-4" />
          {t("admin.dashboard.syncNote")}
        </div>
      </AdminSectionCard>

      <AdminSectionCard title={t("admin.dashboard.latestPostsTitle")} description={t("admin.dashboard.latestPostsDesc")}>
        <div className="space-y-3">
          {latestItems.map((item) => (
            <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <p className="line-clamp-1 text-sm font-semibold text-slate-900">{item.title}</p>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-500">
                  {item.status === "published" ? t("admin.status.published") : t("admin.status.draft")}
                </span>
              </div>
              <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-600">
                <Activity className="h-3.5 w-3.5" />
                {item.slug}
              </div>
            </div>
          ))}
        </div>

        {latestItems.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
            {t("admin.dashboard.latestPostsEmpty")}
          </div>
        )}
      </AdminSectionCard>
    </div>
  );
};

export default Dashboard;
