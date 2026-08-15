import { useEffect, useState } from "react";
import {
  fetchPopularWebSeries,
  fetchRecentlyCompletedSeries,
  fetchTopSeries,
  fetchTrendingWebSeries,
  WebSeries,
} from "./api";

export type HeroSlide = {
  id: number;
  title: string;
  backdrop_url: string | null;
  poster_url: string | null;
  year: string;
  overview: string;
};

export type SeriesCard = {
  series_id: number;
  title: string;
  poster_url: string | null;
  release_date: string | null;
};

type UseWebSeriesPageReturn = {
  heroSlides: HeroSlide[];
  trendingSeries: SeriesCard[];
  recentlyCompleted: SeriesCard[];
  topSeries: SeriesCard[];
  loading: boolean;
  error: Error | null;
};

const toCard = (s: WebSeries): SeriesCard => ({
  series_id: s.id,
  title: s.name,
  poster_url: s.poster_path
    ? `https://image.tmdb.org/t/p/w500${s.poster_path}`
    : null,
  release_date: s.first_air_date ?? null,
});

const toSlide = (s: WebSeries): HeroSlide => ({
  id: s.id,
  title: s.name,
  backdrop_url: s.backdrop_path
    ? `https://image.tmdb.org/t/p/original${s.backdrop_path}`
    : null,
  poster_url: s.poster_path
    ? `https://image.tmdb.org/t/p/w500${s.poster_path}`
    : null,
  year: s.first_air_date?.split("-")[0] ?? "",
  overview: s.overview ?? "",
});

const useWebSeriesPage = (): UseWebSeriesPageReturn => {
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [trendingSeries, setTrendingSeries] = useState<SeriesCard[]>([]);
  const [recentlyCompleted, setRecentlyCompleted] = useState<SeriesCard[]>([]);
  const [topSeries, setTopSeries] = useState<SeriesCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const [popular, trending, completed, top] = await Promise.all([
          fetchPopularWebSeries(),
          fetchTrendingWebSeries(),
          fetchRecentlyCompletedSeries(),
          fetchTopSeries(),
        ]);

        if (!mounted) {
          return;
        }

        setHeroSlides(popular.map(toSlide));
        setTrendingSeries(trending.map(toCard));
        setRecentlyCompleted(completed.map(toCard));
        setTopSeries(top.map(toCard));
      } catch (err) {
        if (!mounted) {
          return;
        }

        setError(
          err instanceof Error ? err : new Error("Unable to load web series"),
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    heroSlides,
    trendingSeries,
    recentlyCompleted,
    topSeries,
    loading,
    error,
  };
};

export default useWebSeriesPage;
