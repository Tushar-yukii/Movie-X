import { useEffect, useState } from "react";
import { fetchTrendingMovies, Movie } from "./api";

type TrendingMovie = {
  movie_id: number;
  title: string;
  poster_url: string | null;
  release_date: string | null;
};

type UseTrendingMoviesReturn = {
  trendingMovies: TrendingMovie[];
  loading: boolean;
  error: Error | null;
};

const useTrendingMovies = (): UseTrendingMoviesReturn => {
  const [trendingMovies, setTrendingMovies] = useState<TrendingMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const movies: Movie[] = await fetchTrendingMovies();

        // Map TMDB shape (id, poster_path) → your TrendingCard shape (movie_id, poster_url)
        const mapped: TrendingMovie[] = movies.map((m) => ({
          movie_id: m.id,
          title: m.title,
          poster_url: m.poster_path
            ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
            : null,
            release_date: m.release_date ?? null, 
        }));

        setTrendingMovies(mapped);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return { trendingMovies, loading, error };
};

export default useTrendingMovies;