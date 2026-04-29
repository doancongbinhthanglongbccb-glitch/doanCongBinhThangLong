import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import type { CmsPostsQueryState } from "../types";

type PaginationState = {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
};

type CmsPostsPaginationProps = {
	query: CmsPostsQueryState;
	postsLength: number;
	pagination: PaginationState;
	mutating: boolean;
	onQueryChange: (patch: Partial<CmsPostsQueryState>) => void;
};

const CmsPostsPagination = ({ query, postsLength, pagination, mutating, onQueryChange }: CmsPostsPaginationProps) => {
	const { t } = useTranslation();

	const pageButtons = useMemo(() => {
		const visibleCount = 5;
		const start = Math.max(1, pagination.page - Math.floor(visibleCount / 2));
		const end = Math.min(pagination.totalPages, start + visibleCount - 1);
		const adjustedStart = Math.max(1, end - visibleCount + 1);
		return Array.from({ length: end - adjustedStart + 1 }, (_, index) => adjustedStart + index);
	}, [pagination.page, pagination.totalPages]);

	return (
		<div className="mt-4 flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
			<p className="text-sm text-slate-500">
				{t("admin.postManager.showingRange", {
					from: (pagination.page - 1) * pagination.limit + (postsLength > 0 ? 1 : 0),
					to: (pagination.page - 1) * pagination.limit + postsLength,
					total: pagination.total,
				})}
			</p>
			<div className="flex items-center gap-1">
				<Button variant="outline" size="sm" onClick={() => onQueryChange({ page: Math.max(1, query.page - 1) })} disabled={pagination.page <= 1 || mutating}>
					{t("admin.postManager.previousPage")}
				</Button>

				{pageButtons.map((pageNumber) => (
					<Button
						key={pageNumber}
						size="sm"
						variant={pageNumber === pagination.page ? "default" : "outline"}
						className="min-w-9"
						onClick={() => onQueryChange({ page: pageNumber })}
						disabled={mutating}
					>
						{pageNumber}
					</Button>
				))}

				<Button
					variant="outline"
					size="sm"
					onClick={() => onQueryChange({ page: Math.min(pagination.totalPages || 1, query.page + 1) })}
					disabled={pagination.page >= pagination.totalPages || mutating}
				>
					{t("admin.postManager.nextPage")}
				</Button>
			</div>
		</div>
	);
};

export default CmsPostsPagination;
