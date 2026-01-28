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

//Types

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

//   Fetch Trending Movies

export const fetchTrendingMovies = async (): Promise<Movie[]> => {
  const data = await tmdbFetch<{ results: Movie[] }>("/trending/movie/day");
  return data.results;
};

// Fetch Movie Details

export const fetchMovieDetails = async (
  movieId: string,
): Promise<MovieDetails> => {
  return tmdbFetch<MovieDetails>(`/movie/${movieId}`);
};
