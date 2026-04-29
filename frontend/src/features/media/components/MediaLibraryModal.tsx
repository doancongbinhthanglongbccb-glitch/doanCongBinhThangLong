import { useEffect, useMemo, useState } from "react";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { deleteMedia, listMedia, uploadMedia } from "@/features/media/services/media.service";
import type { MediaAsset } from "@/features/media/types/media.types";
import { queryClient } from "@/app/providers/QueryProvider";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (asset: MediaAsset) => void;
  role: "admin" | "editor" | "";
  /** When true, uploading auto-selects and closes modal. */
  autoSelectOnUpload?: boolean;
};

const PAGE_SIZE = 20;

export default function MediaLibraryModal({ open, onOpenChange, onSelect, role, autoSelectOnUpload = false }: Props) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(t);
  }, [search]);

  const query = useInfiniteQuery({
    queryKey: ["media", debouncedSearch],
    enabled: open,
    initialPageParam: 1,
    queryFn: ({ pageParam }) => listMedia({ page: Number(pageParam), limit: PAGE_SIZE, search: debouncedSearch || undefined }),
    getNextPageParam: (lastPage) => {
      const page = lastPage.page || 1;
      const pages = lastPage.pages || 1;
      return page < pages ? page + 1 : undefined;
    },
  });

  const items: MediaAsset[] = useMemo(() => {
    const pages = query.data?.pages || [];
    return pages.flatMap((p) => p.items || []);
  }, [query.data]);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => uploadMedia(file),
    onSuccess: (result) => {
      toast.success("Upload thành công");
      void queryClient.invalidateQueries({ queryKey: ["media"] });
      if (autoSelectOnUpload && result?.item) {
        onSelect(result.item);
        onOpenChange(false);
      }
    },
    onError: () => toast.error("Upload thất bại"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => deleteMedia(id),
    onSuccess: () => {
      toast.success("Đã xoá");
      void queryClient.invalidateQueries({ queryKey: ["media"] });
    },
    onError: () => toast.error("Xoá thất bại"),
  });

  const handlePick = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await uploadMutation.mutateAsync(file);
    event.target.value = "";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl rounded-xl border-slate-200">
        <DialogHeader>
          <DialogTitle>Media Library</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search filename…" className="sm:max-w-sm" />
          <div className="flex items-center gap-2">
            <Input type="file" accept="image/*" onChange={handlePick} disabled={uploadMutation.isPending} />
          </div>
        </div>

        {query.isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-lg" />
            ))}
          </div>
        ) : null}

        {!query.isLoading && items.length === 0 ? <div className="text-sm text-slate-600">No media yet.</div> : null}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {items.map((asset) => (
            <div key={asset._id} className="group relative overflow-hidden rounded-lg border border-slate-200 bg-white">
              <button
                type="button"
                className="block w-full"
                onClick={() => {
                  onSelect(asset);
                  onOpenChange(false);
                }}
              >
                <img src={asset.url} alt={asset.originalName} className="h-28 w-full object-cover" loading="lazy" />
              </button>
              <div className="px-2 py-1">
                <div className="truncate text-xs font-medium text-slate-700">{asset.originalName}</div>
                <div className="truncate text-[11px] text-slate-500">{asset.createdBy && typeof asset.createdBy === "object" ? asset.createdBy.username : ""}</div>
              </div>

              <div className="absolute right-2 top-2 hidden gap-2 group-hover:flex">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="h-8 px-2"
                  onClick={() => {
                    onSelect(asset);
                    onOpenChange(false);
                  }}
                >
                  Select
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8 px-2"
                  onClick={() => deleteMutation.mutate(asset._id)}
                  disabled={deleteMutation.isPending || role === ""}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center pt-2">
          {query.hasNextPage ? (
            <Button type="button" variant="outline" onClick={() => query.fetchNextPage()} disabled={query.isFetchingNextPage}>
              {query.isFetchingNextPage ? "Loading…" : "Load more"}
            </Button>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

