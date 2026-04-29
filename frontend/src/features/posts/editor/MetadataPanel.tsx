import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Controller, type Control } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getCategoriesTree } from "@/features/categories/services/categories.service";
import ThumbnailUpload from "./ThumbnailUpload";
import { EXCERPT_MAX_LENGTH } from "./editorUtils";

export type EditorMetaForm = {
  title: string;
  slug: string;
  excerpt: string;
  thumbnail: string;
  categoryId: string;
  seoTitle: string;
  seoDescription: string;
};

type Props = {
  control: Control<EditorMetaForm>;
  seoCollapsedDefault?: boolean;
  role?: "admin" | "editor" | "";
  /** Called when user edits slug manually (stops auto slug from title). */
  onSlugUserEdit?: () => void;
  /** Shown under category field (e.g. submit validation). */
  categoryHint?: string;
};

type CategoryOption = { id: string; label: string };

const flattenTree = (nodes: any[], prefix = ""): CategoryOption[] => {
  const out: CategoryOption[] = [];
  for (const node of nodes || []) {
    const id = String(node?._id || node?.id || "");
    const label = `${prefix}${String(node?.name || node?.label || "")}`.trim();
    if (id && label) out.push({ id, label });
    const children = node?.children || [];
    out.push(...flattenTree(children, `${prefix}— `));
  }
  return out;
};

export default function MetadataPanel({
  control,
  seoCollapsedDefault = true,
  role = "",
  onSlugUserEdit,
  categoryHint,
}: Props) {
  const [seoOpen, setSeoOpen] = useState(!seoCollapsedDefault);

  const { data: tree = [] } = useQuery({
    queryKey: ["categoriesTree"],
    queryFn: () => getCategoriesTree(),
  });

  const categories = useMemo(() => flattenTree(tree as any[]), [tree]);

  return (
    <div className="space-y-6 lg:sticky lg:top-20">
      <Card className="rounded-xl border-slate-200 shadow-sm">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-lg">Metadata</CardTitle>
          <CardDescription>Ảnh đại diện, danh mục, slug và mô tả ngắn.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-6 pb-6 pt-0 sm:px-8">
          <Controller
            control={control}
            name="thumbnail"
            render={({ field }) => <ThumbnailUpload value={field.value} onChange={field.onChange} role={role} />}
          />

          <Controller
            control={control}
            name="categoryId"
            render={({ field }) => (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-800" htmlFor="post-category">
                  Danh mục
                </label>
                <Select value={field.value || "none"} onValueChange={(v) => field.onChange(v === "none" ? "" : v)}>
                  <SelectTrigger id="post-category" className="h-10 rounded-lg border-slate-300 bg-white">
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Chưa chọn</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">Bắt buộc trước khi gửi duyệt (Submit).</p>
                {categoryHint ? <p className="text-xs font-medium text-amber-800">{categoryHint}</p> : null}
              </div>
            )}
          />

          <Controller
            control={control}
            name="slug"
            render={({ field }) => (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-800" htmlFor="post-slug">
                  Slug
                </label>
                <Input
                  id="post-slug"
                  {...field}
                  placeholder="duong-dan-bai-viet"
                  className="rounded-lg border-slate-300"
                  onChange={(e) => {
                    onSlugUserEdit?.();
                    field.onChange(e.target.value);
                  }}
                />
                <p className="text-xs text-slate-500">
                  Tự tạo theo tiêu đề theo thời gian thực. Chỉnh tay tại đây sẽ tắt tự động cho đến khi tải lại bài.
                </p>
              </div>
            )}
          />

          <Controller
            control={control}
            name="excerpt"
            render={({ field }) => {
              const len = (field.value || "").length;
              return (
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between gap-2">
                    <label className="text-sm font-medium text-slate-800" htmlFor="post-excerpt">
                      Tóm tắt (excerpt)
                    </label>
                    <span
                      className={`text-xs tabular-nums ${len > EXCERPT_MAX_LENGTH ? "font-medium text-red-600" : "text-slate-500"}`}
                    >
                      {len} / {EXCERPT_MAX_LENGTH}
                    </span>
                  </div>
                  <Textarea
                    id="post-excerpt"
                    {...field}
                    placeholder="Mô tả ngắn hiển thị ở danh sách bài…"
                    maxLength={EXCERPT_MAX_LENGTH}
                    className="min-h-[5.5rem] rounded-lg border-slate-300"
                  />
                </div>
              );
            }}
          />
        </CardContent>
      </Card>

      <Card className="rounded-xl border-slate-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="space-y-1">
            <CardTitle className="text-lg">SEO</CardTitle>
            <CardDescription>Tùy chọn — có thể gập.</CardDescription>
          </div>
          <button
            type="button"
            onClick={() => setSeoOpen((v) => !v)}
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            {seoOpen ? "Ẩn" : "Hiện"}
          </button>
        </CardHeader>
        {seoOpen ? (
          <CardContent className="space-y-6 px-6 pb-6 pt-0 sm:px-8">
            <Controller
              control={control}
              name="seoTitle"
              render={({ field }) => (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-800">Meta title</label>
                  <Input {...field} className="rounded-lg border-slate-300" />
                </div>
              )}
            />
            <Controller
              control={control}
              name="seoDescription"
              render={({ field }) => (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-800">Meta description</label>
                  <Textarea {...field} className="min-h-[5.5rem] rounded-lg border-slate-300" />
                </div>
              )}
            />
          </CardContent>
        ) : null}
      </Card>
    </div>
  );
}
