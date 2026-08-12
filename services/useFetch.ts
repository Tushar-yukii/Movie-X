// fetchMovies
// fetchMoviesDetails

import { useEffect, useState } from "react";

// useFetch(fetchMovies)

const useFetch = <T>(fetchFuction: () => Promise<T>, autoFetch = true) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await fetchFuction();
      setData(result);
    } catch (err) {
      // @ts-ingore
      setError(err instanceof Error ? err : new Error("an error accurred"));
    } finally {
      setLoading(false);
    }
  };
  const reset = () => {
    setData(null);
    setLoading(false);
    setError(null);
  };

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, []);

  return { data, loading, error, refetch: fetchData, reset };
};
export default useFetch;
