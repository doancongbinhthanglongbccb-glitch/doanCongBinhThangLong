import type { CmsData } from "@/shared/types/cms";

/** Outlet context consumed by CMS post list (subset of admin shell). */
export type CmsPostsOutletContext = {
	data: CmsData;
	role: "admin" | "editor" | "";
	userId: string;
};

export type CmsPostsQueryState = {
	search: string;
	status: "all" | "draft" | "published";
	author: string;
	sort: "newest" | "oldest";
	page: number;
	limit: number;
};

export const CMS_POSTS_DEFAULT_QUERY: CmsPostsQueryState = {
	search: "",
	status: "all",
	author: "all",
	sort: "newest",
	page: 1,
	limit: 10,
};
