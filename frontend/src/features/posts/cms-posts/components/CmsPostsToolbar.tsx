import { Plus, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CmsPostsQueryState } from "../types";

type AuthorOption = { id: string; username: string };

type CmsPostsToolbarProps = {
	query: CmsPostsQueryState;
	authors: AuthorOption[];
	onQueryChange: (patch: Partial<CmsPostsQueryState>, resetPage?: boolean) => void;
	onCreateClick: () => void;
};

const CmsPostsToolbar = ({ query, authors, onQueryChange, onCreateClick }: CmsPostsToolbarProps) => {
	const { t } = useTranslation();

	return (
		<>
			<div className="flex flex-col gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h2 className="text-2xl font-semibold text-slate-900">{t("admin.postManager.title")}</h2>
					<p className="mt-1 text-sm text-slate-500">{t("admin.postManager.pageSubtitle")}</p>
				</div>
				<Button onClick={onCreateClick} className="h-10 rounded-lg bg-red-700 px-4 hover:bg-red-800">
					<Plus className="mr-1.5 h-4 w-4" />
					{t("admin.postManager.createButtonShort")}
				</Button>
			</div>

			<div className="mt-4 grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
				<div className="relative">
					<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
					<Input
						value={query.search}
						onChange={(event) => onQueryChange({ search: event.target.value }, true)}
						placeholder={t("admin.postManager.searchPlaceholderFull")}
						className="h-10 rounded-lg border-slate-300 pl-10"
					/>
				</div>

				<Select value={query.status} onValueChange={(value) => onQueryChange({ status: value as CmsPostsQueryState["status"] }, true)}>
					<SelectTrigger className="h-10 rounded-lg border-slate-300">
						<SelectValue placeholder={t("admin.postManager.statusField")} />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">{t("admin.postManager.allStatuses")}</SelectItem>
						<SelectItem value="published">{t("admin.status.published")}</SelectItem>
						<SelectItem value="draft">{t("admin.status.draft")}</SelectItem>
					</SelectContent>
				</Select>

				<Select value={query.author} onValueChange={(value) => onQueryChange({ author: value }, true)}>
					<SelectTrigger className="h-10 rounded-lg border-slate-300">
						<SelectValue placeholder={t("admin.postManager.authorField")} />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">{t("admin.postManager.allAuthors")}</SelectItem>
						{authors.map((author) => (
							<SelectItem key={author.id} value={author.id}>
								{author.username}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Select value={query.sort} onValueChange={(value) => onQueryChange({ sort: value as CmsPostsQueryState["sort"] }, true)}>
					<SelectTrigger className="h-10 rounded-lg border-slate-300">
						<SelectValue placeholder={t("admin.postManager.sortField")} />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="newest">{t("admin.postManager.newest")}</SelectItem>
						<SelectItem value="oldest">{t("admin.postManager.oldest")}</SelectItem>
					</SelectContent>
				</Select>
			</div>
		</>
	);
};

export default CmsPostsToolbar;
