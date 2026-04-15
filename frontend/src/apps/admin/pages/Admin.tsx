import { useCallback, useEffect, useState, type ElementType } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Home, LayoutDashboard, LibraryBig, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Dashboard from "./Dashboard";
import TrangChuManager from "./TrangChuManager";
import GioiThieuManager from "./GioiThieuManager";
import HoatDongManager from "./HoatDongManager";
import GuongBacManager from "./GuongBacManager";
import ThuVienManager from "./ThuVienManager";
import SidebarManager from "./SidebarManager";
import { createCollectionItem, deleteCollectionItem, getCmsData, updateCmsData, updateCollectionItem } from "@/services/api/cmsApi";
import { createPost, deletePost, updatePost } from "@/services/api/postApi";
import type { CmsCollectionKey, CmsData } from "@/shared/types/cms";
import type { CreatePostInput, UpdatePostInput } from "@/shared/types/post";

type AdminKey = "dashboard" | "trang-chu" | "gioi-thieu" | "hoat-dong" | "guong-bac" | "thu-vien" | "binh-dan";

const menus: Array<{ key: AdminKey; label: string; icon: ElementType }> = [
  { key: "dashboard", label: "Tổng quan", icon: LayoutDashboard },
  { key: "trang-chu", label: "Trang chủ", icon: Home },
  { key: "gioi-thieu", label: "Giới thiệu", icon: BookOpen },
  { key: "hoat-dong", label: "Hoạt động đơn vị", icon: Shield },
  { key: "guong-bac", label: "Theo gương Bác", icon: Sparkles },
  { key: "thu-vien", label: "Thư viện", icon: LibraryBig },
  { key: "binh-dan", label: "Bình dân học vụ số", icon: LibraryBig },
];

const Admin = () => {
  const [data, setData] = useState<CmsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [active, setActive] = useState<AdminKey>("dashboard");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const snapshot = await getCmsData();
      setData(snapshot);
      setError("");
    } catch {
      setError("Không thể tải dữ liệu Admin CMS.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const updateSiteData = async (updater: CmsData | ((previous: CmsData) => CmsData)) => {
    await updateCmsData(updater);
    await loadData();
  };

  const createItem = async (collection: CmsCollectionKey, payload: Record<string, unknown>) => {
    switch (collection) {
      case "activities":
        await createPost(payload as CreatePostInput);
        break;
      case "guongBac":
        await createCollectionItem("guongBac", payload as Omit<CmsData["guongBac"][number], "id">);
        break;
      case "thuVien":
        await createCollectionItem("thuVien", payload as Omit<CmsData["thuVien"][number], "id">);
        break;
      case "binhDanHocVu":
        await createCollectionItem("binhDanHocVu", payload as Omit<CmsData["binhDanHocVu"][number], "id">);
        break;
      default:
        break;
    }
    await loadData();
  };

  const updateItem = async (collection: CmsCollectionKey, id: string, payload: Record<string, unknown>) => {
    switch (collection) {
      case "activities":
        await updatePost(id, payload as UpdatePostInput);
        break;
      case "guongBac":
        await updateCollectionItem("guongBac", id, payload as Partial<Omit<CmsData["guongBac"][number], "id">>);
        break;
      case "thuVien":
        await updateCollectionItem("thuVien", id, payload as Partial<Omit<CmsData["thuVien"][number], "id">>);
        break;
      case "binhDanHocVu":
        await updateCollectionItem("binhDanHocVu", id, payload as Partial<Omit<CmsData["binhDanHocVu"][number], "id">>);
        break;
      default:
        break;
    }
    await loadData();
  };

  const deleteItem = async (collection: CmsCollectionKey, id: string) => {
    if (collection === "activities") {
      await deletePost(id);
    } else {
      await deleteCollectionItem(collection, id);
    }
    await loadData();
  };

  if (loading || !data) {
    return <div className="container py-10">Đang tải Admin CMS...</div>;
  }

  if (error) {
    return <div className="container py-10 text-red-600">{error}</div>;
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
            <h2 className="text-2xl font-bold">Trang quản trị nội dung</h2>
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
