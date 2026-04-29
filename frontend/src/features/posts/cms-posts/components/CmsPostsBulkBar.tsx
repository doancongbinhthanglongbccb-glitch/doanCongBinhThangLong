import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type BulkAction = "publish" | "draft" | "delete";

type CmsPostsBulkBarProps = {
	selectedCount: number;
	bulkAction: BulkAction;
	onBulkActionChange: (action: BulkAction) => void;
	onExecute: () => void;
	executeDisabled: boolean;
};

const CmsPostsBulkBar = ({
	selectedCount,
	bulkAction,
	onBulkActionChange,
	onExecute,
	executeDisabled,
}: CmsPostsBulkBarProps) => {
	const { t } = useTranslation();

	if (selectedCount === 0) {
		return null;
	}

	return (
		<div className="mt-4 flex flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between">
			<p className="text-sm text-slate-700">{t("admin.postManager.selectedCount", { count: selectedCount })}</p>
			<div className="flex flex-wrap items-center gap-2">
				<Select value={bulkAction} onValueChange={(value) => onBulkActionChange(value as BulkAction)}>
					<SelectTrigger className="h-9 w-[190px] rounded-lg border-slate-300 bg-white">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="publish">{t("admin.postManager.actionPublish")}</SelectItem>
						<SelectItem value="draft">{t("admin.postManager.moveToDraftMenu")}</SelectItem>
						<SelectItem value="delete">{t("admin.postManager.actionDelete")}</SelectItem>
					</SelectContent>
				</Select>
				<Button onClick={onExecute} size="sm" disabled={executeDisabled}>
					{t("admin.postManager.bulkExecute")}
				</Button>
			</div>
		</div>
	);
};

export default CmsPostsBulkBar;
