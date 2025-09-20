import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import React from "react";
import { Link } from "expo-router";
import { icons } from "@/constants/icons";

const MovieCard = ({
  id,
  poster_path,
  title,
  vote_average,
  release_date,
}: Movie) => {
  //   console.log(poster_path);
  return (
    <Link href={`/movies/${id}`} asChild>
      <TouchableOpacity className="w-[30%]">
        <Image
          source={{
            uri: poster_path
              ? `https://image.tmdb.org/t/p/w500${poster_path}`
              : "https://placehold.co/600x400/101010/ffffff.png",
          }}
          className="w-full h-52 rounded-3xl"
          resizeMode="cover"
        />
        <View style={styles.ratingVote}>
          <Image source={icons.star} style={styles.iconStar} />
          <Text className="text-xs text-white font-extrabold uppercase">
            {vote_average.toFixed(1)}
          </Text>
        </View>

        <Text className="text-sm font-bold text-white mt-2" numberOfLines={1}>
          {title}
        </Text>

        <View className="flex-row items-center justify-between">
          <Text className="text-xs text-light-300 font-bold mt-1">
            {release_date?.split("-")[0]}
          </Text>
        </View>
      </TouchableOpacity>
    </Link>
  );
};

export default MovieCard;
const styles = StyleSheet.create({
  ratingVote: {
    backgroundColor: "#6C4EE6",
    width: 41,
    height: 23,

    alignItems: "center",
    borderRadius: 7,
    flexDirection: "row",
    marginLeft: 75,
    paddingHorizontal: 3,
  },
  iconStar: {
    width: 14,
    height: 14,
    marginRight: 4,
  },
});
