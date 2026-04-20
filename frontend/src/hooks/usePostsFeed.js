import { useCallback, useEffect, useState } from 'react';
import { getPublicPosts } from '@/services/api/postApi';

export const usePostsFeed = () => {
  const [posts, setPosts] = useState([]);

  const reloadPosts = useCallback(async () => {
    const nextPosts = await getPublicPosts({ page: 1, limit: 10 });
    setPosts(nextPosts.data);
  }, []);

  useEffect(() => {
    void reloadPosts();

    const handleStorage = () => {
      void reloadPosts();
    };

    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, [reloadPosts]);

  return { posts, reloadPosts };
};
