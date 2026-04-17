import { useCallback, useEffect, useState } from 'react';
import { getPosts } from '@/services/api/postApi';

export const usePostsFeed = () => {
  const [posts, setPosts] = useState([]);

  const reloadPosts = useCallback(async () => {
    const nextPosts = await getPosts();
    setPosts(nextPosts);
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
