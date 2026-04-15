// Single hook fetches all 4 sections
// Promise.all fires all 4 API calls at same time

import { useEffect, useState } from "react";
import {
  fetchTopRatedAnime,
  fetchTrendingAnimeList,
  fetchPopularAnime,
  fetchUpcomingAnime,
  AnimeItem,
} from "./api";

// HeroSlide
export type HeroSlide = {
  id: number;
  title: string;
  backdrop_url: string | null;
  poster_url: string | null;
  year: string;
  overview: string;
};

export type AnimeCardItem = {
  anime_id: number;
  title: string;
  poster_url: string | null;
  release_date: string | null;
};

type UseAnimePageReturn = {
  heroSlides: HeroSlide[];
  trendingAnime: AnimeCardItem[];
  popularAnime: AnimeCardItem[];
  upcomingAnime: AnimeCardItem[];
  loading: boolean;
  error: Error | null;
};

// Helper — maps AnimeItem → HeroSlide
// TV shows use "name" not "title"
const toSlide = (a: AnimeItem): HeroSlide => ({
  id: a.id,
  title: a.name,
  backdrop_url: a.backdrop_path
    ? `https://image.tmdb.org/t/p/original${a.backdrop_path}`
    : null,
  poster_url: a.poster_path
    ? `https://image.tmdb.org/t/p/w500${a.poster_path}`
    : null,
  year: a.first_air_date?.split("-")[0] ?? "",
  overview: a.overview ?? "",
});

// Helper — maps AnimeItem → AnimeCardItem
const toCard = (a: AnimeItem): AnimeCardItem => ({
  anime_id: a.id,
  title: a.name,
  poster_url: a.poster_path
    ? `https://image.tmdb.org/t/p/w500${a.poster_path}`
    : null,
  release_date: a.first_air_date ?? null,
});

const useAnimePage = (): UseAnimePageReturn => {
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [trendingAnime, setTrendingAnime] = useState<AnimeCardItem[]>([]);
  const [popularAnime, setPopularAnime] = useState<AnimeCardItem[]>([]);
  const [upcomingAnime, setUpcomingAnime] = useState<AnimeCardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        // All 4 API calls fire
        const [topRated, trending, popular, upcoming] = await Promise.all([
          fetchTopRatedAnime(),
          fetchTrendingAnimeList(),
          fetchPopularAnime(),
          fetchUpcomingAnime(),
        ]);

        setHeroSlides(topRated.map(toSlide));
        setTrendingAnime(trending.map(toCard));
        setPopularAnime(popular.map(toCard));
        setUpcomingAnime(upcoming.map(toCard));
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
    trendingAnime,
    popularAnime,
    upcomingAnime,
    loading,
    error,
  };
};

export default useAnimePage;
