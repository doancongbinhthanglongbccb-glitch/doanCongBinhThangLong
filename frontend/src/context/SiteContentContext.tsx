import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  createNewsItem,
  deleteNewsItem,
  getSiteContent,
  replaceSiteContent,
  updateNewsItem,
} from "@/services/mockApi";
import type { NewsItem, SiteContent } from "@/types/site";

type SiteContentContextType = {
  content: SiteContent | null;
  loading: boolean;
  replaceContent: (nextContent: SiteContent) => Promise<void>;
  addNews: (payload: Omit<NewsItem, "id">) => Promise<void>;
  editNews: (id: string, payload: Omit<NewsItem, "id">) => Promise<void>;
  removeNews: (id: string) => Promise<void>;
};

const SiteContentContext = createContext<SiteContentContextType | undefined>(undefined);

export const SiteContentProvider = ({ children }: { children: React.ReactNode }) => {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const initial = await getSiteContent();
      setContent(initial);
      setLoading(false);
    };

    void load();
  }, []);

  const replaceContent = async (nextContent: SiteContent) => {
    const updated = await replaceSiteContent(nextContent);
    setContent(updated);
  };

  const addNews = async (payload: Omit<NewsItem, "id">) => {
    const updated = await createNewsItem(payload);
    setContent(updated);
  };

  const editNews = async (id: string, payload: Omit<NewsItem, "id">) => {
    const updated = await updateNewsItem(id, payload);
    setContent(updated);
  };

  const removeNews = async (id: string) => {
    const updated = await deleteNewsItem(id);
    setContent(updated);
  };

  const value = useMemo(
    () => ({ content, loading, replaceContent, addNews, editNews, removeNews }),
    [content, loading],
  );

  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>;
};

export const useSiteContent = () => {
  const context = useContext(SiteContentContext);
  if (!context) {
    throw new Error("useSiteContent must be used inside SiteContentProvider");
  }
  return context;
};
