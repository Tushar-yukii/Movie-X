import { icons } from "@/constants/icons";
import {
  ActivityIndicator,
  FlatList,
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
import { memo, useCallback } from "react";

// Memoized MovieCard wrapper — prevents unnecessary re-renders
// useCallback on renderItem is critical — without it FlatList
// gets a new function reference every render and re-renders all items
const MemoMovieCard = memo(({ item }: { item: any }) => (
  <MovieCard {...item} />
));

export default function Index() {
  const router = useRouter();

  const { slides, loading: heroLoading } = useHeroAnime();
  const { trendingAnime, loading: animeLoading, error: animeError } = useTrendingAnime();
  const { trendingMovies, loading: trendingLoading, error: trendingError } = useTrendingMovies();
  const { data: movies, loading: moviesLoading, error: moviesError } = useFetch(
    () => fetchMovies({ query: "" })
  );

  const isLoading = heroLoading || animeLoading || trendingLoading || moviesLoading;
  const isError = animeError || trendingError || moviesError;

  // useCallback prevents new function reference on every render
  const renderMovieCard = useCallback(
    ({ item }: { item: any }) => <MemoMovieCard item={item} />,
    []
  );

  const keyExtractor = useCallback(
    (item: any, index: number) => `${item.id}-${index}`,
    []
  );

  // ListHeaderComponent — everything above the movie grid
  // This is the key trick: HeroSlider, Anime, Movies sections
  // all become the "header" of one single FlatList
  // So React Native only renders what's visible on screen
  const ListHeader = useCallback(() => {
    if (isLoading) {
      return (
        <ActivityIndicator
          size="large"
          color="#AB8BFF"
          style={{ marginTop: 120 }}
        />
      );
    }

    if (isError) {
      return (
        <Text style={styles.errorText}>
          Error: {animeError?.message || trendingError?.message || moviesError?.message}
        </Text>
      );
    }

    return (
      <>
        {/* Hero Slider */}
        <HeroSlider slides={slides} />

        {/* Trending Anime */}
        {trendingAnime.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trending Anime</Text>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={trendingAnime}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 2 }}
              renderItem={({ item }) => <AnimeCard anime={item} />}
              keyExtractor={(item) => item.anime_id.toString()}
              decelerationRate="fast"
              // Only render cards close to visible area
              initialNumToRender={4}
              maxToRenderPerBatch={4}
              windowSize={3}
            />
          </View>
        )}

        {/* Trending Movies */}
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
              initialNumToRender={4}
              maxToRenderPerBatch={4}
              windowSize={3}
            />
          </View>
        )}

        {/* Latest Movies title */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
          Latest Movies
        </Text>
      </>
    );
  }, [isLoading, isError, slides, trendingAnime, trendingMovies]);

  return (
    <View style={styles.container}>
      {/* Top bar floats over everything */}
      <View style={styles.topBar}>
        <LinearGradient
          colors={["rgba(0,0,0,0.55)", "transparent"]}
          style={styles.topBarGradientBg}
        />
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

      {/* Single FlatList for entire screen
          Why? FlatList uses virtualisation — only renders
          cards visible on screen + small buffer around them
          80 cards but only ~12 render at a time = smooth scroll */}
      <FlatList
        data={isLoading || isError ? [] : movies}
        renderItem={renderMovieCard}
        keyExtractor={keyExtractor}
        numColumns={4}
        columnWrapperStyle={{
          justifyContent: "space-between",
          paddingHorizontal: 12,
          marginBottom: 10,
        }}
        ListHeaderComponent={ListHeader}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        //  Performance props
        // initialNumToRender — only render 8 cards on first load
        initialNumToRender={8}
        // maxToRenderPerBatch — render 8 more cards per scroll batch
        maxToRenderPerBatch={8}
        // windowSize — keep 5 screen heights of cards in memory
        // cards outside this range are unmounted to free memory
        windowSize={5}
        // removeClippedSubviews — unmount cards that are off screen
        removeClippedSubviews={true}
        // updateCellsBatchingPeriod — wait 50ms between render batches
        // prevents UI thread from being blocked
        updateCellsBatchingPeriod={50}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0D1A",
  },
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
  personCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(99, 120, 255, 0.35)",
    borderWidth: 2,
    borderColor: "rgba(140, 160, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#6378FF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 8,
  },
  searchCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  iconImg: {
    width: 18,
    height: 18,
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