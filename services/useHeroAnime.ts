import { useEffect, useState } from "react";
import { fetchHeroAnime, HeroAnime } from "./api";

export type HeroSlide = {
  id: number;
  title: string;
  backdrop_url: string | null;
  poster_url: string | null;
  year: string;
  overview: string;
};

const useHeroAnime = () => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const anime: HeroAnime[] = await fetchHeroAnime();
        const mapped: HeroSlide[] = anime
          .filter((a) => a.backdrop_path)
          .map((a) => ({
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
          }));
        setSlides(mapped);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);
  return { slides, loading, error };
};
export default useHeroAnime;
