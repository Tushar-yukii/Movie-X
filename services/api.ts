const BASE_URL = "https://api.themoviedb.org/3";

const API_TOKEN = process.env.EXPO_PUBLIC_MOVIE_API_KEY;

if (!API_TOKEN) {
  throw new Error("TMDB API key is missing");
}

/*
  TMDB FETCH HELPER
*/

export const tmdbFetch = async <T>(endpoint: string): Promise<T> => {
  const url = `${BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${API_TOKEN}`,
      },
    });

    if (!response.ok) {
      let errorMessage = `TMDB Error: ${response.status}`;

      try {
        const errorText = await response.text();

        if (errorText) {
          errorMessage += ` - ${errorText}`;
        }
      } catch {
        // Ignore response body parsing errors
      }

      throw new Error(errorMessage);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Unable to connect to TMDB");
  }
};

/*
  TYPES
*/

export type HeroAnime = {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date?: string;
  genre_ids?: number[];
  episode_run_time?: number;
  overview?: string;
};

export type AnimeResult = {
  id: number;
  name: string;
  poster_path: string | null;
  first_air_date?: string;
};

export type Movie = {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  overview?: string;
  vote_average?: number;
};

export type WebSeries = {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date?: string;
  last_air_date?: string;
  overview?: string;
  status?: string;
};

export type AnimeItem = {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date?: string;
  overview?: string;
};

export type MovieDetails = Movie & {
  id: number;
  title: string;
  name?: string;
  overview?: string;
  poster_path: string | null;
  backdrop_path?: string | null;
  release_date?: string;

  runtime?: number;
  vote_average?: number;
  vote_count?: number;

  budget?: number;
  revenue?: number;
  original_language?: string;
  status?: string;
  tagline?: string;

  number_of_episodes?: number;
  number_of_seasons?: number;

  genres?: {
    id: number;
    name: string;
  }[];

  production_companies?: {
    id: number;
    name: string;
    logo_path: string | null;
    origin_country: string;
  }[];

  spoken_languages?: {
    english_name: string;
    iso_639_1: string;
    name: string;
  }[];
};

/*
  MOVIES
*/

/*
  Fetch Movies

  If query exists:
  Search movies.

  If query is empty:
  Fetch popular/discover movies.
*/

export const fetchMovies = async ({
  query,
}: {
  query: string;
}): Promise<Movie[]> => {
  const cleanQuery = query.trim();

  if (cleanQuery) {
    const data = await tmdbFetch<{ results: Movie[] }>(
      `/search/movie?query=${encodeURIComponent(cleanQuery)}`,
    );

    return data.results ?? [];
  }

  const [page1, page2, page3, page4] = await Promise.all([
    tmdbFetch<{ results: Movie[] }>(
      "/discover/movie?sort_by=popularity.desc&page=1",
    ),

    tmdbFetch<{ results: Movie[] }>(
      "/discover/movie?sort_by=popularity.desc&page=2",
    ),

    tmdbFetch<{ results: Movie[] }>(
      "/discover/movie?sort_by=popularity.desc&page=3",
    ),

    tmdbFetch<{ results: Movie[] }>(
      "/discover/movie?sort_by=popularity.desc&page=4",
    ),
  ]);

  const movies = [
    ...page1.results,
    ...page2.results,
    ...page3.results,
    ...page4.results,
  ];

  return Array.from(new Map(movies.map((movie) => [movie.id, movie])).values());
};

/*
  POPULAR MOVIES
*/

export const fetchPopularMovies = async (): Promise<Movie[]> => {
  const [page1, page2] = await Promise.all([
    tmdbFetch<{ results: Movie[] }>("/movie/popular?page=1"),
    tmdbFetch<{ results: Movie[] }>("/movie/popular?page=2"),
  ]);

  const movies = [...page1.results, ...page2.results];

  return Array.from(
    new Map(movies.map((movie) => [movie.id, movie])).values(),
  ).slice(0, 30);
};

/*
  TOP RATED MOVIES
*/

export const fetchTopRatedMovies = async (): Promise<Movie[]> => {
  const data = await tmdbFetch<{ results: Movie[] }>(
    "/discover/movie?sort_by=vote_average.desc&vote_count.gte=1000&page=1",
  );

  return data.results.filter((movie) => movie.poster_path).slice(0, 15);
};

/*
  TOP 10 MOVIES
*/

