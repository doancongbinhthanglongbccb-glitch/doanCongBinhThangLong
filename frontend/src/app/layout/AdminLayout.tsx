import type { ElementType, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ArrowLeft, ChevronRight, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import SidebarSection from "@/shared/components/admin/SidebarSection";
import { logout } from "@/features/auth/services/auth.service";
import { cn } from "@/lib/utils";
import unitLogo from "@/assets/logo-293.png";

type AdminMenuItem = {
  key: string;
  label: string;
  icon: ElementType;
};

type AdminMenuSection = {
  label: string;
  items: AdminMenuItem[];
};

type AdminLayoutProps = {
  menuSections: AdminMenuSection[];
  active: string;
  onChange: (key: string) => void;
  pageTitle: string;
  breadcrumb?: string[];
  userName?: string;
  role?: string;
  children: ReactNode;
};

const AdminLayout = ({ menuSections, active, onChange, pageTitle, breadcrumb = [], userName, role, children }: AdminLayoutProps) => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#f3f4f6_100%)] text-slate-900">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="flex w-full flex-col border-b border-slate-200 bg-white shadow-sm lg:sticky lg:top-0 lg:h-screen lg:w-[240px] lg:border-b-0 lg:border-r">
          <div className="border-b border-slate-200 px-5 py-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-red-100 bg-white p-[2px]">
                <img
                  src={unitLogo}
                  alt="Logo don vi"
                  className="h-full w-full object-contain"
                  style={{ imageRendering: "crisp-edges" }}
                />
              </div>
              <div>
                <h1 className="text-base font-semibold leading-5 text-slate-900">{t("admin.layout.appTitle")}</h1>
              </div>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-500">{t("admin.layout.appDescription")}</p>
          </div>

          <nav className="flex-1 space-y-3 px-3 py-4">
            {menuSections.map((section) => (
              <SidebarSection
                key={section.label}
                label={section.label}
                items={section.items}
                active={active}
                onChange={onChange}
                collapsible
              />
            ))}
          </nav>

          <div className="mt-auto border-t border-slate-200 p-3">
            <div className="mb-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm">
              <p className="font-medium text-slate-900">{userName || t("admin.layout.userFallback")}</p>
              <p className="mt-1 text-slate-500">{role || t("admin.layout.roleFallback")}</p>
            </div>
            <Button variant="destructive" className="mb-2 w-full justify-start rounded-lg" onClick={() => logout()}>
              <LogOut className="mr-2 h-4 w-4" />
              {t("admin.layout.logout")}
            </Button>
            <Button asChild variant="outline" className="w-full justify-start rounded-lg">
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("admin.layout.backToSite")}
              </Link>
            </Button>
          </div>
        </aside>

        <div className="flex-1">
          <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur-sm lg:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                  <span>{t("admin.layout.breadcrumbRoot")}</span>
                  {breadcrumb.map((item) => (
                    <span key={item} className="inline-flex items-center gap-2 uppercase tracking-[0.14em] text-slate-400">
                      <ChevronRight className="h-3.5 w-3.5" />
                      {item}
                    </span>
                  ))}
                </div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{pageTitle}</h2>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                <span className="font-medium text-slate-900">{userName || t("admin.layout.userFallback")}</span>
                <span className="mx-2 text-slate-300">•</span>
                <span>{role || t("admin.layout.roleFallback")}</span>
              </div>
            </div>
          </header>

          <main className={cn("space-y-6 px-4 py-6 lg:px-8")}>{children}</main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;