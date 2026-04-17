import { useOutletContext } from "react-router-dom";
import HeaderSettingsManager from "./HeaderSettingsManager";
import MenuManager from "./MenuManager";
import FooterSettingsManager from "./FooterSettingsManager";
import type { CmsData } from "@/shared/types/cms";
import AdminSurface from "@/shared/components/admin/AdminSurface";
import { UI_TEXT } from "@/constants/uiText";

type AdminOutletContext = {
  data: CmsData;
  canManageConfig: boolean;
  updateSiteData: (updater: CmsData | ((previous: CmsData) => CmsData)) => Promise<void>;
};

const ConfigManager = () => {
  const { data, canManageConfig, updateSiteData } = useOutletContext<AdminOutletContext>();
  const text = UI_TEXT.vi.admin.config;

  if (!canManageConfig) {
    return (
      <div className="rounded border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        {text.adminRequired}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminSurface title={text.title} description={text.description}>
        <div className="space-y-6 p-5">
          <HeaderSettingsManager data={data} updateSiteData={updateSiteData} />
          <MenuManager data={data} updateSiteData={updateSiteData} />
          <FooterSettingsManager data={data} updateSiteData={updateSiteData} />
        </div>
      </AdminSurface>
    </div>
  );
};

export default ConfigManager;
