import { useCallback, useEffect, useRef, useState } from "react";

const useFetch = <T>(fetchFunction: () => Promise<T>, autoFetch = true) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /*
   * Keep the latest fetch function in a ref.
   *
   * This is important because pages often call useFetch like:
   *
   * useFetch(() => fetchMovies(...))
   *
   * That function gets recreated on every render.
   * If we put fetchFunction directly in useEffect dependencies,
   * it can create an infinite loop.
   */
  const fetchFunctionRef = useRef(fetchFunction);

  /*
   * Always keep the ref updated with the newest function.
   */
  fetchFunctionRef.current = fetchFunction;

  /*
   * fetchData has a stable reference.
   *
   * It uses the latest function from fetchFunctionRef,
   * so changing the inline function will NOT restart the effect.
   */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await fetchFunctionRef.current();

      setData(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("An error occurred");

      setError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  /*
   * This effect runs when autoFetch changes.
   *
   * fetchData is stable because it is wrapped in useCallback
   * with an empty dependency array.
   */
  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [autoFetch, fetchData]);

  /*
   * Reset all states.
   */
  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    reset,
  };
};

export default useFetch;
