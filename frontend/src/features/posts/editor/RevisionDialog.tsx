import { useMutation, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ApiEndpoints } from "@/services/api/endpoints";
import axiosClient from "@/services/axiosClient";
import { getApiErrorMessage } from "@/services/api/errors";
import DOMPurify from "dompurify";
import { useMemo, useState } from "react";

type RevisionItem = {
  _id: string;
  version: number;
  action: string;
  createdAt: string;
  actorId?: {
    _id?: string;
    username?: string;
  };
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
  role: "admin" | "editor" | "";
  onAfterRestore: () => void;
  isDirty?: boolean;
};

const formatDateTime = (value: string) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(d);
};

export default function RevisionDialog({ open, onOpenChange, postId, role, onAfterRestore, isDirty }: Props) {
  const isAdmin = role === "admin";
  const [viewing, setViewing] = useState<any | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["postRevisions", postId],
    enabled: open && Boolean(postId),
    queryFn: async () => {
      const { data } = await axiosClient.get<{ items: RevisionItem[] }>(ApiEndpoints.postRevisions(postId));
      return data.items || [];
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async (revId: string) => {
      await axiosClient.post(ApiEndpoints.postRevisionRestore(postId, revId), {});
    },
    onSuccess: () => {
      onAfterRestore();
      onOpenChange(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-xl border-slate-200">
        <DialogHeader>
          <DialogTitle>Lịch sử phiên bản</DialogTitle>
        </DialogHeader>

        {isLoading ? <div className="text-sm text-slate-600">Đang tải…</div> : null}

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {getApiErrorMessage(error, "Không tải được lịch sử")}
          </div>
        ) : null}

        <div className="space-y-2">
          {(data || []).map((rev) => (
            <div key={rev._id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900">v{rev.version}</span>
                  <span className="text-xs rounded-full bg-slate-100 px-2 py-0.5 text-slate-700">{rev.action}</span>
                </div>
                <div className="mt-1 text-xs text-slate-600">
                  {formatDateTime(rev.createdAt)} · {rev.actorId?.username || "unknown"}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    const { data } = await axiosClient.get(ApiEndpoints.postRevisionById(postId, rev._id));
                    setViewing(data);
                  }}
                >
                  View
                </Button>
                {isAdmin ? (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      if (isDirty && !window.confirm("Bạn đang có thay đổi chưa lưu. Restore sẽ ghi đè. Tiếp tục?")) {
                        return;
                      }
                      restoreMutation.mutate(rev._id);
                    }}
                    disabled={restoreMutation.isPending}
                  >
                    Restore
                  </Button>
                ) : null}
              </div>
            </div>
          ))}

          {!isLoading && (data || []).length === 0 ? <div className="text-sm text-slate-600">Chưa có revision.</div> : null}
        </div>

        {viewing ? (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900">Revision detail</p>
              <Button type="button" variant="outline" size="sm" onClick={() => setViewing(null)}>
                Close
              </Button>
            </div>
            <div className="mt-2 text-xs text-slate-600">
              v{viewing?.version} · {viewing?.action} · {formatDateTime(viewing?.createdAt)}
            </div>
            <div className="mt-3 space-y-2">
              <div className="text-sm font-semibold text-slate-900">{viewing?.snapshot?.title}</div>
              <div className="text-xs text-slate-600">/{viewing?.snapshot?.slug}</div>
              {viewing?.snapshot?.excerpt ? <div className="text-sm text-slate-700">{viewing.snapshot.excerpt}</div> : null}
              <div
                className="prose prose-slate max-w-none rounded-lg bg-white p-3"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(viewing?.snapshot?.content || "") }}
              />
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