export const fetchTop10Movies = async (): Promise<Movie[]> => {
  const data = await tmdbFetch<{ results: Movie[] }>("/movie/top_rated?page=1");

  return data.results.slice(0, 10);
};

/*
  TRENDING MOVIES
*/

export const fetchTrendingMovies = async (): Promise<Movie[]> => {
  const [page1, page2, page3] = await Promise.all([
    tmdbFetch<{ results: Movie[] }>("/trending/movie/week?page=1"),
    tmdbFetch<{ results: Movie[] }>("/trending/movie/week?page=2"),
    tmdbFetch<{ results: Movie[] }>("/trending/movie/week?page=3"),
  ]);

  const movies = [...page1.results, ...page2.results, ...page3.results];

  const uniqueMovies = Array.from(
    new Map(movies.map((movie) => [movie.id, movie])).values(),
  );

  return uniqueMovies.slice(0, 50);
};

/*
  MOVIE DETAILS
*/

export const fetchMovieDetails = async (
  movieId: string,
): Promise<MovieDetails> => {
  return tmdbFetch<MovieDetails>(`/movie/${movieId}`);
};

/*
  MOVIE RECOMMENDATIONS
*/

export const fetchMovieRecommendations = async (
  movieId: string,
): Promise<Movie[]> => {
  const data = await tmdbFetch<{ results: Movie[] }>(
    `/movie/${movieId}/recommendations`,
  );

  return data.results.slice(0, 10);
};

/*
  TV DETAILS
*/

export const fetchTVDetails = async (tvId: string): Promise<MovieDetails> => {
  return tmdbFetch<MovieDetails>(`/tv/${tvId}`);
};

/*
  HERO ANIME
*/

export const fetchHeroAnime = async (): Promise<HeroAnime[]> => {
  const data = await tmdbFetch<{ results: HeroAnime[] }>(
    "/discover/tv?with_genres=16&with_origin_country=JP&sort_by=vote_average.desc&vote_count.gte=500&page=1",
  );

  return data.results.filter((anime) => anime.backdrop_path).slice(0, 15);
};

/*
  TRENDING ANIME
*/

export const fetchTrendingAnime = async (): Promise<AnimeResult[]> => {
  const [page1, page2, page3] = await Promise.all([
    tmdbFetch<{ results: AnimeResult[] }>(
      "/discover/tv?with_genres=16&with_origin_country=JP&sort_by=popularity.desc&page=1",
    ),

    tmdbFetch<{ results: AnimeResult[] }>(
      "/discover/tv?with_genres=16&with_origin_country=JP&sort_by=popularity.desc&page=2",
    ),

    tmdbFetch<{ results: AnimeResult[] }>(
      "/discover/tv?with_genres=16&with_origin_country=JP&sort_by=popularity.desc&page=3",
    ),
  ]);

  const anime = [...page1.results, ...page2.results, ...page3.results];

  const uniqueAnime = Array.from(
    new Map(anime.map((item) => [item.id, item])).values(),
  );

  return uniqueAnime.slice(0, 50);
};

/*
  TOP RATED ANIME
*/

export const fetchTopRatedAnime = async (): Promise<AnimeItem[]> => {
  const data = await tmdbFetch<{ results: AnimeItem[] }>(
    "/discover/tv?with_genres=16&with_origin_country=JP&sort_by=vote_average.desc&vote_count.gte=200&page=1",
  );

  return data.results.filter((anime) => anime.backdrop_path).slice(0, 15);
};

/*
  TRENDING ANIME LIST
*/

export const fetchTrendingAnimeList = async (): Promise<AnimeItem[]> => {
  const [page1, page2] = await Promise.all([
    tmdbFetch<{ results: AnimeItem[] }>(
      "/discover/tv?with_genres=16&with_origin_country=JP&sort_by=popularity.desc&page=1",
    ),

    tmdbFetch<{ results: AnimeItem[] }>(
      "/discover/tv?with_genres=16&with_origin_country=JP&sort_by=popularity.desc&page=2",
    ),
  ]);

  const anime = [...page1.results, ...page2.results];

  const uniqueAnime = Array.from(
    new Map(anime.map((item) => [item.id, item])).values(),
  );

  return uniqueAnime.slice(0, 10);
};

/*
  POPULAR ANIME
*/

