import type { PostListQuery } from "@/services/api/postApi";
import type { PostStatus } from "@/shared/types/post";
import { CMS_POSTS_DEFAULT_QUERY, type CmsPostsQueryState } from "./types";

export const cmsPostStatusBadgeClassName: Record<PostStatus, string> = {
	draft: "border-amber-200 bg-amber-50 text-amber-700",
	published: "border-emerald-200 bg-emerald-50 text-emerald-700",
	archived: "border-slate-200 bg-slate-50 text-slate-700",
};

export function parseCmsPostsQuery(searchParams: URLSearchParams): CmsPostsQueryState {
	return {
		search: searchParams.get("search") || CMS_POSTS_DEFAULT_QUERY.search,
		status:
			searchParams.get("status") === "draft" || searchParams.get("status") === "published"
				? (searchParams.get("status") as CmsPostsQueryState["status"])
				: CMS_POSTS_DEFAULT_QUERY.status,
		author: searchParams.get("author") || CMS_POSTS_DEFAULT_QUERY.author,
		sort: searchParams.get("sort") === "oldest" ? "oldest" : CMS_POSTS_DEFAULT_QUERY.sort,
		page: Math.max(1, Number(searchParams.get("page") || CMS_POSTS_DEFAULT_QUERY.page) || CMS_POSTS_DEFAULT_QUERY.page),
		limit: Math.max(1, Number(searchParams.get("limit") || CMS_POSTS_DEFAULT_QUERY.limit) || CMS_POSTS_DEFAULT_QUERY.limit),
	};
}

export function toPostListApiQuery(query: CmsPostsQueryState): PostListQuery {
	return {
		search: query.search.trim() || undefined,
		status: query.status === "all" ? undefined : query.status,
		author: query.author === "all" ? undefined : query.author,
		sort: query.sort,
		page: query.page,
		limit: query.limit,
	};
}

export function formatCmsPostDateTime(value?: string): string {
	if (!value) {
		return "-";
	}

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return "-";
	}

	return new Intl.DateTimeFormat("vi-VN", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	}).format(date);
}
