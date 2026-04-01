import { icons } from "@/constants/icons";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { fetchMovies } from "@/services/api";
import useFetch from "@/services/useFetch";
import MovieCard from "@/components/MovieCard";
import TrendingCard from "@/components/TrendingCard";
import AnimeCard from "@/components/AnimeCard";
import HeroSlider from "@/components/HeroSlider";
import useTrendingMovies from "@/services/useTrendingMovies";
import useTrendingAnime from "@/services/useTrendingAnime";
import useHeroAnime from "@/services/useHeroAnime";
import { LinearGradient } from "expo-linear-gradient";
export default function Index() {
  const router = useRouter();

  const { slides, loading: heroLoading } = useHeroAnime();

  const {
    trendingAnime,
    loading: animeLoading,
    error: animeError,
  } = useTrendingAnime();

  const {
    trendingMovies,
    loading: trendingLoading,
    error: trendingError,
  } = useTrendingMovies();

  const {
    data: movies,
    loading: moviesLoading,
    error: moviesError,
  } = useFetch(() => fetchMovies({ query: "" }));

  const isLoading =
    heroLoading || animeLoading || trendingLoading || moviesLoading;
  const isError = animeError || trendingError || moviesError;

  return (
    <View style={styles.container}>
      {/* ── Top Bar floats over hero slider    */}
      <View style={styles.topBar}>
        <LinearGradient
          colors={["rgba(0,0,0,0.55)", "transparent"]}
          style={styles.topBarGradientBg}
        />
        {/* Person icon — left */}

        <TouchableOpacity
          onPress={() => router.push("/(tabs)/profile")}
          style={styles.personCircle}
        >
          <Image
            source={icons.person}
            style={styles.iconImg}
            contentFit="contain"
            tintColor="#FFFFFF"
          />
        </TouchableOpacity>

        {/* Search icon — right */}
        <TouchableOpacity
          onPress={() => router.push("/search")}
          style={styles.searchCircle}
        >
          <Image
            source={icons.search}
            style={styles.iconImg}
            contentFit="contain"
            tintColor="#FFFFFF"
          />
        </TouchableOpacity>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        // smooth momentum scrolling on iOS
        decelerationRate="normal"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {isLoading ? (
          <ActivityIndicator
            size="large"
            color="#AB8BFF"
            style={{ marginTop: 120 }}
          />
        ) : isError ? (
          <Text style={styles.errorText}>
            Error:{" "}
            {animeError?.message ||
              trendingError?.message ||
              moviesError?.message}
          </Text>
        ) : (
          <>
            {/* Hero Slider — full width, auto slides every 4s
                No padding here because we want it edge-to-edge */}
            <HeroSlider slides={slides} />

            {/* Trending Anime Section */}
            {trendingAnime.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Trending Anime</Text>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={trendingAnime}
                  // gap:12 gives spacing between cards
                  contentContainerStyle={{ paddingHorizontal: 16, gap: 2 }}
                  renderItem={({ item }) => <AnimeCard anime={item} />}
                  keyExtractor={(item) => item.anime_id.toString()}
                  // smooth deceleration when user swipes cards
                  decelerationRate="fast"
                />
              </View>
            )}

            {/* Trending Movies Section */}
            {trendingMovies.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Trending Movies</Text>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={trendingMovies}
                  contentContainerStyle={{ paddingHorizontal: 16, gap: 2 }}
                  renderItem={({ item }) => <TrendingCard movie={item} />}
                  keyExtractor={(item) => item.movie_id.toString()}
                  decelerationRate="fast"
                />
              </View>
            )}

            {/* Latest Movies Grid */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Latest Movies</Text>
              <FlatList
                data={movies}
                renderItem={({ item }) => <MovieCard {...(item as any)} />}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                numColumns={3}
                columnWrapperStyle={{
                  justifyContent: "flex-start",
                  gap: 20,
                  paddingHorizontal: 16,
                  marginBottom: 10,
                }}
                scrollEnabled={false}
              />
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0D1A",
  },
  // Floats over the hero slider at the top
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },

  topBarGradientBg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 110,
  },
  // frosted glass circle
  personCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(99, 120, 255, 0.35)", // blue-purple semi transparent fill
    borderWidth: 2,
    borderColor: "rgba(140, 160, 255, 0.9)", // bright blue outer border
    justifyContent: "center",
    alignItems: "center",
    // inner dark ring effect using shadow
    shadowColor: "#6378FF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 8, // Android glow
  },
  //  Icon image only — no background, no borderRadius
  iconImg: {
    width: 18,
    height: 18,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(200, 102, 241, 20)", // blue
    padding: 6,
  },
  searchBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)", // subtle background on icon
  },
  searchImg: {
    width: 22,
    height: 22,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  searchCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.08)", // barely visible fill
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.35)", // white subtle border
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  errorText: {
    color: "white",
    padding: 20,
    marginTop: 120,
  },
});
