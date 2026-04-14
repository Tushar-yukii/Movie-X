// single hook fetchs all 4 sections
// using promise.all - all api call fire at same time

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
