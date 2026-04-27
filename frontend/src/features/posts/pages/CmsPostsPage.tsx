import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FileText, MoreHorizontal, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createPost, deletePost, publishPost, updatePost, type PostListQuery } from "@/services/api/postApi";
import { usePosts } from "@/apps/admin/hooks/usePosts";
import type { CmsData } from "@/shared/types/cms";
import type { Post, PostStatus } from "@/shared/types/post";
import { getApiErrorMessage } from "@/services/api/errors";

type AdminOutletContext = {
	data: CmsData;
	role: "admin" | "editor" | "";
	userId: string;
};

type FormState = {
	title: string;
	content: string;
	thumbnail: string;
};

type QueryState = {
	search: string;
	status: "all" | "draft" | "published";
	author: string;
	sort: "newest" | "oldest";
	page: number;
	limit: number;
};

const defaultQuery: QueryState = {
	search: "",
	status: "all",
	author: "all",
	sort: "newest",
	page: 1,
	limit: 10,
};

const emptyForm: FormState = {
	title: "",
	content: "",
	thumbnail: "",
};

const statusClasses: Record<PostStatus, string> = {
	draft: "border-amber-200 bg-amber-50 text-amber-700",
	published: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

const parseQuery = (searchParams: URLSearchParams): QueryState => ({
	search: searchParams.get("search") || defaultQuery.search,
	status:
		searchParams.get("status") === "draft" || searchParams.get("status") === "published"
			? (searchParams.get("status") as QueryState["status"])
			: defaultQuery.status,
	author: searchParams.get("author") || defaultQuery.author,
	sort: searchParams.get("sort") === "oldest" ? "oldest" : defaultQuery.sort,
	page: Math.max(1, Number(searchParams.get("page") || defaultQuery.page) || defaultQuery.page),
	limit: Math.max(1, Number(searchParams.get("limit") || defaultQuery.limit) || defaultQuery.limit),
});

const toApiQuery = (query: QueryState): PostListQuery => ({
	search: query.search.trim() || undefined,
	status: query.status === "all" ? undefined : query.status,
	author: query.author === "all" ? undefined : query.author,
	sort: query.sort,
	page: query.page,
	limit: query.limit,
});

const formatDateTime = (value?: string) => {
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
};

const CmsPostsPage = () => {
	const { t } = useTranslation();
	const { data, role, userId } = useOutletContext<AdminOutletContext>();
	const [searchParams, setSearchParams] = useSearchParams();
	const [query, setQuery] = useState<QueryState>(() => parseQuery(searchParams));
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [bulkAction, setBulkAction] = useState<"publish" | "draft" | "delete">("publish");
	const [open, setOpen] = useState(false);
	const [saving, setSaving] = useState(false);
	const [mutating, setMutating] = useState(false);
	const [error, setError] = useState("");
	const [editing, setEditing] = useState<Post | null>(null);
	const [form, setForm] = useState<FormState>(emptyForm);

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

	const { posts, pagination, isLoading, isFetching, refetch } = usePosts(toApiQuery(query));
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
		if (query.limit !== defaultQuery.limit) nextParams.set("limit", String(query.limit));

		setSearchParams(nextParams, { replace: true });
	}, [query, setSearchParams]);

	useEffect(() => {
		setSelectedIds([]);
	}, [query.search, query.status, query.author, query.sort]);

	const updateQuery = (patch: Partial<QueryState>, resetPage = false) => {
		setQuery((current) => ({
			...current,
			...patch,
			page: resetPage ? 1 : patch.page ?? current.page,
		}));
	};

	const canEditPost = (post: Post) => isAdmin || (role === "editor" && post.author?.id === userId);

	const openCreate = () => {
		setEditing(null);
		setForm(emptyForm);
		setError("");
		setOpen(true);
	};

	const openEdit = (post: Post) => {
		setEditing(post);
		setForm({
			title: post.title,
			content: post.content,
			thumbnail: post.thumbnail || "",
		});
		setError("");
		setOpen(true);
	};

	const refreshPosts = async () => {
		await refetch();
	};

	const saveDraft = async () => {
		try {
			setSaving(true);
			setError("");

			if (editing) {
				await updatePost(editing.id, {
					title: form.title,
					content: form.content,
					thumbnail: form.thumbnail,
				});
			} else {
				await createPost({
					title: form.title,
					content: form.content,
					thumbnail: form.thumbnail,
				});
			}

			setOpen(false);
			await refreshPosts();
			toast.success(t("admin.postManager.savePostSuccess"));
		} catch (saveError) {
			const message = getApiErrorMessage(saveError, t("admin.postManager.savePostError"));
			setError(message);
			toast.error(message);
		} finally {
			setSaving(false);
		}
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
					.filter((post) => post.status !== "published")
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

	const paginationButtons = useMemo(() => {
		const visibleCount = 5;
		const start = Math.max(1, pagination.page - Math.floor(visibleCount / 2));
		const end = Math.min(pagination.totalPages, start + visibleCount - 1);
		const adjustedStart = Math.max(1, end - visibleCount + 1);
		return Array.from({ length: end - adjustedStart + 1 }, (_, index) => adjustedStart + index);
	}, [pagination.page, pagination.totalPages]);

	return (
		<div className="space-y-5">
			<div className="rounded-xl border border-slate-200 bg-white p-5">
				<div className="flex flex-col gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h2 className="text-2xl font-semibold text-slate-900">{t("admin.postManager.title")}</h2>
						<p className="mt-1 text-sm text-slate-500">{t("admin.postManager.pageSubtitle")}</p>
					</div>
					<Button onClick={openCreate} className="h-10 rounded-lg bg-red-700 px-4 hover:bg-red-800">
						<Plus className="mr-1.5 h-4 w-4" />
						{t("admin.postManager.createButtonShort")}
					</Button>
				</div>

				<div className="mt-4 grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
					<div className="relative">
						<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
						<Input
							value={query.search}
							onChange={(event) => updateQuery({ search: event.target.value }, true)}
							placeholder={t("admin.postManager.searchPlaceholderFull")}
							className="h-10 rounded-lg border-slate-300 pl-10"
						/>
					</div>

					<Select value={query.status} onValueChange={(value) => updateQuery({ status: value as QueryState["status"] }, true)}>
						<SelectTrigger className="h-10 rounded-lg border-slate-300">
							<SelectValue placeholder={t("admin.postManager.statusField")} />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">{t("admin.postManager.allStatuses")}</SelectItem>
							<SelectItem value="published">{t("admin.status.published")}</SelectItem>
							<SelectItem value="draft">{t("admin.status.draft")}</SelectItem>
						</SelectContent>
					</Select>

					<Select value={query.author} onValueChange={(value) => updateQuery({ author: value }, true)}>
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

					<Select value={query.sort} onValueChange={(value) => updateQuery({ sort: value as QueryState["sort"] }, true)}>
						<SelectTrigger className="h-10 rounded-lg border-slate-300">
							<SelectValue placeholder={t("admin.postManager.sortField")} />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="newest">{t("admin.postManager.newest")}</SelectItem>
							<SelectItem value="oldest">{t("admin.postManager.oldest")}</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{selectedIds.length > 0 ? (
					<div className="mt-4 flex flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between">
						<p className="text-sm text-slate-700">{t("admin.postManager.selectedCount", { count: selectedIds.length })}</p>
						<div className="flex flex-wrap items-center gap-2">
							<Select value={bulkAction} onValueChange={(value) => setBulkAction(value as typeof bulkAction)}>
								<SelectTrigger className="h-9 w-[190px] rounded-lg border-slate-300 bg-white">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="publish">{t("admin.postManager.actionPublish")}</SelectItem>
									<SelectItem value="draft">{t("admin.postManager.moveToDraftMenu")}</SelectItem>
									<SelectItem value="delete">{t("admin.postManager.actionDelete")}</SelectItem>
								</SelectContent>
							</Select>
							<Button onClick={handleBulkAction} size="sm" disabled={!isAdmin || mutating || selectedIds.length === 0}>
								{t("admin.postManager.bulkExecute")}
							</Button>
						</div>
					</div>
				) : null}

				{error ? <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}

				<div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
					<Table>
						<TableHeader>
							<TableRow className="bg-slate-50 hover:bg-slate-50">
								<TableHead className="w-12">
									<Checkbox
										checked={allOnPageSelected ? true : someOnPageSelected ? "indeterminate" : false}
										onCheckedChange={(checked) => toggleSelectAllOnPage(Boolean(checked))}
										aria-label={t("admin.postManager.selectAllAria")}
									/>
								</TableHead>
								<TableHead>{t("admin.postManager.tableTitle")}</TableHead>
								<TableHead>{t("admin.postManager.tableStatus")}</TableHead>
								<TableHead>{t("admin.postManager.tableAuthor")}</TableHead>
								<TableHead>{t("admin.postManager.tableUpdated")}</TableHead>
								<TableHead className="text-right">{t("admin.postManager.tableActions")}</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{isLoading
								? Array.from({ length: 6 }).map((_, index) => (
										<TableRow key={`skeleton-${index}`}>
											<TableCell>
												<Skeleton className="h-4 w-4" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-4 w-56" />
												<Skeleton className="mt-2 h-3 w-40" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-6 w-24 rounded-full" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-4 w-24" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-4 w-28" />
											</TableCell>
											<TableCell className="text-right">
												<Skeleton className="ml-auto h-8 w-8" />
											</TableCell>
										</TableRow>
									))
								: null}

							{!isLoading
								? posts.map((post) => {
										const postId = post._id || post.id;

										return (
											<TableRow key={postId} className="align-top transition-colors hover:bg-slate-50/80">
												<TableCell>
													<Checkbox
														checked={selectedIds.includes(postId)}
														onCheckedChange={(checked) => toggleSelectRow(postId, Boolean(checked))}
														aria-label={t("admin.postManager.selectPostAria", { title: post.title })}
													/>
												</TableCell>
												<TableCell>
													<div>
														<p className="font-medium text-slate-900">{post.title}</p>
														<p className="mt-1 text-sm text-slate-500">/{post.slug}</p>
													</div>
												</TableCell>
												<TableCell>
													<Badge variant="outline" className={statusClasses[post.status]}>
														{post.status === "published" ? t("admin.status.published") : t("admin.status.draft")}
													</Badge>
												</TableCell>
												<TableCell className="text-sm text-slate-700">{post.author?.username || "-"}</TableCell>
												<TableCell className="text-sm text-slate-600">{formatDateTime(post.updatedAt || post.createdAt)}</TableCell>
												<TableCell className="text-right">
													<DropdownMenu>
														<DropdownMenuTrigger asChild>
															<Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
																<MoreHorizontal className="h-4 w-4" />
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent align="end" className="w-44">
															<DropdownMenuItem onClick={() => openEdit(post)} disabled={!canEditPost(post)}>
																{t("admin.postManager.actionEdit")}
															</DropdownMenuItem>
															{isAdmin && post.status !== "published" ? (
																<DropdownMenuItem onClick={() => handlePublish(post)}>{t("admin.postManager.actionPublish")}</DropdownMenuItem>
															) : null}
															{isAdmin && post.status !== "draft" ? (
																<DropdownMenuItem onClick={() => handleMoveToDraft(post)}>{t("admin.postManager.moveToDraftMenu")}</DropdownMenuItem>
															) : null}
															{isAdmin ? (
																<>
																	<DropdownMenuSeparator />
																	<DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => handleDelete(post)}>
																		{t("admin.postManager.actionDelete")}
																	</DropdownMenuItem>
																</>
															) : null}
														</DropdownMenuContent>
													</DropdownMenu>
												</TableCell>
											</TableRow>
										);
									})
								: null}

							{!isLoading && posts.length === 0 ? (
								<TableRow>
									<TableCell colSpan={6} className="py-16">
										<div className="flex flex-col items-center justify-center text-center">
											<div className="mb-3 rounded-full bg-slate-100 p-3">
												<FileText className="h-6 w-6 text-slate-500" />
											</div>
											<p className="text-base font-medium text-slate-900">{t("admin.postManager.noPostsTitle")}</p>
											<p className="mt-1 text-sm text-slate-500">{t("admin.postManager.noPostsDescription")}</p>
											<Button onClick={openCreate} className="mt-4 rounded-lg bg-red-700 hover:bg-red-800">
												<Plus className="mr-1.5 h-4 w-4" />
												{t("admin.postManager.createButtonShort")}
											</Button>
										</div>
									</TableCell>
								</TableRow>
							) : null}
						</TableBody>
					</Table>
				</div>

				<div className="mt-4 flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
					<p className="text-sm text-slate-500">
						{t("admin.postManager.showingRange", {
							from: (pagination.page - 1) * pagination.limit + (posts.length > 0 ? 1 : 0),
							to: (pagination.page - 1) * pagination.limit + posts.length,
							total: pagination.total,
						})}
					</p>
					<div className="flex items-center gap-1">
						<Button variant="outline" size="sm" onClick={() => updateQuery({ page: Math.max(1, query.page - 1) })} disabled={pagination.page <= 1 || mutating}>
							{t("admin.postManager.previousPage")}
						</Button>

						{paginationButtons.map((pageNumber) => (
							<Button
								key={pageNumber}
								size="sm"
								variant={pageNumber === pagination.page ? "default" : "outline"}
								className="min-w-9"
								onClick={() => updateQuery({ page: pageNumber })}
								disabled={mutating}
							>
								{pageNumber}
							</Button>
						))}

						<Button variant="outline" size="sm" onClick={() => updateQuery({ page: Math.min(pagination.totalPages || 1, query.page + 1) })} disabled={pagination.page >= pagination.totalPages || mutating}>
							{t("admin.postManager.nextPage")}
						</Button>
					</div>
				</div>

				{isFetching && !isLoading ? <p className="mt-2 text-xs text-slate-500">{t("admin.postManager.syncingFromServer")}</p> : null}
			</div>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="max-w-3xl rounded-xl border-slate-200">
					<DialogHeader>
						<DialogTitle className="text-xl font-semibold text-slate-900">
							{editing ? t("admin.postManager.modalUpdateTitle") : t("admin.postManager.modalCreateTitle")}
						</DialogTitle>
						<DialogDescription>{t("admin.postManager.modalDescription")}</DialogDescription>
					</DialogHeader>

					<div className="space-y-5">
						<div className="space-y-2">
							<label className="block text-sm font-medium text-slate-700">{t("admin.postManager.fieldTitle")}</label>
							<Input value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} className="h-11 rounded-lg border-slate-300" />
						</div>
						<div className="space-y-2">
							<label className="block text-sm font-medium text-slate-700">{t("admin.postManager.fieldThumbnail")}</label>
							<Input value={form.thumbnail} onChange={(event) => setForm((prev) => ({ ...prev, thumbnail: event.target.value }))} className="h-11 rounded-lg border-slate-300" />
						</div>
						<div className="space-y-2">
							<label className="block text-sm font-medium text-slate-700">{t("admin.postManager.fieldContent")}</label>
							<Textarea
								className="min-h-56 rounded-lg border-slate-300"
								value={form.content}
								onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
							/>
						</div>

						{error ? <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}

						<div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
							<Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={saving}>
								{t("admin.common.cancel")}
							</Button>
							<Button type="button" onClick={saveDraft} disabled={saving} className="bg-red-700 hover:bg-red-800">
								{saving ? t("admin.common.saving") : t("admin.postManager.saveDraft")}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default CmsPostsPage;