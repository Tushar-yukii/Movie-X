import { View, Text } from "react-native";
import React from "react";
import { ScrollView } from "react-native";
import { Image } from "react-native";
import useFetch from "@/services/useFetch";
import { fetchMovieDetails } from "@/services/api";
import { useLocalSearchParams } from "expo-router";
import { icons } from "@/constants/icons";
import { Label } from "@react-navigation/elements";

interface 

const MovieInfo = ({label , value} : MovieInfoProps)

const movieDeatils = () => {
  const { id } = useLocalSearchParams();

  const { data: movie, loading } = useFetch(() =>
    fetchMovieDetails(id as string)
  );
  return (
    <View className="bg-primary flex-1">
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 80,
        }}
      >
        <View>
          <Image
            source={{
              uri: `https://image.tmdb.org/t/p/w500${movie?.poster_path}`,
            }}
            className="w-full h-[500px]"
            resizeMode="stretch"
          />
        </View>
        <View className="flex-col items-start justify-center mt-5 px-2">
          <Text className="text-white font-bold text-xl">{movie?.title}</Text>
        </View>
        <View className="flex-row item-center gap-x-1 mt-2 px-2">
          <Text className="text-light-300 text-bold">
            {movie?.release_date?.split("-")[0]}
          </Text>
          <Text className="text-light-300 text-bold"> {movie?.runtime}m</Text>
        </View>
        <View className="flex-row items-center px-2 py-1 rounded-md gap-x-1 mt-2">
          <Image source={icons.star} className="size-5" />
          <Text className="text-white font-bold text-sm">
            {Math.round(movie?.vote_average ?? 0)} /10
          </Text>
          <Text className="text-light-200 text-sm">({movie?.vote_count} votes)</Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default movieDeatils;
