const BASE_URL = "https://api.themoviedb.org/3";

const API_TOKEN = process.env.EXPO_PUBLIC_MOVIE_API_KEY;

if (!API_TOKEN) {
  throw new Error("TMDB API key is missing");
}

//Shared request helper

const tmdbFetch = async <T>(endpoint: string): Promise<T> => {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${API_TOKEN}`,
    },
  });

  if (!response.ok) {
    throw new Error(`TMDB Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

// top part slider images
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

//Types
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
  release_date?: string;
  overview?: string;
  vote_average?: number;
};

// web series
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

export type MovieDetails = Movie & {
  id: number;
  title: string;
  overview?: string;
  poster_path: string | null;
  release_date?: string;

  runtime?: number;
  vote_average?: number;
  vote_count?: number;

  budget?: number;
  revenue?: number;

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
};

// Fetch Movies (Search / Discover)

export const fetchMovies = async ({
  query,
}: {
  query: string;
}): Promise<Movie[]> => {
  if (query) {
    // Search only needs 1 page
    const data = await tmdbFetch<{ results: Movie[] }>(
      `/search/movie?query=${encodeURIComponent(query)}`,
    );
    return data.results;
  }
  const [p1, p2, p3, p4] = await Promise.all([
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

  return [...p1.results, ...p2.results, ...p3.results, ...p4.results];
};

// top rated anime for hero slider
export const fetchHeroAnime = async (): Promise<HeroAnime[]> => {
  const data = await tmdbFetch<{ results: HeroAnime[] }>(
    "/discover/tv?with_genres=16&with_origin_country=JP&sort_by=vote_average.desc&vote_count.gte=500&page=1",
  );
  return data.results.slice(0, 15);
};

// fetch tredinganime
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
  return [...page1.results, ...page2.results, ...page3.results].slice(0, 50);
};

//   Fetch Trending Movies
// Fetch Trending Movies — 25 to 50 unique results
export const fetchTrendingMovies = async (): Promise<Movie[]> => {
  const [page1, page2, page3] = await Promise.all([
    tmdbFetch<{ results: Movie[] }>("/trending/movie/week?page=1"),
    tmdbFetch<{ results: Movie[] }>("/trending/movie/week?page=2"),
    tmdbFetch<{ results: Movie[] }>("/trending/movie/week?page=3"),
  ]);
  return [...page1.results, ...page2.results, ...page3.results].slice(0, 50);
};

// Fetch Movie Details

export const fetchMovieDetails = async (
  movieId: string,
): Promise<MovieDetails> => {
  return tmdbFetch<MovieDetails>(`/movie/${movieId}`);
};

// 1. Popular Web Series — for hero slider (15 slides)
// Fetches from Netflix, Prime, Disney+ sorted by popularity
export const fetchPopularWebSeries = async (): Promise<WebSeries[]> => {
  const data = await tmdbFetch<{ results: WebSeries[] }>(
    "/discover/tv?sort_by=popularity.desc&with_watch_providers=8|9|119|337&watch_region=IN&page=1",
  );
  return data.results.filter((s) => s.backdrop_path).slice(0, 15);
};

// 2. Trending Web Series this week
export const fetchTrendingWebSeries = async (): Promise<WebSeries[]> => {
  const [p1, p2, p3] = await Promise.all([
    tmdbFetch<{ results: WebSeries[] }>("/trending/tv/week?page=1"),
    tmdbFetch<{ results: WebSeries[] }>("/trending/tv/week?page=2"),
    tmdbFetch<{ results: WebSeries[] }>("/trending/tv/week?page=3"),
  ]);
  return [...p1.results, ...p2.results, ...p3.results].slice(0, 10);
};

// 3. Recently Completed Web Series
// status filter not available in discover, so we filter by
// last_air_date range — aired in last 6 months and ended
export const fetchRecentlyCompletedSeries = async (): Promise<WebSeries[]> => {
  const data = await tmdbFetch<{ results: WebSeries[] }>(
    "/discover/tv?sort_by=popularity.desc&with_status=3&with_watch_providers=8|9|119|337&watch_region=IN&page=1",
  );
  // with_status=3 means "Ended" on TMDB
  return data.results.slice(0, 10);
};

// 4. Upcoming / In Production Web Series
// with_status=2 means "In Production" — not yet aired
export const fetchUpcomingWebSeries = async (): Promise<WebSeries[]> => {
  const data = await tmdbFetch<{ results: WebSeries[] }>(
    "/discover/tv?sort_by=popularity.desc&with_status=2&with_watch_providers=8|9|119|337&watch_region=IN&page=1",
  );
  return data.results.slice(0, 10);
};

// top rated movies - 15 sliders
export const fetchTopRatedMovies = async (): Promise<Movie[]> => {
  const data = await tmdbFetch<{ results: Movie[] }>(
    "/discover/movie?sort_by=vote_average.desc&vote_count.gte=1000&page=1",
  );
  return data.results.filter((m) => m.poster_path).slice(0, 15);
};

// popular movies movies page has its own independent data
export const fetchPopularMovies = async (): Promise<Movie[]> => {
  const [p1, p2] = await Promise.all([
    tmdbFetch<{ results: Movie[] }>("/movie/popular?page=1"),
    tmdbFetch<{ results: Movie[] }>("/movie/popular?page=2"),
  ]);
  return [...p1.results, ...p2.results].slice(0, 30);
};


// Top 10 Movies — highest rated all time
// This is the "Top Movies" row with only 10 items
export const fetchTop10Movies = async (): Promise<Movie[]> => {
  const data = await tmdbFetch<{ results: Movie[] }>("/movie/top_rated?page=1");
  return data.results.slice(0, 10); // exactly 10
};
