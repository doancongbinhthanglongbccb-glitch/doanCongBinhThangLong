import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useNavigate, useOutletContext, useSearchParams } from "react-router-dom";
import CmsPostsBulkBar from "@/features/posts/cms-posts/components/CmsPostsBulkBar";
import CmsPostsDataTable from "@/features/posts/cms-posts/components/CmsPostsDataTable";
import CmsPostsPagination from "@/features/posts/cms-posts/components/CmsPostsPagination";
import CmsPostsToolbar from "@/features/posts/cms-posts/components/CmsPostsToolbar";
import { toPostListApiQuery, parseCmsPostsQuery } from "@/features/posts/cms-posts/query.utils";
import { CMS_POSTS_DEFAULT_QUERY, type CmsPostsOutletContext, type CmsPostsQueryState } from "@/features/posts/cms-posts/types";
import { usePosts } from "@/apps/admin/hooks/usePosts";
import { deletePost, publishPost, updatePost } from "@/services/api/postApi";
import { getApiErrorMessage } from "@/services/api/errors";
import type { Post } from "@/shared/types/post";
import { ROUTES } from "@/lib/constants";

const CmsPostsPage = () => {
	const { t } = useTranslation();
	const { data, role, userId } = useOutletContext<CmsPostsOutletContext>();
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();
	const [query, setQuery] = useState<CmsPostsQueryState>(() => parseCmsPostsQuery(searchParams));
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [bulkAction, setBulkAction] = useState<"publish" | "draft" | "delete">("publish");
	const [mutating, setMutating] = useState(false);
	const [error, setError] = useState("");

	const isAdmin = role === "admin";
	const authors = useMemo(
		() =>
			Array.from(
				new Map(
					(data.activities || [])
						.filter((post) => post.author?.id)
						.map((post) => [post.author?.id || "", post.author?.username || t("admin.postManager.unknownAuthor")]),
				).entries(),
			).map(([id, username]) => ({ id, username })),
		[data.activities, t],
	);

	const { posts, pagination, isLoading, isFetching, refetch } = usePosts(toPostListApiQuery(query));
	const currentPageIds = posts.map((post) => post._id || post.id).filter(Boolean);
	const allOnPageSelected = currentPageIds.length > 0 && currentPageIds.every((id) => selectedIds.includes(id));
	const someOnPageSelected = currentPageIds.some((id) => selectedIds.includes(id));
	const selectedPosts = useMemo(
		() => (data.activities || []).filter((post) => selectedIds.includes(post._id || post.id)),
		[data.activities, selectedIds],
	);

	useEffect(() => {
		const nextParams = new URLSearchParams();

		if (query.search.trim()) nextParams.set("search", query.search.trim());
		if (query.status !== "all") nextParams.set("status", query.status);
		if (query.author !== "all") nextParams.set("author", query.author);
		if (query.sort !== "newest") nextParams.set("sort", query.sort);
		if (query.page !== 1) nextParams.set("page", String(query.page));
		if (query.limit !== CMS_POSTS_DEFAULT_QUERY.limit) nextParams.set("limit", String(query.limit));

		setSearchParams(nextParams, { replace: true });
	}, [query, setSearchParams]);

	useEffect(() => {
		setSelectedIds([]);
	}, [query.search, query.status, query.author, query.sort]);

	const updateQuery = (patch: Partial<CmsPostsQueryState>, resetPage = false) => {
		setQuery((current) => ({
			...current,
			...patch,
			page: resetPage ? 1 : patch.page ?? current.page,
		}));
	};

	const canEditPost = (post: Post) => isAdmin || (role === "editor" && post.author?.id === userId);

	const openCreate = () => {
		navigate(`${ROUTES.ADMIN_POSTS}/new`);
	};

	const openEdit = (post: Post) => {
		navigate(`${ROUTES.ADMIN_POSTS}/${post.id}/edit`);
	};

	const refreshPosts = async () => {
		await refetch();
	};

	const mutatePost = async (runner: () => Promise<unknown>, successMessage: string, fallbackMessage: string) => {
		try {
			setMutating(true);
			setError("");
			await runner();
			await refreshPosts();
			setSelectedIds([]);
			toast.success(successMessage);
		} catch (mutationError) {
			const message = getApiErrorMessage(mutationError, fallbackMessage);
			setError(message);
			toast.error(message);
		} finally {
			setMutating(false);
		}
	};

	const handlePublish = (post: Post) =>
		mutatePost(() => publishPost(post.id), t("admin.postManager.publishPostSuccess"), t("admin.postManager.publishPostError"));

	const handleMoveToDraft = (post: Post) =>
		mutatePost(
			() => updatePost(post.id, { status: "draft" }),
			t("admin.postManager.moveToDraftSuccess"),
			t("admin.postManager.moveToDraftError"),
		);

	const handleDelete = async (post: Post) => {
		if (!window.confirm(`${t("admin.postManager.confirmDeletePrefix")}: ${post.title}?`)) {
			return;
		}

		await mutatePost(() => deletePost(post.id), t("admin.postManager.deletePostSuccess"), t("admin.postManager.deletePostError"));
	};

	const toggleSelectAllOnPage = (checked: boolean) => {
		if (checked) {
			setSelectedIds((prev) => Array.from(new Set([...prev, ...currentPageIds])));
			return;
		}

		setSelectedIds((prev) => prev.filter((id) => !currentPageIds.includes(id)));
	};

	const toggleSelectRow = (id: string, checked: boolean) => {
		if (checked) {
			setSelectedIds((prev) => Array.from(new Set([...prev, id])));
			return;
		}

		setSelectedIds((prev) => prev.filter((currentId) => currentId !== id));
	};

	const handleBulkAction = async () => {
		if (selectedPosts.length === 0) {
			return;
		}

		if (bulkAction === "delete" && !window.confirm(t("admin.postManager.bulkDeleteConfirm", { count: selectedPosts.length }))) {
			return;
		}

		try {
			setMutating(true);
			setError("");

			const operations: Array<{ id: string; title: string; task: () => Promise<unknown> }> = [];

			if (bulkAction === "publish") {
				selectedPosts
					.filter((post) => post.workflowStatus === "pending")
					.forEach((post) => {
						operations.push({
							id: post.id,
							title: post.title,
							task: () => publishPost(post.id),
						});
					});
			}

			if (bulkAction === "draft") {
				selectedPosts.forEach((post) => {
					operations.push({
						id: post.id,
						title: post.title,
						task: () => updatePost(post.id, { status: "draft" }),
					});
				});
			}

			if (bulkAction === "delete") {
				selectedPosts.forEach((post) => {
					operations.push({
						id: post.id,
						title: post.title,
						task: () => deletePost(post.id),
					});
				});
			}

			if (operations.length === 0) {
				toast.success(t("admin.postManager.bulkActionSuccess"));
				setSelectedIds([]);
				return;
			}

			const results = await Promise.allSettled(operations.map((operation) => operation.task()));
			const failedOperations = operations.filter((_, index) => results[index]?.status === "rejected");

			await refreshPosts();

			if (failedOperations.length > 0) {
				const failedTitles = failedOperations.map((operation) => operation.title);
				const message = t("admin.postManager.bulkFailed", {
					count: failedTitles.length,
					titles: failedTitles.join(", "),
				});
				setError(message);
				toast.error(message);
			} else {
				toast.success(t("admin.postManager.bulkActionSuccess"));
			}
		} catch (bulkError) {
			const message = getApiErrorMessage(bulkError, t("admin.postManager.bulkError"));
			setError(message);
			toast.error(message);
		} finally {
			setSelectedIds([]);
			setMutating(false);
		}
	};

	return (
		<div className="space-y-5">
			<div className="rounded-xl border border-slate-200 bg-white p-5">
				<CmsPostsToolbar query={query} authors={authors} onQueryChange={updateQuery} onCreateClick={openCreate} />

				<CmsPostsBulkBar
					selectedCount={selectedIds.length}
					bulkAction={bulkAction}
					onBulkActionChange={setBulkAction}
					onExecute={handleBulkAction}
					executeDisabled={!isAdmin || mutating || selectedIds.length === 0}
				/>

				{error ? <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}

				<CmsPostsDataTable
					isLoading={isLoading}
					posts={posts}
					selectedIds={selectedIds}
					allOnPageSelected={allOnPageSelected}
					someOnPageSelected={someOnPageSelected}
					onToggleSelectAll={toggleSelectAllOnPage}
					onToggleSelectRow={toggleSelectRow}
					canEditPost={canEditPost}
					isAdmin={isAdmin}
					onCreateClick={openCreate}
					onEditPost={openEdit}
					onPublishPost={handlePublish}
					onMoveToDraft={handleMoveToDraft}
					onDeletePost={handleDelete}
				/>

				<CmsPostsPagination query={query} postsLength={posts.length} pagination={pagination} mutating={mutating} onQueryChange={updateQuery} />

				{isFetching && !isLoading ? <p className="mt-2 text-xs text-slate-500">{t("admin.postManager.syncingFromServer")}</p> : null}
			</div>
		</div>
	);
};

export default CmsPostsPage;
