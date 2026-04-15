/**
 * useFetch.js
 * Custom React hook for fetching data with loading and error states
 */
import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook for fetching data
 * @param {Function} fetchFn - Async function that returns data
 * @param {Array} dependencies - Dependencies array for useEffect
 * @param {Object} options - Additional options
 * @returns {Object} - { data, loading, error, refetch }
 */
export const useFetch = (fetchFn, dependencies = [], options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchFnRef = useRef(fetchFn);
  const onErrorRef = useRef(options.onError);
  const enabledRef = useRef(options.enabled !== false);

  useEffect(() => {
    fetchFnRef.current = fetchFn;
  }, [fetchFn]);

  useEffect(() => {
    onErrorRef.current = options.onError;
  }, [options.onError]);

  useEffect(() => {
    enabledRef.current = options.enabled !== false;
  }, [options.enabled]);

  const dependencyKey = JSON.stringify(dependencies);

  const fetchData = useCallback(async () => {
    if (!enabledRef.current) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await fetchFnRef.current();
      setData(result);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        err.message ||
        'An error occurred while fetching data'
      );
      if (onErrorRef.current) {
        onErrorRef.current(err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData, dependencyKey]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    setData, // Allow manual data update
  };
};
