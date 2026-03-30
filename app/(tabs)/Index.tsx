import SearchBar from "@/components/SearchBar";
import { icons } from "@/constants/icons";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { fetchMovies } from "@/services/api";
import useFetch from "@/services/useFetch";
import MovieCard from "@/components/MovieCard";
import TrendingCard from "@/components/TrendingCard";
import useTrendingMovies from "@/services/useTrendingMovies"; // ✅ new import

export default function Index() {
  const router = useRouter();

  // ✅ Replaced getTrendingMovies (Appwrite) with TMDB hook
  const { trendingMovies, loading: trendingLoading, error: trendingError } = useTrendingMovies();

  const {
    data: movies,
    loading: moviesLoading,
    error: moviesError,
  } = useFetch(() => fetchMovies({ query: "" }));

  return (
    <View style={styles.homestyle}>
      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ minHeight: "100%", paddingBottom: 10 }}
      >
        <Image source={icons.logo} style={styles.logo} contentFit="contain" />
        <Image source={icons.person} style={styles.personLogo} contentFit="contain" />

        {moviesLoading || trendingLoading ? (
          <ActivityIndicator
            size="large"
            color="#AB8BFF"
            className="mt-10 self-center"
          />
        ) : moviesError || trendingError ? (
          <Text style={{ color: "white" }}>
            Error: {moviesError?.message || trendingError?.message}
          </Text>
        ) : (
          <View className="flex-1 mt-1 bottom-4">
            <SearchBar
              onPress={() => router.push("/search")}
              placeholder="Search across 2000+ Movies..."
            />

            {/* ✅ Trending — now from TMDB, 30 unique movies, no numbers */}
            {trendingMovies.length > 0 && (
              <View className="mt-10">
                <Text className="text-lg text-white font-bold mb-3">
                  Trending Movies
                </Text>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="mb-4 mt-3"
                  data={trendingMovies}
                  contentContainerStyle={{ gap: 12 }}
                  renderItem={({ item }) => (
                    <TrendingCard movie={item} /> //  no index prop needed
                  )}
                  keyExtractor={(item) => item.movie_id.toString()}
                />
              </View>
            )}

            <>
              <Text className="text-lg text-white font-bold mt-5 mb-3 ml-1">
                Latest Movies
              </Text>
              <FlatList
                data={movies}
                renderItem={({ item }) => <MovieCard {...(item as any)} />}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                numColumns={3}
                columnWrapperStyle={{
                  justifyContent: "flex-start",
                  gap: 20,
                  paddingRight: 5,
                  marginBottom: 10,
                }}
                className="mt-2 pb-32"
                scrollEnabled={false}
              />
            </>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  homestyle: {
    flex: 1,
    backgroundColor: "#0D0D1A",
  },
  logo: {
    width: 55,
    height: 65,
    marginTop: 10,
    marginRight: 100,
  },
  personLogo: {
    width: 30,
    height: 35,
    marginTop: 1,
    marginLeft: 370,
    bottom: 50,
  },
});