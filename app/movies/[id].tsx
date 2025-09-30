import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import React from "react";
import useFetch from "@/services/useFetch";
import { fetchMovieDetails } from "@/services/api";
import { router, useLocalSearchParams } from "expo-router";
import { icons } from "@/constants/icons";

interface MovieInfoProps {
  label: string;
  value?: string | number | null;
}

const MovieInfo = ({ label, value }: MovieInfoProps) => (
  <View className="flex-col items-start justify-center mt-5">
    <Text className="text-light-200 font-normal text-sm">{label}</Text>
    <Text className="text-light-100 font-bold text-sm mt-2">
      {value || "N/A"}
    </Text>
  </View>
);

const MovieDetails = () => {
  const { id } = useLocalSearchParams();
  const { data: movie, loading } = useFetch(() =>
    fetchMovieDetails(id as string)
  );

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center" style={{backgroundColor : "#2e144f"}}>
        <Text className="text-white">Loading...</Text>
      </View>
    );
  }

  if (!movie) {
    return (
      <View className="flex-1 items-center justify-center bg-primary">
        <Text className="text-white">Movie not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{backgroundColor : "#2e144f"}}>
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <View>
          <Image
            source={{
              uri: movie?.poster_path
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : "https://placehold.co/600x900/101010/FFF?text=No+Image",
            }}
            className="w-full h-[500px]"
            resizeMode="stretch"
          />
        </View>

        <View className="flex-col items-start justify-center mt-5 px-2">
          <Text className="text-white font-bold text-xl">{movie?.title}</Text>
        </View>

        <View className="flex-row items-center gap-x-1 mt-2 px-2">
          <Text className="text-light-300 font-bold">
            {movie?.release_date?.split("-")[0]}
          </Text>
          <Text className="text-light-300 font-bold"> {movie?.runtime}m</Text>
        </View>

        <View className="flex-row items-center px-2 py-1 rounded-md gap-x-1 mt-2">
          <Image source={icons.star} className="size-5" />
          <Text className="text-white font-bold text-sm">
            {Math.round(movie?.vote_average ?? 0)} /10
          </Text>
          <Text className="text-light-200 text-sm">
            ({movie?.vote_count} votes)
          </Text>
        </View>

        <MovieInfo label="Overview" value={movie?.overview} />
        <MovieInfo
          label="Genres"
          value={movie?.genres?.map((g) => g.name).join(" - ") || "N/A"}
        />

        <View className="flex flex-row justify-between w-1/2">
          <MovieInfo
            label="Budget"
            value={`$${(movie?.budget ?? 0) / 1_000_000} million`}
          />
          <MovieInfo
            label="Revenue"
            value={`$${Math.round((movie?.revenue ?? 0) / 1_000_000)} million`}
          />
        </View>

        <MovieInfo
          label="Production Companies"
          value={
            movie?.production_companies?.map((c) => c.name).join(" - ") ||
            "N/A"
          }
        />
      </ScrollView>

      <TouchableOpacity
        className="absolute bottom-5 left-0 right-0 mx-5 bg-accent rounded-lg py-3.5 flex flex-row items-center justify-center z-50"
        onPress={router.back}
      >
        <Image
          source={icons.arrow}
          className="size-5 mr-1 mt-0.5 rotate-180"
          tintColor="#fff"
        />
        <Text className="text-white font-extrabold text-base">Back</Text>
      </TouchableOpacity>
    </View>
  );
};

export default MovieDetails;
