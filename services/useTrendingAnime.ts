import { useEffect, useState } from "react";
import { fetchTrendingAnime, AnimeResult } from "./api";

type TrendingAnime = {
  anime_id: number;
  title: string;
  poster_url: string | null;
  release_date: string | null;
};

type UseTrendingMoviesReturn = {
  trendingAnime: TrendingAnime[];
  loading: boolean;
  error: Error | null;
};


const useTrendingAnime = (): UseTrendingMoviesReturn => {
    const [trendingAnime , setTrendingAnime] = useState<TrendingAnime[]>([]);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState<Error | null>(null);

   useEffect(() => {
    const load = async () => {
        try{
            setLoading(true);
            const anime: AnimeResult[] = await fetchTrendingAnime();

            const mapped: TrendingAnime[] = anime.map((a) => ({
                anime_id : a.id,
                title: a.name,
                poster_url: a.poster_path
                ? `https://image.tmdb.org/t/p/w500${a.poster_path}`
                : null, 
                release_date: a.first_air_date ?? null,
            }));
            setTrendingAnime(mapped);
        }catch(err) {
            setError(err instanceof Error ? err : new Error("unknown error"));
        } finally{
            setLoading(false);
        }
    };
    load();
   }, []);
  
   return { trendingAnime, loading, error };
}

export default useTrendingAnime;