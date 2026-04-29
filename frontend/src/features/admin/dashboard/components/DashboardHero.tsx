import { FileText, LayoutDashboard } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

type DashboardHeroProps = {
  canEditContent: boolean;
};

const DashboardHero = ({ canEditContent }: DashboardHeroProps) => {
  const { t } = useTranslation();

  return (
    <div className="admin-card">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="inline-flex items-center gap-2 text-muted-foreground">
            <LayoutDashboard className="h-4 w-4 shrink-0" aria-hidden />
            <span className="text-xs font-medium uppercase tracking-admin-label">{t("admin.dashboard.heroEyebrow")}</span>
          </div>
          <h1 className="text-2xl font-semibold leading-tight text-card-foreground sm:text-[1.75rem]">{t("admin.dashboard.heroTitle")}</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{t("admin.dashboard.heroSubtitle")}</p>
        </div>
        {canEditContent ? (
          <div className="flex shrink-0 flex-wrap gap-admin-tight sm:justify-end">
            <Button asChild size="sm" className="gap-1.5">
              <Link to={ROUTES.ADMIN_POSTS}>
                <FileText className="h-4 w-4" aria-hidden />
                {t("admin.dashboard.ctaManagePosts")}
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to={`${ROUTES.ADMIN_POSTS}/new`}>{t("admin.dashboard.ctaNewPost")}</Link>
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default DashboardHero;
