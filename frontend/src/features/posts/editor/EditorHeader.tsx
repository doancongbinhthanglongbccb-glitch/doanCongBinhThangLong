import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SaveStateIndicator from "./SaveStateIndicator";

type Status = "draft" | "pending" | "published" | "rejected";

type Props = {
  title: string;
  onTitleChange: (next: string) => void;
  status: Status;
  saving: boolean;
  dirty: boolean;
  lastSavedAt: number | null;
  error: string | null;
  role: "admin" | "editor" | "";
  previewMode: boolean;
  onTogglePreview: () => void;
  onOpenHistory: () => void;
  onBack: () => void;
  onSave: () => void;
  onSubmit: () => void;
  onPublish: () => void;
  onReject: () => void;
  disableActions?: boolean;
  /** True on /posts/new — workflow APIs need a saved post id first. */
  isNewPost?: boolean;
  /**
   * Editor: extra gate for Submit (category + body + title checks).
   * Does not affect Save draft.
   */
  editorSubmitBlocked?: boolean;
};

const statusClass: Record<Status, string> = {
  draft: "border-amber-200 bg-amber-50 text-amber-700",
  pending: "border-blue-200 bg-blue-50 text-blue-700",
  published: "border-emerald-200 bg-emerald-50 text-emerald-700",
  rejected: "border-rose-200 bg-rose-50 text-rose-700",
};

export default function EditorHeader({
  title,
  onTitleChange,
  status,
  saving,
  dirty,
  lastSavedAt,
  error,
  role,
  previewMode,
  onTogglePreview,
  onOpenHistory,
  onBack,
  onSave,
  onSubmit,
  onPublish,
  onReject,
  disableActions,
  isNewPost = false,
  editorSubmitBlocked = false,
}: Props) {
  const isAdmin = role === "admin";

  return (
    <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/75">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-3 sm:px-8 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Button type="button" variant="outline" size="sm" onClick={onBack} disabled={disableActions} className="shrink-0">
            Quay lại
          </Button>
          <div className="min-w-0 flex-1">
            <Input
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Tiêu đề bài viết…"
              className="h-10 w-full rounded-lg border-slate-300 bg-white text-base font-semibold"
              aria-required
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          <Badge variant="outline" className={`shrink-0 ${statusClass[status]}`}>
            {status}
          </Badge>
          <SaveStateIndicator saving={saving} dirty={dirty} lastSavedAt={lastSavedAt} error={error} onRetry={error ? onSave : undefined} />

          <Button type="button" variant="outline" size="sm" onClick={onOpenHistory} disabled={disableActions || isNewPost}>
            Lịch sử
          </Button>

          <Button type="button" variant="ghost" size="sm" onClick={onTogglePreview} disabled={disableActions}>
            {previewMode ? "Soạn thảo" : "Preview"}
          </Button>

          {role === "editor" ? (
            <>
              <Button type="button" variant="outline" size="sm" onClick={onSave} disabled={disableActions || saving}>
                Save draft
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={onSubmit}
                disabled={
                  disableActions || saving || status !== "draft" || isNewPost || editorSubmitBlocked
                }
              >
                Submit
              </Button>
            </>
          ) : (
            <>
              <Button type="button" variant="outline" size="sm" onClick={onSave} disabled={disableActions || saving}>
                Save
              </Button>
              <Button
                type="button"
                size="sm"
                className="bg-red-700 hover:bg-red-800"
                onClick={onPublish}
                disabled={disableActions || saving || !isAdmin || status !== "pending" || isNewPost}
              >
                Publish
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onReject}
                disabled={disableActions || saving || !isAdmin || status !== "pending" || isNewPost}
              >
                Reject
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
