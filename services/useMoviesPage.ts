// single hook fetchs all 4 sections
// using promise.all - all api call fire at same time

import { useEffect, useState } from "react";
import {
  fetchTopRatedMovies,
  fetchTrendingMovies,
  fetchPopularMovies,
  fetchTop10Movies,
  Movie,
} from "./api";

// heroslides -same as other
export type HeroSlide = {
  id: number;
  title: string;
  backdrop_url: string | null;
  poster_url: string | null;
  year: string;
  overview: string;
};

// Moviecard - use horizantal rows
export type MovieCardItem = {
  movie_id: number;
  title: string;
  poster_url: string | null;
  release_date: string | null;
};

type UseMoviesPageReturn = {
  heroSlides: HeroSlide[];
  trendingMovies: MovieCardItem[];
  popularMovies: MovieCardItem[];
  top10Movies: MovieCardItem[];
  loading: boolean;
  error: Error | null;
};

// helper - maps movie - heroslide
const toSlide = (m: Movie): HeroSlide => ({
  id: m.id,
  title: m.title,
  backdrop_url: (m as any).backdrop_path
    ? `https://image.tmdb.org/t/p/original${(m as any).backdrop_path}`
    : null,
  poster_url: m.poster_path
    ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
    : null,
  year: m.release_date?.split("-")[0] ?? "",
  overview: (m as any).overview ?? "",
});

// helper - map movie - moviecarditem
const toCard = (m: Movie): MovieCardItem => ({
  movie_id: m.id,
  title: m.title,
  poster_url: m.poster_path
    ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
    : null,
  release_date: m.release_date ?? null,
});

const useMoviePage = (): UseMoviesPageReturn => {
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<MovieCardItem[]>([]);
  const [popularMovies, setPopularMovies] = useState<MovieCardItem[]>([]);
  const [top10Movies, setTop10Movies] = useState<MovieCardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // 4 calls fire - fastest
        const [topRated, trending, popular, top10] = await Promise.all([
          fetchTopRatedMovies(),
          fetchTrendingMovies(),
          fetchPopularMovies(),
          fetchTop10Movies(),
        ]);
        setHeroSlides(topRated.map(toSlide));
        setTrendingMovies(trending.map(toCard));
        setPopularMovies(popular.map(toCard));
        setTop10Movies(top10.map(toCard));
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
    trendingMovies,
    popularMovies,
    top10Movies,
    loading,
    error,
  };
};
export default useMoviePage;
