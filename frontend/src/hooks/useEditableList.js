import { useCallback, useState } from 'react';
import { readStoredVersionedArray, writeStoredVersionedJSON } from '../utils/storageHelpers';

export const useEditableList = (storageKey, defaultItems, schemaVersion) => {
  const [items, setItems] = useState(() =>
    readStoredVersionedArray(storageKey, defaultItems, schemaVersion)
  );
  const [isEditing, setIsEditing] = useState(false);

  const setAndPersist = useCallback((updater) => {
    setItems((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      writeStoredVersionedJSON(storageKey, next, schemaVersion);
      return next;
    });
  }, [schemaVersion, storageKey]);

  const updateField = useCallback((id, field, value) => {
    setAndPersist((prev) => prev.map((item) => {
      if (item.id !== id) {
        return item;
      }

      if (field && typeof field === 'object') {
        return { ...item, ...field };
      }

      return { ...item, [field]: value };
    }));
  }, [setAndPersist]);

  const addItem = useCallback((item, options = {}) => {
    const { prepend = false } = options;
    setAndPersist((prev) => (prepend ? [item, ...prev] : [...prev, item]));
  }, [setAndPersist]);

  const removeItem = useCallback((id) => {
    setAndPersist((prev) => prev.filter((item) => item.id !== id));
  }, [setAndPersist]);

  const toggleEditing = useCallback(() => {
    setIsEditing((prev) => !prev);
  }, []);

  return {
    items,
    updateField,
    addItem,
    removeItem,
    isEditing,
    toggleEditing,
    setAndPersist,
  };
};

export default useEditableList;
