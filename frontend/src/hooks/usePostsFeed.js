import { useCallback, useEffect, useState } from 'react';
import { getPosts, POSTS_UPDATED_EVENT } from '../services/postService';

export const usePostsFeed = () => {
  const [posts, setPosts] = useState([]);

  const reloadPosts = useCallback(() => {
    setPosts(getPosts());
  }, []);

  useEffect(() => {
    reloadPosts();

    window.addEventListener('storage', reloadPosts);
    window.addEventListener(POSTS_UPDATED_EVENT, reloadPosts);

    return () => {
      window.removeEventListener('storage', reloadPosts);
      window.removeEventListener(POSTS_UPDATED_EVENT, reloadPosts);
    };
  }, [reloadPosts]);

  return { posts, reloadPosts };
};
