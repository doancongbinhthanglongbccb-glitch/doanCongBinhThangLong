import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as postsService from "../services/posts.service";
import type { Post, PostListQuery, PostListResponse } from "../types/posts.types";

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
    [query.author, query.limit, query.page, query.search, query.sort, query.status]
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
    [debouncedSearch, normalizedQuery]
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
      const response = await postsService.getCmsPosts(nextQuery);

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

// Hook for single post
export const usePost = (slug?: string) => {
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(!!slug);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setPost(null);
      setIsLoading(false);
      return;
    }

    let mounted = true;

    const loadPost = async () => {
      try {
        setIsLoading(true);
        const fetchedPost = await postsService.getPostBySlug(slug);
        if (mounted) {
          setPost(fetchedPost);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to load post");
          setPost(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    void loadPost();

    return () => {
      mounted = false;
    };
  }, [slug]);

  return { post, isLoading, error };
};

// Hook for public posts feed
export const usePostsFeed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const reloadPosts = useCallback(async () => {
    try {
      const response = await postsService.getPublicPosts({ page: 1, limit: 10 });
      setPosts(response.data);
    } catch {
      /* feed errors are non-fatal; list stays empty */
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadInitial = async () => {
      await reloadPosts();
      if (mounted) {
        setIsLoading(false);
      }
    };

    void loadInitial();

    const handleStorage = () => {
      void reloadPosts();
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      mounted = false;
      window.removeEventListener("storage", handleStorage);
    };
  }, [reloadPosts]);

  return { posts, isLoading, reloadPosts };
};
