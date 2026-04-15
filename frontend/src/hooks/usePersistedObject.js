import { useCallback, useState } from 'react';
import { readStoredVersionedObject, writeStoredVersionedJSON } from '../utils/storageHelpers';

export const usePersistedObject = (storageKey, defaultValue, schemaVersion) => {
  const [data, setData] = useState(() =>
    readStoredVersionedObject(storageKey, defaultValue, schemaVersion)
  );

  const setAndPersist = useCallback((updater) => {
    setData((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      writeStoredVersionedJSON(storageKey, next, schemaVersion);
      return next;
    });
  }, [schemaVersion, storageKey]);

  const updateField = useCallback((field, value) => {
    setAndPersist((prev) => ({ ...prev, [field]: value }));
  }, [setAndPersist]);

  return {
    data,
    updateField,
    setAndPersist,
  };
};

export default usePersistedObject;
