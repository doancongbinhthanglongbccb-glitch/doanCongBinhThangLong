import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createItem, deleteItem, getSiteData, subscribeSiteData, updateItem, updateSiteData } from "@/services/api";

const SiteDataContext = createContext(undefined);

export const SiteDataProvider = ({ children }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const snapshot = await getSiteData();
      if (mounted) {
        setData(snapshot);
        setLoading(false);
      }
    };

    void load();

    const unsubscribe = subscribeSiteData((snapshot) => {
      setData(snapshot);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      data,
      loading,
      updateSiteData,
      createItem,
      updateItem,
      deleteItem,
      refresh: async () => {
        const snapshot = await getSiteData();
        setData(snapshot);
      },
    }),
    [data, loading],
  );

  return <SiteDataContext.Provider value={value}>{children}</SiteDataContext.Provider>;
};

export const useSiteData = () => {
  const context = useContext(SiteDataContext);
  if (!context) {
    throw new Error("useSiteData must be used inside SiteDataProvider");
  }
  return context;
};
