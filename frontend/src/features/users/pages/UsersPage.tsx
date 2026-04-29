import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Search, Users as UsersIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorMessage } from "@/services/api/errors";
import { getAuthUser } from "@/features/auth/services/auth.service";
import type { UserListItem, UserRole } from "../types/user.types";
import { listUsers, updateUserRole } from "../services/users.service";

type QueryState = {
  search: string;
  role: "all" | UserRole;
  sort: "newest" | "oldest";
  page: number;
  limit: number;
};

const defaultQuery: QueryState = {
  search: "",
  role: "all",
  sort: "newest",
  page: 1,
  limit: 20,
};

const formatDateTime = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const UsersPage = () => {
  const { t } = useTranslation();
  const me = getAuthUser();
  const myId = me?.id || (me as any)?._id || "";

  const [query, setQuery] = useState<QueryState>(defaultQuery);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<UserListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [savingId, setSavingId] = useState<string | null>(null);

  const canPrev = query.page > 1;
  const canNext = query.page < pages;

  const load = async (nextQuery: QueryState) => {
    try {
      setLoading(true);
      const res = await listUsers({
        search: nextQuery.search,
        role: nextQuery.role,
        sort: nextQuery.sort,
        page: nextQuery.page,
        limit: nextQuery.limit,
      });
      setItems(res.items || []);
      setTotal(res.total || 0);
      setPages(res.pages || 1);
    } catch (err) {
      toast.error(getApiErrorMessage(err, t("admin.users.loadError")));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.page, query.limit, query.sort, query.role]);

  const headerSummary = useMemo(() => {
    return t("admin.users.summary", { total });
  }, [t, total]);

  const onSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next = { ...query, page: 1, search: query.search.trim() };
    setQuery(next);
    await load(next);
  };

  const onChangeRole = async (user: UserListItem, nextRole: UserRole) => {
    if (user.id === myId) {
      toast.error(t("admin.users.cannotChangeSelf"));
      return;
    }

    if (!window.confirm(t("admin.users.confirmRoleChange", { username: user.username, role: nextRole }))) {
      return;
    }

    try {
      setSavingId(user.id);
      const updated = await updateUserRole(user.id, nextRole);
      setItems((prev) => prev.map((u) => (u.id === user.id ? { ...u, role: updated.role } : u)));
      toast.success(t("admin.users.updated"));
    } catch (err) {
      toast.error(getApiErrorMessage(err, t("admin.users.updateError")));
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700">
            <UsersIcon className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">{t("admin.users.title")}</div>
            <div className="text-xs text-slate-500">{headerSummary}</div>
          </div>
        </div>

        <form onSubmit={onSearchSubmit} className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-[280px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={query.search}
              onChange={(e) => setQuery((prev) => ({ ...prev, search: e.target.value }))}
              placeholder={t("admin.users.searchPlaceholder")}
              className="h-10 pl-9"
            />
          </div>

          <Select value={query.role} onValueChange={(value) => setQuery((prev) => ({ ...prev, page: 1, role: value as any }))}>
            <SelectTrigger className="h-10 w-full sm:w-[160px]">
              <SelectValue placeholder={t("admin.users.roleFilter")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("admin.users.roleAll")}</SelectItem>
              <SelectItem value="admin">{t("admin.users.roleAdmin")}</SelectItem>
              <SelectItem value="editor">{t("admin.users.roleEditor")}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={query.sort} onValueChange={(value) => setQuery((prev) => ({ ...prev, page: 1, sort: value as any }))}>
            <SelectTrigger className="h-10 w-full sm:w-[160px]">
              <SelectValue placeholder={t("admin.users.sort")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">{t("admin.users.sortNewest")}</SelectItem>
              <SelectItem value="oldest">{t("admin.users.sortOldest")}</SelectItem>
            </SelectContent>
          </Select>

          <Button type="submit" variant="outline" className="h-10">
            {t("admin.users.search")}
          </Button>
        </form>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("admin.users.username")}</TableHead>
              <TableHead className="w-[140px]">{t("admin.users.role")}</TableHead>
              <TableHead className="w-[200px]">{t("admin.users.createdAt")}</TableHead>
              <TableHead className="w-[180px] text-right">{t("admin.users.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <TableRow key={idx}>
                  <TableCell colSpan={4}>
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-sm text-slate-500">
                  {t("admin.users.empty")}
                </TableCell>
              </TableRow>
            ) : (
              items.map((user) => {
                const isSelf = user.id === myId;
                const disabled = Boolean(savingId) || isSelf;
                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium text-slate-900">
                      <div className="flex flex-col">
                        <span>{user.username}</span>
                        {isSelf ? <span className="text-xs text-slate-500">{t("admin.users.you")}</span> : null}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={user.role}
                        onValueChange={(value) => void onChangeRole(user, value as UserRole)}
                        disabled={disabled}
                      >
                        <SelectTrigger className="h-9 w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">{t("admin.users.roleAdmin")}</SelectItem>
                          <SelectItem value="editor">{t("admin.users.roleEditor")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">{formatDateTime(user.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={disabled}
                        onClick={() =>
                          void onChangeRole(user, user.role === "admin" ? "editor" : "admin")
                        }
                      >
                        {user.role === "admin" ? t("admin.users.demote") : t("admin.users.promote")}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-4 py-3">
          <div className="text-xs text-slate-500">
            {t("admin.users.pagination", { page: query.page, pages })}
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={loading || !canPrev}
              onClick={() => setQuery((prev) => ({ ...prev, page: prev.page - 1 }))}
            >
              {t("admin.users.prev")}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={loading || !canNext}
              onClick={() => setQuery((prev) => ({ ...prev, page: prev.page + 1 }))}
            >
              {t("admin.users.next")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;

