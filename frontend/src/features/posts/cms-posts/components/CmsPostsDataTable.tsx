import { FileText, MoreHorizontal, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Post } from "@/shared/types/post";
import { cmsPostStatusBadgeClassName, formatCmsPostDateTime } from "../query.utils";

type CmsPostsDataTableProps = {
	isLoading: boolean;
	posts: Post[];
	selectedIds: string[];
	allOnPageSelected: boolean;
	someOnPageSelected: boolean;
	onToggleSelectAll: (checked: boolean) => void;
	onToggleSelectRow: (postId: string, checked: boolean) => void;
	canEditPost: (post: Post) => boolean;
	isAdmin: boolean;
	onCreateClick: () => void;
	onEditPost: (post: Post) => void;
	onPublishPost: (post: Post) => void;
	onMoveToDraft: (post: Post) => void;
	onDeletePost: (post: Post) => void;
};

const CmsPostsDataTable = ({
	isLoading,
	posts,
	selectedIds,
	allOnPageSelected,
	someOnPageSelected,
	onToggleSelectAll,
	onToggleSelectRow,
	canEditPost,
	isAdmin,
	onCreateClick,
	onEditPost,
	onPublishPost,
	onMoveToDraft,
	onDeletePost,
}: CmsPostsDataTableProps) => {
	const { t } = useTranslation();

	return (
		<div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
			<Table>
				<TableHeader>
					<TableRow className="bg-slate-50 hover:bg-slate-50">
						<TableHead className="w-12">
							<Checkbox
								checked={allOnPageSelected ? true : someOnPageSelected ? "indeterminate" : false}
								onCheckedChange={(checked) => onToggleSelectAll(Boolean(checked))}
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
												onCheckedChange={(checked) => onToggleSelectRow(postId, Boolean(checked))}
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
											<Badge variant="outline" className={cmsPostStatusBadgeClassName[post.status]}>
												{post.status === "published" ? t("admin.status.published") : t("admin.status.draft")}
											</Badge>
										</TableCell>
										<TableCell className="text-sm text-slate-700">{post.author?.username || "-"}</TableCell>
										<TableCell className="text-sm text-slate-600">{formatCmsPostDateTime(post.updatedAt || post.createdAt)}</TableCell>
										<TableCell className="text-right">
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
														<MoreHorizontal className="h-4 w-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end" className="w-44">
													<DropdownMenuItem onClick={() => onEditPost(post)} disabled={!canEditPost(post)}>
														{t("admin.postManager.actionEdit")}
													</DropdownMenuItem>
													{isAdmin && post.workflowStatus === "pending" ? (
														<DropdownMenuItem onClick={() => onPublishPost(post)}>{t("admin.postManager.actionPublish")}</DropdownMenuItem>
													) : null}
													{isAdmin && post.status !== "draft" ? (
														<DropdownMenuItem onClick={() => onMoveToDraft(post)}>{t("admin.postManager.moveToDraftMenu")}</DropdownMenuItem>
													) : null}
													{isAdmin ? (
														<>
															<DropdownMenuSeparator />
															<DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => onDeletePost(post)}>
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
									<Button onClick={onCreateClick} className="mt-4 rounded-lg bg-red-700 hover:bg-red-800">
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
	);
};

export default CmsPostsDataTable;
