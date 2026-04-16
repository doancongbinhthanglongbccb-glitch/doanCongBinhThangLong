import { useCallback, useEffect, useState, type ElementType } from "react";
import { BookOpen, Home, LayoutDashboard, LibraryBig, MenuSquare, Settings, Shield, Sparkles } from "lucide-react";
import AdminLayout from "@/shared/layouts/AdminLayout";
import Dashboard from "./Dashboard";
import TrangChuManager from "./TrangChuManager";
import GioiThieuManager from "./GioiThieuManager";
import HoatDongManager from "./HoatDongManager";
import GuongBacManager from "./GuongBacManager";
import ThuVienManager from "./ThuVienManager";
import SidebarManager from "./SidebarManager";
import HeaderSettingsManager from "./HeaderSettingsManager";
import MenuManager from "./MenuManager";
import FooterSettingsManager from "./FooterSettingsManager";
import { createCollectionItem, deleteCollectionItem, getCmsData, updateCmsData, updateCollectionItem } from "@/services/api/cmsApi";
import { createPost, deletePost, updatePost } from "@/services/api/postApi";
import type { CmsCollectionKey, CmsData } from "@/shared/types/cms";
import type { CreatePostInput, UpdatePostInput } from "@/shared/types/post";

type AdminKey =
  | "dashboard"
  | "trang-chu"
  | "header"
  | "menu"
  | "footer"
  | "gioi-thieu"
  | "hoat-dong"
  | "guong-bac"
  | "thu-vien"
  | "binh-dan";

type AdminMenuItem = { key: AdminKey; label: string; icon: ElementType };
type AdminMenuSection = { label: string; items: AdminMenuItem[] };

const menuSections: AdminMenuSection[] = [
  {
    label: "NỘI DUNG",
    items: [
      { key: "dashboard", label: "Bảng điều khiển", icon: LayoutDashboard },
      { key: "trang-chu", label: "Trang chủ", icon: Home },
      { key: "gioi-thieu", label: "Giới thiệu", icon: BookOpen },
      { key: "hoat-dong", label: "Hoạt động đơn vị", icon: Shield },
      { key: "guong-bac", label: "Theo gương Bác", icon: Sparkles },
      { key: "thu-vien", label: "Thư viện", icon: LibraryBig },
      { key: "binh-dan", label: "Bình dân học vụ số", icon: Sparkles },
    ],
  },
  {
    label: "CẤU HÌNH",
    items: [
      { key: "header", label: "Cấu hình Header", icon: Settings },
      { key: "menu", label: "Quản lý Menu", icon: MenuSquare },
      { key: "footer", label: "Cấu hình Footer", icon: LibraryBig },
    ],
  },
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
      setError("Không thể tải dữ liệu quản trị viên.");
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
    return <div className="container py-10">Đang tải bảng quản trị viên...</div>;
  }

  if (error) {
    return <div className="container py-10 text-red-600">{error}</div>;
  }

  return (
    <AdminLayout menuSections={menuSections} active={active} onChange={(key) => setActive(key as AdminKey)}>
      {active === "dashboard" && <Dashboard data={data} />}
      {active === "trang-chu" && <TrangChuManager data={data} updateSiteData={updateSiteData} />}
      {active === "header" && <HeaderSettingsManager data={data} updateSiteData={updateSiteData} />}
      {active === "menu" && <MenuManager data={data} updateSiteData={updateSiteData} />}
      {active === "footer" && <FooterSettingsManager data={data} updateSiteData={updateSiteData} />}
      {active === "gioi-thieu" && <GioiThieuManager data={data} updateSiteData={updateSiteData} />}
      {active === "hoat-dong" && <HoatDongManager data={data} createItem={createItem} updateItem={updateItem} deleteItem={deleteItem} />}
      {active === "guong-bac" && <GuongBacManager data={data} createItem={createItem} updateItem={updateItem} deleteItem={deleteItem} />}
      {active === "thu-vien" && <ThuVienManager data={data} createItem={createItem} updateItem={updateItem} deleteItem={deleteItem} />}
      {active === "binh-dan" && (
        <SidebarManager
          data={data}
          createItem={createItem}
          updateItem={updateItem}
          deleteItem={deleteItem}
          updateSiteData={updateSiteData}
        />
      )}
    </AdminLayout>
  );
};

export default Admin;
