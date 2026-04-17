import { useCallback, useEffect, useMemo, useState, type ElementType } from "react";
import { FileText, LayoutDashboard, Settings } from "lucide-react";
import AdminLayout from "@/shared/layouts/AdminLayout";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { getCmsData, updateCmsData } from "@/services/api/cmsApi";
import { getCmsPosts } from "@/services/api/postApi";
import { getAuthUser, getUserRole, hasRoleAccess } from "@/services/auth";
import type { CmsData } from "@/shared/types/cms";
import type { Post } from "@/shared/types/post";
import { UI_TEXT } from "@/constants/uiText";

type AdminKey =
  | "dashboard"
  | "posts"
  | "config";

type AdminMenuItem = { key: AdminKey; label: string; icon: ElementType };
type AdminMenuSection = { label: string; items: AdminMenuItem[] };

const menuSections: AdminMenuSection[] = [
  {
    label: UI_TEXT.vi.admin.sections.content,
    items: [
      { key: "dashboard", label: UI_TEXT.vi.admin.menu.dashboard, icon: LayoutDashboard },
      { key: "posts", label: UI_TEXT.vi.admin.menu.postManager, icon: FileText },
    ],
  },
  {
    label: UI_TEXT.vi.admin.sections.system,
    items: [
      { key: "config", label: UI_TEXT.vi.admin.menu.configManager, icon: Settings },
    ],
  },
];

const pageMeta: Record<AdminKey, { title: string; breadcrumb: string[] }> = {
  dashboard: { title: UI_TEXT.vi.admin.menu.dashboard, breadcrumb: [UI_TEXT.vi.admin.menu.dashboard] },
  posts: { title: UI_TEXT.vi.admin.menu.postManager, breadcrumb: [UI_TEXT.vi.admin.sections.content, UI_TEXT.vi.admin.menu.postManager] },
  config: { title: UI_TEXT.vi.admin.menu.configManager, breadcrumb: [UI_TEXT.vi.admin.sections.system, UI_TEXT.vi.admin.menu.configManager] },
};

const Admin = () => {
  const [data, setData] = useState<CmsData | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const role = getUserRole();
  const userId = getAuthUser()?.id || "";
  const canEditContent = hasRoleAccess("editor");
  const canManageConfig = hasRoleAccess("admin");

  const visibleMenuSections = useMemo(
    () =>
      menuSections
    .map((section) => {
      if (section.label === UI_TEXT.vi.admin.sections.system) {
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
    [canEditContent, canManageConfig],
  );

  const active: AdminKey =
    location.pathname.includes("/admin/posts")
      ? "posts"
      : location.pathname.includes("/admin/config")
      ? "config"
      : "dashboard";
  const page = pageMeta[active];

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [snapshot, cmsPosts] = await Promise.all([getCmsData(), getCmsPosts()]);
      setData({ ...snapshot, activities: cmsPosts });
      setPosts(cmsPosts);
      setError("");
    } catch {
      setError(UI_TEXT.vi.admin.common.adminDataLoadError);
    } finally {
      setLoading(false);
    }
  }, []);

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
    return <div className="container py-10">{UI_TEXT.vi.admin.common.loadingAdminData}</div>;
  }

  if (error) {
    return <div className="container py-10 text-red-600">{error}</div>;
  }

  return (
    <AdminLayout
      menuSections={visibleMenuSections}
      active={active}
      onChange={(key) => navigate(`/admin/${key === "dashboard" ? "dashboard" : key}`)}
      pageTitle={page.title}
      breadcrumb={page.breadcrumb}
      userName={getAuthUser()?.username || UI_TEXT.vi.admin.layout.userFallback}
      role={role}
    >
      {!canEditContent && (
        <div className="rounded border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {UI_TEXT.vi.admin.common.unauthorizedViewOnly}: <strong>{role || UI_TEXT.vi.admin.layout.roleFallback}</strong>. {UI_TEXT.vi.admin.common.unauthorizedViewOnlySuffix}
        </div>
      )}

      <Outlet
        context={{
          data,
          posts,
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
