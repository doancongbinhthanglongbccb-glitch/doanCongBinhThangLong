/**
 * useLocalStorage.js
 * Hook for managing localStorage with React state
 */
import { useState } from 'react';
import { readStoredJSON, writeStoredJSON } from '../utils/storageHelpers';

export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      return readStoredJSON(key, initialValue);
    } catch {
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      writeStoredJSON(key, valueToStore);
    }
    catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
};
