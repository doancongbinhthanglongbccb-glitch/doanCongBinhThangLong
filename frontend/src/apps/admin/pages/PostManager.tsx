import { useMemo, useState } from "react";
import { Plus, Search, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useOutletContext } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AdminSectionCard from "@/shared/components/admin/AdminSectionCard";
import AdminStatCard from "@/shared/components/admin/AdminStatCard";
import { createPost, deletePost, publishPost, updatePost } from "@/services/api/postApi";
import type { Post, PostStatus } from "@/shared/types/post";
import { UI_TEXT } from "@/constants/uiText";

type AdminOutletContext = {
  posts: Post[];
  role: "admin" | "editor" | "";
  userId: string;
  reload: () => Promise<void>;
};

type FormState = {
  title: string;
  content: string;
  thumbnail: string;
};

const emptyForm: FormState = {
  title: "",
  content: "",
  thumbnail: "",
};

const PAGE_SIZE = 6;

const statusClasses: Record<PostStatus, string> = {
  draft: "border-amber-200 bg-amber-50 text-amber-700",
  published: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

const PostManager = () => {
  const { posts, role, userId, reload } = useOutletContext<AdminOutletContext>();
  const text = UI_TEXT.vi.admin.postManager;
  const statusText = UI_TEXT.vi.admin.status;
  const commonText = UI_TEXT.vi.admin.common;
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Post | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  const isAdmin = role === "admin";

  const uniquePosts = useMemo(() => {
    return Array.from(new Map(posts.map((post) => [post._id || post.id, post])).values());
  }, [posts]);

  const metrics = useMemo(
    () => ({
      total: uniquePosts.length,
      published: uniquePosts.filter((post) => post.status === "published").length,
      drafts: uniquePosts.filter((post) => post.status === "draft").length,
    }),
    [uniquePosts],
  );

  const filteredPosts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return uniquePosts
      .filter((post) => {
        if (!normalizedSearch) {
          return true;
        }

        return [post.title, post.slug, post.author?.username || ""].some((value) => value.toLowerCase().includes(normalizedSearch));
      })
      .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime());
  }, [uniquePosts, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / PAGE_SIZE));
  const paginatedPosts = filteredPosts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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

  const canEditPost = (post: Post) => isAdmin || (role === "editor" && post.author?.id === userId);

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
      await reload();
      toast.success(text.savePostSuccess);
    } catch {
      setError(text.savePostError);
      toast.error(text.savePostError);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async (post: Post) => {
    try {
      setError("");
      await publishPost(post.id);
      await reload();
      toast.success(text.publishPostSuccess);
    } catch {
      setError(text.publishPostError);
      toast.error(text.publishPostError);
    }
  };

  const handleDelete = async (post: Post) => {
    if (!window.confirm(`${text.confirmDeletePrefix}: ${post.title}?`)) {
      return;
    }

    try {
      setError("");
      await deletePost(post.id);
      await reload();
      toast.success(text.deletePostSuccess);
    } catch {
      setError(text.deletePostError);
      toast.error(text.deletePostError);
    }
  };

  const renderStatus = (status: PostStatus) => (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClasses[status]}`}>
      {status === "published" ? statusText.published : statusText.draft}
    </span>
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <AdminStatCard title={text.metricsTotalTitle} value={metrics.total} description={text.metricsTotalDesc} icon={Search} tone="secondary" />
        <AdminStatCard title={text.metricsPublishedTitle} value={metrics.published} description={text.metricsPublishedDesc} icon={Send} tone="success" />
        <AdminStatCard title={text.metricsDraftTitle} value={metrics.drafts} description={text.metricsDraftDesc} icon={Plus} tone="warning" />
      </div>

      <AdminSectionCard
        title={text.title}
        description={text.description}
        actions={
          <Button onClick={openCreate} className="rounded-lg bg-red-700 hover:bg-red-800">
            <Plus className="h-4 w-4" />
            {text.createPost}
          </Button>
        }
      >
        <div className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setPage(1);
                }}
                placeholder={text.searchPlaceholder}
                className="h-11 rounded-lg border-slate-300 pl-10"
              />
            </div>
            <p className="text-sm text-slate-500">
              {text.showingCountPrefix} {paginatedPosts.length} {text.showingCountMiddle} {filteredPosts.length} {text.showingCountSuffix}
            </p>
          </div>

          {error ? <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}

          <div className="overflow-hidden rounded-xl border border-slate-200">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead className="w-[34%]">{text.tableTitle}</TableHead>
                  <TableHead>{text.tableSlug}</TableHead>
                  <TableHead>{text.tableStatus}</TableHead>
                  <TableHead>{text.tableAuthor}</TableHead>
                  <TableHead className="text-right">{text.tableActions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPosts.map((post) => (
                  <TableRow key={post._id} className="align-top">
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium text-slate-900">{post.title}</p>
                        <p className="line-clamp-2 text-sm text-slate-500">{post.thumbnail || text.thumbnailFallback}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">{post.slug}</TableCell>
                    <TableCell>{renderStatus(post.status)}</TableCell>
                    <TableCell className="text-sm text-slate-600">{post.author?.username || "-"}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button size="sm" variant="secondary" onClick={() => openEdit(post)} disabled={!canEditPost(post)}>
                          {text.actionEdit}
                        </Button>
                        {isAdmin && post.status !== "published" ? (
                          <Button size="sm" onClick={() => handlePublish(post)}>
                            {text.actionPublish}
                          </Button>
                        ) : null}
                        {isAdmin ? (
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(post)}>
                            {text.actionDelete}
                          </Button>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {paginatedPosts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-sm text-slate-500">
                      {text.emptyFiltered}
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col items-start justify-between gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center">
            <p className="text-sm text-slate-500">
              {text.pageLabel} {page} / {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page <= 1}>
                {text.previousPage}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={page >= totalPages}>
                {text.nextPage}
              </Button>
            </div>
          </div>
        </div>
      </AdminSectionCard>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl rounded-xl border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-slate-900">{editing ? text.modalUpdateTitle : text.modalCreateTitle}</DialogTitle>
            <DialogDescription>{text.modalDescription}</DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">{text.fieldTitle}</label>
              <Input value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} className="h-11 rounded-lg border-slate-300" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">{text.fieldThumbnail}</label>
              <Input value={form.thumbnail} onChange={(event) => setForm((prev) => ({ ...prev, thumbnail: event.target.value }))} className="h-11 rounded-lg border-slate-300" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">{text.fieldContent}</label>
              <Textarea
                className="min-h-56 rounded-lg border-slate-300"
                value={form.content}
                onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
              />
            </div>

            {error ? <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}

            <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={saving}>
                {commonText.cancel}
              </Button>
              <Button type="button" onClick={saveDraft} disabled={saving} className="bg-red-700 hover:bg-red-800">
                {saving ? commonText.saving : text.saveDraft}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PostManager;
