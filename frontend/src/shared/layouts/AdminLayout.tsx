import type { ElementType, ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import SidebarSection from "@/shared/components/admin/SidebarSection";

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
  children: ReactNode;
};

const AdminLayout = ({ menuSections, active, onChange, children }: AdminLayoutProps) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="w-full border-b border-slate-200 bg-white lg:w-72 lg:border-b-0 lg:border-r">
          <div className="border-b border-slate-200 px-6 py-6">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Quản trị viên</p>
            <h1 className="mt-2 text-2xl font-bold">Quản trị website</h1>
            <p className="mt-2 text-sm text-slate-500">Quản lý nội dung theo đúng cấu trúc website.</p>
          </div>
          <nav className="p-4 lg:pb-6">
            {menuSections.map((section) => (
              <SidebarSection key={section.label} label={section.label} items={section.items} active={active} onChange={onChange} />
            ))}
          </nav>
          <div className="border-t border-slate-200 p-4">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Về website
              </Link>
            </Button>
          </div>
        </aside>

        <div className="flex-1">
          <header className="border-b border-slate-200 bg-white px-4 py-4 lg:px-8">
            <h2 className="text-2xl font-bold">Bảng điều khiển quản trị viên</h2>
          </header>

          <main className="space-y-6 px-4 py-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
