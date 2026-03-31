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
  const endpoint = query
    ? `/search/movie?query=${encodeURIComponent(query)}`
    : `/discover/movie?sort_by=popularity.desc`;

  const data = await tmdbFetch<{ results: Movie[] }>(endpoint);
  return data.results;
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