export const fetchPopularAnime = async (): Promise<AnimeItem[]> => {
  const [page1, page2] = await Promise.all([
    tmdbFetch<{ results: AnimeItem[] }>(
      "/discover/tv?with_genres=16&with_origin_country=JP&sort_by=popularity.desc&first_air_date.gte=2020-01-01&page=1",
    ),

    tmdbFetch<{ results: AnimeItem[] }>(
      "/discover/tv?with_genres=16&with_origin_country=JP&sort_by=popularity.desc&first_air_date.gte=2020-01-01&page=2",
    ),
  ]);

  const anime = [...page1.results, ...page2.results];

  const uniqueAnime = Array.from(
    new Map(anime.map((item) => [item.id, item])).values(),
  );

  return uniqueAnime.slice(0, 10);
};

/*
  UPCOMING ANIME
*/

export const fetchUpcomingAnime = async (): Promise<AnimeItem[]> => {
  const data = await tmdbFetch<{ results: AnimeItem[] }>(
    "/discover/tv?with_genres=16&with_origin_country=JP&with_status=2&sort_by=popularity.desc&page=1",
  );

  return data.results.slice(0, 10);
};

/*
  WEB SERIES
*/

/*
  Popular Web Series

  Used for HeroSlider.
*/

export const fetchPopularWebSeries = async (): Promise<WebSeries[]> => {
  const data = await tmdbFetch<{ results: WebSeries[] }>(
    "/discover/tv?sort_by=popularity.desc&with_watch_providers=8|9|119|337&watch_region=IN&page=1",
  );

  return data.results.filter((series) => series.backdrop_path).slice(0, 15);
};

/*
  Trending Web Series
*/

export const fetchTrendingWebSeries = async (): Promise<WebSeries[]> => {
  const [page1, page2, page3] = await Promise.all([
    tmdbFetch<{ results: WebSeries[] }>("/trending/tv/week?page=1"),

    tmdbFetch<{ results: WebSeries[] }>("/trending/tv/week?page=2"),

    tmdbFetch<{ results: WebSeries[] }>("/trending/tv/week?page=3"),
  ]);

  const series = [...page1.results, ...page2.results, ...page3.results];

  const uniqueSeries = Array.from(
    new Map(series.map((item) => [item.id, item])).values(),
  );

  return uniqueSeries.slice(0, 10);
};

/*
  RECENTLY COMPLETED WEB SERIES
*/

export const fetchRecentlyCompletedSeries = async (): Promise<WebSeries[]> => {
  const data = await tmdbFetch<{ results: WebSeries[] }>(
    "/discover/tv?sort_by=popularity.desc&with_status=3&with_watch_providers=8|9|119|337&watch_region=IN&page=1",
  );

  const uniqueSeries = Array.from(
    new Map(data.results.map((item) => [item.id, item])).values(),
  );

  return uniqueSeries.slice(0, 10);
};

/*
  UPCOMING WEB SERIES

  Keep this function because your web-series hook
  may still use it.

  IMPORTANT:
  This is NOT fetchTopSeries.
*/

export const fetchUpcomingWebSeries = async (): Promise<WebSeries[]> => {
  const data = await tmdbFetch<{ results: WebSeries[] }>(
    "/discover/tv?sort_by=popularity.desc&with_status=2&with_watch_providers=8|9|119|337&watch_region=IN&page=1",
  );

  const uniqueSeries = Array.from(
    new Map(data.results.map((item) => [item.id, item])).values(),
  );

  return uniqueSeries.slice(0, 10);
};

/*
  TOP SERIES

  THIS IS THE ONLY fetchTopSeries FUNCTION.

  Used on:
  Home page
  Web Series page

  It fetches TMDB's top-rated TV series.
*/

export const fetchTopSeries = async (): Promise<WebSeries[]> => {
  const [page1, page2, page3] = await Promise.all([
    tmdbFetch<{ results: WebSeries[] }>("/tv/top_rated?page=1"),

    tmdbFetch<{ results: WebSeries[] }>("/tv/top_rated?page=2"),

    tmdbFetch<{ results: WebSeries[] }>("/tv/top_rated?page=3"),
  ]);

  const series = [...page1.results, ...page2.results, ...page3.results];

  /*
    Remove duplicate TMDB IDs.
    This also helps prevent:
    Encountered two children with the same key
  */

  const uniqueSeries = Array.from(
    new Map(series.map((item) => [item.id, item])).values(),
  );

  return uniqueSeries.slice(0, 50);
};
