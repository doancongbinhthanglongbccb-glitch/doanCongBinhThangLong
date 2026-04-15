import { useState, type ElementType } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Home, LayoutDashboard, LibraryBig, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSiteData } from "@/context/SiteDataContext";
import Dashboard from "@/pages/admin/Dashboard";
import TrangChuManager from "@/pages/admin/TrangChuManager";
import GioiThieuManager from "@/pages/admin/GioiThieuManager";
import HoatDongManager from "@/pages/admin/HoatDongManager";
import GuongBacManager from "@/pages/admin/GuongBacManager";
import ThuVienManager from "@/pages/admin/ThuVienManager";
import SidebarManager from "@/pages/admin/SidebarManager";

type AdminKey = "dashboard" | "trang-chu" | "gioi-thieu" | "hoat-dong" | "guong-bac" | "thu-vien" | "binh-dan";

const menus: Array<{ key: AdminKey; label: string; icon: ElementType }> = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "trang-chu", label: "Trang chủ", icon: Home },
  { key: "gioi-thieu", label: "Giới thiệu", icon: BookOpen },
  { key: "hoat-dong", label: "Hoạt động đơn vị", icon: Shield },
  { key: "guong-bac", label: "Theo gương Bác", icon: Sparkles },
  { key: "thu-vien", label: "Thư viện", icon: LibraryBig },
  { key: "binh-dan", label: "Bình dân học vụ số", icon: LibraryBig },
];

const Admin = () => {
  const { data, loading, updateSiteData, createItem, updateItem, deleteItem } = useSiteData();
  const [active, setActive] = useState<AdminKey>("dashboard");

  if (loading || !data) {
    return <div className="container py-10">Đang tải Admin CMS...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 border-r border-slate-200 bg-white lg:block">
          <div className="border-b border-slate-200 px-6 py-6">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Admin CMS</p>
            <h1 className="mt-2 text-2xl font-bold">Quản trị website</h1>
            <p className="mt-2 text-sm text-slate-500">Quản lý nội dung theo đúng cấu trúc website.</p>
          </div>
          <nav className="space-y-1 p-4">
            {menus.map((item) => {
              const Icon = item.icon;
              const activeClass = active === item.key ? "bg-slate-900 text-white" : "hover:bg-slate-100 text-slate-700";
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActive(item.key)}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold ${activeClass}`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
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
            <h2 className="text-2xl font-bold">Admin CMS</h2>
          </header>

          <main className="space-y-6 px-4 py-6 lg:px-8">
            {active === "dashboard" && <Dashboard data={data} />}
            {active === "trang-chu" && <TrangChuManager data={data} updateSiteData={updateSiteData} />}
            {active === "gioi-thieu" && <GioiThieuManager data={data} updateSiteData={updateSiteData} />}
            {active === "hoat-dong" && <HoatDongManager data={data} createItem={createItem} updateItem={updateItem} deleteItem={deleteItem} />}
            {active === "guong-bac" && <GuongBacManager data={data} createItem={createItem} updateItem={updateItem} deleteItem={deleteItem} />}
            {active === "thu-vien" && <ThuVienManager data={data} createItem={createItem} updateItem={updateItem} deleteItem={deleteItem} />}
            {active === "binh-dan" && <SidebarManager data={data} createItem={createItem} updateItem={updateItem} deleteItem={deleteItem} />}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Admin;
