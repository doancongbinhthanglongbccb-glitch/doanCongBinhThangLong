import { useTranslation } from "react-i18next";
import { useOutletContext } from "react-router-dom";
import HeaderSettingsManager from "../components/HeaderSettingsManager";
import MenuManager from "../components/MenuManager";
import FooterSettingsManager from "../components/FooterSettingsManager";
import type { CmsData } from "@/shared/types/cms";
import AdminSurface from "@/shared/components/admin/AdminSurface";

type AdminOutletContext = {
	data: CmsData;
	canManageConfig: boolean;
	updateSiteData: (updater: CmsData | ((previous: CmsData) => CmsData)) => Promise<void>;
};

const ConfigManagerPage = () => {
	const { t } = useTranslation();
	const { data, canManageConfig, updateSiteData } = useOutletContext<AdminOutletContext>();

	if (!canManageConfig) {
		return <div className="rounded border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">{t("admin.config.adminRequired")}</div>;
	}

	return (
		<div className="space-y-6">
			<AdminSurface title={t("admin.config.title")} description={t("admin.config.description")}>
				<div className="space-y-6 p-5">
					<HeaderSettingsManager data={data} updateSiteData={updateSiteData} />
					<MenuManager data={data} updateSiteData={updateSiteData} />
					<FooterSettingsManager data={data} updateSiteData={updateSiteData} />
				</div>
			</AdminSurface>
		</div>
	);
};

export default ConfigManagerPage;
