import { BookOpen, Library, ShieldCheck, Sparkles, type LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ActivityItem, CmsData } from "@/shared/types/cms";
import { parseContentTime } from "../utils/parseContentTime";

export type DashboardSectionStat = {
  label: string;
  value: number;
  icon: LucideIcon;
  note: string;
  tone: "primary" | "secondary" | "success" | "warning";
};

export function useDashboardContent(data: CmsData) {
  const { t } = useTranslation();

  const checklistItems = t("admin.dashboard.checklistItems", { returnObjects: true }) as string[];

  const sectionStats: DashboardSectionStat[] = [
    {
      label: t("admin.dashboard.stats.activitiesTitle"),
      value: data.activities.length,
      icon: ShieldCheck,
      note: t("admin.dashboard.stats.activitiesNote"),
      tone: "primary",
    },
    {
      label: t("admin.dashboard.stats.guongBacTitle"),
      value: data.guongBac.length,
      icon: Sparkles,
      note: t("admin.dashboard.stats.guongBacNote"),
      tone: "secondary",
    },
    {
      label: t("admin.dashboard.stats.libraryTitle"),
      value: data.thuVien.length,
      icon: Library,
      note: t("admin.dashboard.stats.libraryNote"),
      tone: "success",
    },
    {
      label: t("admin.dashboard.stats.digitalLearningTitle"),
      value: data.binhDanHocVu.length,
      icon: BookOpen,
      note: t("admin.dashboard.stats.digitalLearningNote"),
      tone: "warning",
    },
  ];

  const totalItems = sectionStats.reduce((sum, item) => sum + item.value, 0);

  const latestItems: ActivityItem[] = [...data.activities]
    .sort(
      (a, b) =>
        parseContentTime(b.updatedAt || b.createdAt || b.publishedAt) -
        parseContentTime(a.updatedAt || a.createdAt || a.publishedAt),
    )
    .slice(0, 6);

  return {
    checklistItems,
    sectionStats,
    totalItems,
    latestItems,
  };
}
