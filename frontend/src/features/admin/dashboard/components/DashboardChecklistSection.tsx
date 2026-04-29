import { CheckCircle2, Database } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AdminSectionCard from "@/shared/components/admin/AdminSectionCard";
import { ROUTES } from "@/lib/constants";

type DashboardChecklistSectionProps = {
  checklistItems: string[];
  totalItems: number;
  canEditContent: boolean;
};

const DashboardChecklistSection = ({ checklistItems, totalItems, canEditContent }: DashboardChecklistSectionProps) => {
  const { t } = useTranslation();

  return (
    <AdminSectionCard
      title={t("admin.dashboard.title")}
      description={t("admin.dashboard.description")}
      actions={
        <div className="flex flex-wrap items-center justify-end gap-admin-tight">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{t("admin.dashboard.totalContent")}</span>
            <Badge variant="secondary" className="tabular-nums">
              {totalItems}
            </Badge>
          </div>
          {canEditContent ? (
            <Button asChild variant="outline" size="sm">
              <Link to={ROUTES.ADMIN_POSTS}>{t("admin.dashboard.ctaManagePosts")}</Link>
            </Button>
          ) : null}
        </div>
      }
    >
      <div className="grid gap-admin-stack md:grid-cols-3">
        {checklistItems.map((item) => (
          <div key={item} className="admin-inset">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <p className="text-sm leading-6 text-foreground">{item}</p>
          </div>
        ))}
      </div>
      <div className="admin-footnote">
        <Database className="h-4 w-4 shrink-0" />
        {t("admin.dashboard.syncNote")}
      </div>
    </AdminSectionCard>
  );
};

export default DashboardChecklistSection;
