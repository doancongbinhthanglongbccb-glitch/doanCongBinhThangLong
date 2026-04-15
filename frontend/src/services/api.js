import { siteData } from "@/data/siteData";

let store = structuredClone(siteData);
const listeners = new Set();

const notify = () => {
  const snapshot = structuredClone(store);
  listeners.forEach((listener) => listener(snapshot));
};

export const getSiteData = async () => structuredClone(store);

export const updateSiteData = async (next) => {
  if (typeof next === "function") {
    store = next(structuredClone(store));
  } else {
    store = structuredClone(next);
  }
  notify();
  return structuredClone(store);
};

export const subscribeSiteData = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const createItem = async (key, payload) =>
  updateSiteData((prev) => ({
    ...prev,
    [key]: [{ ...payload, id: `${key}-${Date.now()}` }, ...prev[key]],
  }));

export const updateItem = async (key, id, payload) =>
  updateSiteData((prev) => ({
    ...prev,
    [key]: prev[key].map((item) => (item.id === id ? { ...item, ...payload } : item)),
  }));

export const deleteItem = async (key, id) =>
  updateSiteData((prev) => ({
    ...prev,
    [key]: prev[key].filter((item) => item.id !== id),
  }));
