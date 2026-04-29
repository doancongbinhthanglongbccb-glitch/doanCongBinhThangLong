import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import DOMPurify from "dompurify";
import axiosClient from "@/services/axiosClient";
import { ApiEndpoints } from "@/services/api/endpoints";
import { getApiErrorMessage } from "@/services/api/errors";
import {
  createPostDraft,
  publishPost,
  rejectPost,
  submitPostForReview,
  updatePostDraft,
  type PostEditorSavePayload,
} from "@/features/posts/editor/postEditorApi";
import { isEditorHtmlEmpty } from "@/features/posts/editor/editorUtils";
import type { CmsData } from "@/shared/types/cms";
import type { Post } from "@/shared/types/post";
import { ROUTES } from "@/lib/constants";
import EditorHeader from "@/features/posts/editor/EditorHeader";
import EditorContent from "@/features/posts/editor/EditorContent";
import EditorSidebar, { type EditorMetaForm } from "@/features/posts/editor/EditorSidebar";
import { slugify } from "@/features/posts/editor/slug";
import RevisionDialog from "@/features/posts/editor/RevisionDialog";
import { queryClient } from "@/app/providers/QueryProvider";

type AdminOutletContext = {
  data: CmsData;
  role: "admin" | "editor" | "";
  userId: string;
  canManageConfig: boolean;
  updateSiteData: (updater: CmsData | ((previous: CmsData) => CmsData)) => Promise<void>;
  reload: () => Promise<void>;
};

const metaSchema = z.object({
  title: z.string().trim().min(1, "Tiêu đề bắt buộc"),
  slug: z.string().trim().min(1, "Slug bắt buộc"),
  excerpt: z.string().trim().max(500).optional().default(""),
  thumbnail: z.string().trim().max(2048).optional().default(""),
  categoryId: z.string().trim().optional().default(""),
  seoTitle: z.string().trim().max(200).optional().default(""),
  seoDescription: z.string().trim().max(500).optional().default(""),
});

type WorkflowStatus = "draft" | "pending" | "published" | "rejected";

const PostEditorPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { role } = useOutletContext<AdminOutletContext>();

  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [categoryHint, setCategoryHint] = useState<string | undefined>();

  const [contentHtml, setContentHtml] = useState<string>("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const autosaveTimer = useRef<number | null>(null);
  const saveAbortRef = useRef<AbortController | null>(null);
  const saveSeq = useRef(0);
  const isHydratingRef = useRef(false);

  const isNew = !id || id === "new";

  const { data: post, isLoading } = useQuery({
    queryKey: ["cmsPost", id],
    enabled: !isNew,
    queryFn: async (): Promise<Post> => {
      const { data } = await axiosClient.get(ApiEndpoints.cmsPostById(id!));
      return data as Post;
    },
  });

  const form = useForm<EditorMetaForm>({
    resolver: zodResolver(metaSchema),
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      thumbnail: "",
      categoryId: "",
      seoTitle: "",
      seoDescription: "",
    },
    mode: "onChange",
  });

  // Hydrate when post loads
  useEffect(() => {
    isHydratingRef.current = true;
    if (!post) {
      if (isNew) {
        form.reset({
          title: "",
          slug: "",
          excerpt: "",
          thumbnail: "",
          categoryId: "",
          seoTitle: "",
          seoDescription: "",
        });
        setContentHtml("");
        setSlugManuallyEdited(false);
        setDirty(false);
      }
      isHydratingRef.current = false;
      return;
    }

    form.reset({
      title: post.title || "",
      slug: post.slug || "",
      excerpt: (post as any).excerpt || "",
      thumbnail: post.thumbnail || "",
      categoryId: ((post as any).categoryIds?.[0] as string) || "",
      seoTitle: (post as any).seoTitle || "",
      seoDescription: (post as any).seoDescription || "",
    });
    setContentHtml(post.content || "");
    setDirty(false);
    setError(null);
    setSlugManuallyEdited(true); // existing post: don't auto-overwrite
    isHydratingRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post, isNew]);

  const status: WorkflowStatus = useMemo(() => {
    const wf = (post as any)?.workflowStatus;
    if (wf === "pending" || wf === "published" || wf === "rejected" || wf === "draft") return wf;
    return (post as any)?.status === "published" ? "published" : "draft";
  }, [post]);

  // Auto-generate slug from title (only if user hasn't edited manually)
  const titleValue = form.watch("title");
  const watchedCategoryId = form.watch("categoryId");

  useEffect(() => {
    setCategoryHint(undefined);
  }, [watchedCategoryId]);

  useEffect(() => {
    if (slugManuallyEdited) return;
    const next = slugify(titleValue);
    if (next) {
      form.setValue("slug", next, { shouldDirty: true, shouldValidate: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [titleValue, slugManuallyEdited]);

  // Track dirty
  useEffect(() => {
    const sub = form.watch(() => {
      if (isHydratingRef.current) return;
      setDirty(true);
    });
    return () => sub.unsubscribe();
  }, [form]);

  const saveDraftMutation = useMutation({
    mutationFn: async (vars?: { silent?: boolean }) => {
      const values = metaSchema.parse(form.getValues());
      const payload: PostEditorSavePayload = {
        title: values.title,
        slug: values.slug,
        content: contentHtml,
        thumbnail: values.thumbnail,
        excerpt: values.excerpt,
        seoTitle: values.seoTitle,
        seoDescription: values.seoDescription,
        categoryIds: values.categoryId ? [values.categoryId] : [],
      };

      saveAbortRef.current?.abort();
      const controller = new AbortController();
      saveAbortRef.current = controller;
      const seq = ++saveSeq.current;

      setSaving(true);
      setError(null);

      if (isNew) {
        const data = await createPostDraft(payload, controller.signal);
        if (seq !== saveSeq.current) return data;
        return data;
      }

      const data = await updatePostDraft(id!, payload, controller.signal);
      if (seq !== saveSeq.current) return data;
      return data;
    },
    onSuccess: (saved: any, vars) => {
      setSaving(false);
      setLastSavedAt(Date.now());
      setDirty(false);
      setError(null);
      if (isNew && saved?.id) {
        navigate(`${ROUTES.ADMIN_POSTS}/${saved.id}/edit`, { replace: true });
      }
      if (!vars?.silent) {
        toast.success("Đã lưu");
      }
    },
    onError: (e: any) => {
      setSaving(false);
      if (e?.name === "CanceledError") return;
      const msg = getApiErrorMessage(e, "Lưu thất bại");
      setError(msg);
      toast.error(msg);
    },
  });

  const workflowMutation = useMutation({
    mutationFn: async (action: "submit" | "publish" | "reject") => {
      if (!id || id === "new") throw new Error("Missing post id");
      if (action === "submit") return submitPostForReview(id);
      if (action === "publish") return publishPost(id);
      const note = window.prompt("Nhập lý do từ chối") || "";
      if (!note.trim()) throw new Error("Rejection note is required");
      return rejectPost(id, note.trim());
    },
    onSuccess: () => {
      toast.success("Thành công");
      if (id && id !== "new") {
        void queryClient.invalidateQueries({ queryKey: ["cmsPost", id] });
        void queryClient.invalidateQueries({ queryKey: ["postRevisions", id] });
      }
    },
    onError: (e: any) => {
      const msg = getApiErrorMessage(e, "Thao tác thất bại");
      setError(msg);
      toast.error(msg);
    },
  });

  const disableActions = saving || saveDraftMutation.isPending || workflowMutation.isPending;

  const editorSubmitBlocked =
    role === "editor" &&
    (!titleValue.trim() || !watchedCategoryId || isEditorHtmlEmpty(contentHtml));

  const runEditorSubmit = useCallback(async () => {
    setCategoryHint(undefined);
    if (!form.getValues("title").trim()) {
      toast.error("Tiêu đề bắt buộc");
      return;
    }
    if (!form.getValues("categoryId")) {
      setCategoryHint("Vui lòng chọn danh mục.");
      toast.error("Chọn danh mục trước khi gửi duyệt");
      return;
    }
    if (isEditorHtmlEmpty(contentHtml)) {
      toast.error("Nội dung bài viết chưa có");
      return;
    }
    await workflowMutation.mutateAsync("submit");
  }, [contentHtml, form, workflowMutation]);

  // Autosave ~3.5s when dirty
  useEffect(() => {
    if (!dirty) return;
    if (autosaveTimer.current) window.clearTimeout(autosaveTimer.current);
    autosaveTimer.current = window.setTimeout(() => {
      void saveDraftMutation.mutateAsync({ silent: true });
    }, 3500);
    return () => {
      if (autosaveTimer.current) window.clearTimeout(autosaveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dirty, contentHtml, titleValue]);

  // Prevent browser navigation
  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  // Ctrl+S
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        void saveDraftMutation.mutateAsync({ silent: false });
      }
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        if (disableActions || isNew) return;
        if (role === "editor" && status === "draft") {
          event.preventDefault();
          void runEditorSubmit();
        }
        if (role === "admin" && status === "pending") {
          event.preventDefault();
          void workflowMutation.mutateAsync("publish");
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [saveDraftMutation, disableActions, isNew, role, runEditorSubmit, status, workflowMutation]);

  const onBack = () => {
    if (dirty && !window.confirm("Bạn có thay đổi chưa lưu. Thoát?")) return;
    navigate(ROUTES.ADMIN_POSTS);
  };

  if (isLoading) {
    return <div className="py-10 text-sm text-slate-600">Loading…</div>;
  }

  return (
    <div className="space-y-6">
      {(post as any)?.workflowStatus === "rejected" && (post as any)?.review?.decisionNote ? (
        <div className="mx-auto max-w-6xl rounded-lg border border-rose-200 bg-rose-50 px-6 py-2 text-sm text-rose-800 sm:px-8">
          <strong>Rejected:</strong> {(post as any)?.review?.decisionNote}
        </div>
      ) : null}
      {error ? (
        <div className="mx-auto max-w-6xl rounded-lg border border-red-200 bg-red-50 px-6 py-2 text-sm text-red-700 sm:px-8">
          {error}
        </div>
      ) : null}

      <EditorHeader
        title={form.watch("title")}
        onTitleChange={(next) => {
          form.setValue("title", next, { shouldDirty: true, shouldValidate: true });
        }}
        status={status}
        saving={saving || saveDraftMutation.isPending}
        dirty={dirty}
        lastSavedAt={lastSavedAt}
        error={error}
        role={role}
        previewMode={previewMode}
        onTogglePreview={() => setPreviewMode((v) => !v)}
        onOpenHistory={() => {
          if (id && id !== "new") setHistoryOpen(true);
        }}
        onBack={onBack}
        onSave={() => void saveDraftMutation.mutateAsync({ silent: false })}
        onSubmit={() => void runEditorSubmit()}
        onPublish={() => void workflowMutation.mutateAsync("publish")}
        onReject={() => void workflowMutation.mutateAsync("reject")}
        disableActions={disableActions}
        isNewPost={isNew}
        editorSubmitBlocked={editorSubmitBlocked}
      />

      <div className="mx-auto grid max-w-6xl gap-8 px-6 pb-12 pt-2 sm:px-8 lg:grid-cols-[1fr_380px] lg:items-start">
        <section className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Nội dung</h2>
          {previewMode ? (
            <div className="space-y-6 rounded-xl border border-slate-200 bg-white px-6 py-8 shadow-sm sm:px-8">
              {(form.getValues().thumbnail || "") ? (
                <img
                  src={form.getValues().thumbnail}
                  alt="thumbnail"
                  className="mx-auto max-h-64 w-full max-w-[700px] rounded-xl border border-slate-200 object-cover"
                />
              ) : null}
              <div className="mx-auto max-w-[700px] space-y-4 leading-relaxed">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">{form.getValues().title}</h1>
                {form.getValues().excerpt ? <p className="text-slate-600">{form.getValues().excerpt}</p> : null}
                <div
                  className="prose prose-slate max-w-none prose-headings:tracking-tight prose-p:leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(contentHtml) }}
                />
              </div>
            </div>
          ) : (
            <EditorContent
              hydrateKey={`${id ?? "new"}-${isLoading ? "loading" : "ready"}`}
              initialHtml={contentHtml}
              onChange={(html) => {
                setContentHtml(html);
                setDirty(true);
              }}
              editable={true}
              role={role}
            />
          )}
        </section>

        <EditorSidebar
          control={form.control}
          seoCollapsedDefault={true}
          role={role}
          onSlugUserEdit={() => setSlugManuallyEdited(true)}
          categoryHint={categoryHint}
        />
      </div>

      {id && id !== "new" ? (
        <RevisionDialog
          open={historyOpen}
          onOpenChange={setHistoryOpen}
          postId={id}
          role={role}
          isDirty={dirty}
          onAfterRestore={async () => {
            await queryClient.invalidateQueries({ queryKey: ["cmsPost", id] });
            await queryClient.invalidateQueries({ queryKey: ["postRevisions", id] });
          }}
        />
      ) : null}
    </div>
  );
};

export default PostEditorPage;

