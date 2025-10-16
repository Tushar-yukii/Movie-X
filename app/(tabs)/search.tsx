import {
  View,
  Text,
  Image,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import React, { useEffect, useState } from "react";
import { images } from "@/constants/images";
import MovieCard from "@/components/MovieCard";
import useFetch from "@/services/useFetch";
import { fetchMovies } from "@/services/api";
import { icons } from "@/constants/icons";
import SearchBar from "@/components/SearchBar";
import { updateSearchCount } from "@/services/appwrite";
import { Sun, Moon } from "lucide-react-native"; // for icons

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [darkMode, setDarkMode] = useState(true);

  const {
    data: movies,
    loading,
    error,
    refetch: loadMovies,
    reset,
  } = useFetch(
    () =>
      fetchMovies({
        query: searchQuery,
      }),
    false
  );

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (searchQuery.trim()) {
        await loadMovies();

        // Call updateSearchCount only if there are results
        if (movies?.length! > 0 && movies?.[0]) {
          await updateSearchCount(searchQuery, movies[0]);
        }
      } else {
        reset();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // theme colors
  const backgroundColor = darkMode ? "#2e144f" : "#ffffff";
  const textColor = darkMode ? "#ffffff" : "#000000";

  return (
    <View className="flex-1" style={{ backgroundColor }}>
      {/* Toggle Button */}
      <View className="absolute right-5 top-14 z-50">
        <TouchableOpacity
          onPress={() => setDarkMode(!darkMode)}
          style={{
            backgroundColor: darkMode ? "#ffffff22" : "#00000010",
            borderRadius: 20,
            padding: 10,
          }}
        >
          {darkMode ? (
            <Sun size={22} color="#fff" />
          ) : (
            <Moon size={22} color="#000" />
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        data={movies}
        renderItem={({ item }) => <MovieCard {...item} />}
        keyExtractor={(item) => item.id.toString()}
        className="px-5"
        numColumns={3}
        columnWrapperStyle={{
          justifyContent: "center",
          gap: 16,
          marginVertical: 15,
        }}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListHeaderComponent={
          <>
            <View className="w-full flex-row justify-center mt-20 items-center">
              <Image source={icons.logo} style={styles.logoImg} />
            </View>
            <View className="my-1">
              <SearchBar
                placeholder="Search 2000+ movies..."
                value={searchQuery}
                onChangeText={(text: string) => setSearchQuery(text)}
              />
            </View>
            {loading && (
              <ActivityIndicator
                size="large"
                color="#0000ff"
                className="my-3"
              />
            )}

            {error && (
              <Text className="text-blue-500 px-5 my-3">
                {" "}
                Error : {error.message}
              </Text>
            )}
            {!loading &&
              !error &&
              searchQuery.trim() &&
              movies?.length! > 0 && (
                <Text
                  style={{ color: textColor }}
                  className="text-xl font-bold px-5"
                >
                  Search Results for{" "}
                  <Text className="text-accent">{searchQuery}</Text>
                </Text>
              )}
          </>
        }
        ListEmptyComponent={
          !loading && !error ? (
            <View className="mt-10 px-5">
              <Text
                className="text-center"
                style={{ color: darkMode ? "#aaa" : "#666" }}
              >
                {searchQuery.trim()
                  ? "No movies found"
                  : "Search for a movie..."}
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

export default Search;

const styles = StyleSheet.create({
  logoImg: {
    width: 55,
    height: 65,
    marginRight: 300,
    bottom: 59,
    right: 20,
  },
});
