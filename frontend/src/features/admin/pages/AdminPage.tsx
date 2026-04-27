import { useCallback, useEffect, useMemo, useState, type ElementType } from "react";
import { useTranslation } from "react-i18next";
import { FileText, LayoutDashboard, Settings } from "lucide-react";
import AdminLayout from "@/app/layout/AdminLayout";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { getCmsData, updateCmsData } from "@/services/api/cmsApi";
import { getCmsPosts } from "@/services/api/postApi";
import { getAuthUser, getUserRole, hasRoleAccess } from "@/features/auth/services/auth.service";
import type { CmsData } from "@/shared/types/cms";
import { getApiErrorMessage } from "@/services/api/errors";
import { ROUTES } from "@/lib/constants";

type AdminKey =
  | "dashboard"
  | "posts"
  | "config";

type AdminMenuItem = { key: AdminKey; label: string; icon: ElementType };
type AdminMenuSection = { label: string; items: AdminMenuItem[] };

const Admin = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<CmsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const role = getUserRole();
  const userId = getAuthUser()?.id || getAuthUser()?._id || "";
  const canEditContent = hasRoleAccess("editor");
  const canManageConfig = hasRoleAccess("admin");

  const menuSections: AdminMenuSection[] = useMemo(
    () => [
      {
        label: t("admin.sections.content"),
        items: [
          { key: "dashboard", label: t("admin.menu.dashboard"), icon: LayoutDashboard },
          { key: "posts", label: t("admin.menu.postManager"), icon: FileText },
        ],
      },
      {
        label: t("admin.sections.system"),
        items: [{ key: "config", label: t("admin.menu.configManager"), icon: Settings }],
      },
    ],
    [t],
  );

  const pageMeta: Record<AdminKey, { title: string; breadcrumb: string[] }> = useMemo(
    () => ({
      dashboard: {
        title: t("admin.menu.dashboard"),
        breadcrumb: [t("admin.menu.dashboard")],
      },
      posts: {
        title: t("admin.menu.postManager"),
        breadcrumb: [t("admin.sections.content"), t("admin.menu.postManager")],
      },
      config: {
        title: t("admin.menu.configManager"),
        breadcrumb: [t("admin.sections.system"), t("admin.menu.configManager")],
      },
    }),
    [t],
  );

  const visibleMenuSections = useMemo(
    () =>
      menuSections
        .map((section) => {
          if (section.label === t("admin.sections.system")) {
            return {
              ...section,
              items: canManageConfig ? section.items : [],
            };
          }

          return {
            ...section,
            items: canEditContent ? section.items : section.items.filter((item) => item.key === "dashboard"),
          };
        })
        .filter((section) => section.items.length > 0),
    [canEditContent, canManageConfig, menuSections, t],
  );

  const active: AdminKey =
    location.pathname.includes(ROUTES.ADMIN_POSTS)
      ? "posts"
      : location.pathname.includes(ROUTES.ADMIN_CONFIG)
      ? "config"
      : "dashboard";
  const page = pageMeta[active];

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [snapshot, cmsPosts] = await Promise.all([getCmsData(), getCmsPosts()]);
      setData({ ...snapshot, activities: cmsPosts });
      setError("");
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, t("admin.common.adminDataLoadError")));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const updateSiteData = async (updater: CmsData | ((previous: CmsData) => CmsData)) => {
    if (!canManageConfig) {
      throw new Error("Insufficient role: admin required");
    }

    await updateCmsData(updater);
    await loadData();
  };

  if (loading || !data) {
    return <div className="container py-10">{t("admin.common.loadingAdminData")}</div>;
  }

  if (error) {
    return <div className="container py-10 text-red-600">{error}</div>;
  }

  return (
    <AdminLayout
      menuSections={visibleMenuSections}
      active={active}
      onChange={(key) => navigate(`${ROUTES.ADMIN_ROOT}/${key === "dashboard" ? "dashboard" : key}`)}
      pageTitle={page.title}
      breadcrumb={page.breadcrumb}
      userName={getAuthUser()?.username || t("admin.layout.userFallback")}
      role={role}
    >
      {!canEditContent && (
        <div className="rounded border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {t("admin.common.unauthorizedViewOnly")}: <strong>{role || t("admin.layout.roleFallback")}</strong>.{" "}
          {t("admin.common.unauthorizedViewOnlySuffix")}
        </div>
      )}

      <Outlet
        context={{
          data,
          role,
          userId,
          canEditContent,
          canManageConfig,
          updateSiteData,
          reload: loadData,
        }}
      />
    </AdminLayout>
  );
};

export default Admin;
