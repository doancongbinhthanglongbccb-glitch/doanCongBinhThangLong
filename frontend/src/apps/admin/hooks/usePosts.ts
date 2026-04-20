import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Post } from "@/shared/types/post";
import { getPosts, type PostListQuery, type PostListResponse } from "@/services/api/postApi";

type UsePostsResult = {
  posts: Post[];
  pagination: PostListResponse["pagination"];
  isLoading: boolean;
  isFetching: boolean;
  error: string;
  refetch: () => Promise<void>;
};

const defaultPagination: PostListResponse["pagination"] = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
};

export const usePosts = (query: PostListQuery): UsePostsResult => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState(defaultPagination);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState("");
  const requestIdRef = useRef(0);
  const hasLoadedOnceRef = useRef(false);

  const normalizedQuery = useMemo(
    () => ({
      search: query.search?.trim() || "",
      status: query.status,
      author: query.author,
      sort: query.sort || "newest",
      page: Math.max(1, query.page || 1),
      limit: Math.max(1, query.limit || 10),
    }),
    [query.author, query.limit, query.page, query.search, query.sort, query.status],
  );

  const [debouncedSearch, setDebouncedSearch] = useState(normalizedQuery.search);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(normalizedQuery.search);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [normalizedQuery.search]);

  const effectiveQuery = useMemo(
    () => ({
      ...normalizedQuery,
      search: debouncedSearch,
    }),
    [debouncedSearch, normalizedQuery],
  );

  const fetchPosts = useCallback(async (nextQuery: PostListQuery) => {
    const requestId = ++requestIdRef.current;
    const showInitialLoading = !hasLoadedOnceRef.current;

    if (showInitialLoading) {
      setIsLoading(true);
    } else {
      setIsFetching(true);
    }

    try {
      const response = await getPosts(nextQuery);

      if (requestId !== requestIdRef.current) {
        return;
      }

      setPosts(response.data);
      setPagination(response.pagination);
      setError("");
      hasLoadedOnceRef.current = true;
    } catch (fetchError) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      setError(fetchError instanceof Error ? fetchError.message : "Không thể tải dữ liệu bài viết.");
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
        setIsFetching(false);
      }
    }
  }, []);

  useEffect(() => {
    void fetchPosts(effectiveQuery);
  }, [effectiveQuery, fetchPosts]);

  const refetch = useCallback(async () => {
    await fetchPosts(effectiveQuery);
  }, [effectiveQuery, fetchPosts]);

  return {
    posts,
    pagination,
    isLoading,
    isFetching,
    error,
    refetch,
  };
};
