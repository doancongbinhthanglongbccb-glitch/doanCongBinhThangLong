import { Activity } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { ActivityItem } from "@/shared/types/cms";
import AdminSectionCard from "@/shared/components/admin/AdminSectionCard";
import { ROUTES } from "@/lib/constants";

type DashboardLatestPostsSectionProps = {
  items: ActivityItem[];
  canEditContent: boolean;
};

const DashboardLatestPostsSection = ({ items, canEditContent }: DashboardLatestPostsSectionProps) => {
  const { t } = useTranslation();

  return (
    <AdminSectionCard
      title={t("admin.dashboard.latestPostsTitle")}
      description={t("admin.dashboard.latestPostsDesc")}
      actions={
        items.length > 0 ? (
          <Button asChild variant="outline" size="sm">
            <Link to={ROUTES.ADMIN_POSTS}>{t("admin.dashboard.viewAllPosts")}</Link>
          </Button>
        ) : null
      }
    >
      <div className="space-y-admin-stack">
        {items.map((item) => (
          <div key={item.id} className="admin-card-sm">
            <div className="flex items-center justify-between gap-admin-tight">
              <p className="line-clamp-1 min-w-0 text-sm font-semibold text-card-foreground">{item.title}</p>
              <span className="shrink-0 rounded-full border border-admin-border bg-admin-surface-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                {item.status === "published" ? t("admin.status.published") : t("admin.status.draft")}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-admin-tight">
              <div className="inline-flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
                <Activity className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span className="truncate">{item.slug}</span>
              </div>
              {canEditContent ? (
                <Button asChild variant="ghost" size="sm" className="h-8 shrink-0 px-2 text-xs">
                  <Link to={`${ROUTES.ADMIN_POSTS}/${item.id}/edit`}>{t("admin.postManager.actionEdit")}</Link>
                </Button>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="admin-empty">
          <p>{t("admin.dashboard.latestPostsEmpty")}</p>
          <div className="flex flex-wrap gap-admin-tight">
            <Button asChild size="sm" variant="default">
              <Link to={ROUTES.ADMIN_POSTS}>{t("admin.dashboard.latestPostsEmptyCta")}</Link>
            </Button>
            {canEditContent ? (
              <Button asChild size="sm" variant="outline">
                <Link to={`${ROUTES.ADMIN_POSTS}/new`}>{t("admin.dashboard.ctaNewPost")}</Link>
              </Button>
            ) : null}
          </div>
        </div>
      )}
    </AdminSectionCard>
  );
};

export default DashboardLatestPostsSection;
