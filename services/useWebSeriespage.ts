// services/useWebSeriesPage.ts
// Single hook that fetches ALL 4 sections at once
// Using Promise.all so all 4 API calls happen simultaneously
// instead of one by one — 4x faster

import { useEffect, useState } from "react";
import {
  fetchPopularWebSeries,
  fetchTrendingWebSeries,
  fetchRecentlyCompletedSeries,
  fetchUpcomingWebSeries,
  WebSeries,
} from "./api";

// HeroSlide shape — same as home page hero slider
export type HeroSlide = {
  id: number;
  title: string;
  backdrop_url: string | null;
  poster_url: string | null;
  year: string;
  overview: string;
};

// SeriesCard shape — used for horizontal scroll rows
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
  upcomingSeries: SeriesCard[];
  loading: boolean;
  error: Error | null;
};

// Helper — maps WebSeries → SeriesCard shape
const toCard = (s: WebSeries): SeriesCard => ({
  series_id: s.id,
  title: s.name,
  poster_url: s.poster_path
    ? `https://image.tmdb.org/t/p/w500${s.poster_path}`
    : null,
  release_date: s.first_air_date ?? null,
});

// Helper — maps WebSeries → HeroSlide shape
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
  const [upcomingSeries, setUpcomingSeries] = useState<SeriesCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        // All 4 API calls fire simultaneously — much faster
        const [popular, trending, completed, upcoming] = await Promise.all([
          fetchPopularWebSeries(),
          fetchTrendingWebSeries(),
          fetchRecentlyCompletedSeries(),
          fetchUpcomingWebSeries(),
        ]);

        setHeroSlides(popular.map(toSlide));
        setTrendingSeries(trending.map(toCard));
        setRecentlyCompleted(completed.map(toCard));
        setUpcomingSeries(upcoming.map(toCard));
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return {
    heroSlides,
    trendingSeries,
    recentlyCompleted,
    upcomingSeries,
    loading,
    error,
  };
};

export default useWebSeriesPage;