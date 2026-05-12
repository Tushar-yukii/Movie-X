// 3td button show - top rated trending , popular movies

import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { memo, useCallback } from "react";
import useMoviesPage from "@/services/useMoviesPage";
import HeroSlider from "@/components/HeroSlider";
import TrendingCard from "@/components/TrendingCard";
import TopBar from "@/components/TopBar";

// MemoMovieCard — prevents unnecessary re-renders
// on horizontal scroll
const MemoMovieCard = memo(({ item }: { item: any }) => (
  <TrendingCard movie={item} />
));

export default function MoviesScreen() {
  const {
    heroSlides,
    trendingMovies,
    popularMovies,
    top10Movies,
    loading,
    error,
  } = useMoviesPage();

  // ✅ Define ALL renderItem callbacks here at top level
  const renderMovieCard = useCallback(
    ({ item }: { item: any }) => <MemoMovieCard item={item} />,
    [],
  );

  const renderRankedCard = useCallback(
    ({ item }: { item: any }) => (
      <View style={styles.rankedCard}>
        <TrendingCard movie={item} />
      </View>
    ),
    [],
  );

  const ListHeader = useCallback(() => (
    <>
      <HeroSlider slides={heroSlides} label="Movie" type="movie" />

      {trendingMovies.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trending Movies</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={trendingMovies}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 2 }}
            renderItem={renderMovieCard}  // ✅ use ref, not inline useCallback
            keyExtractor={(item) => `trending-${item.movie_id}`}
            decelerationRate="fast"
            initialNumToRender={4}
            maxToRenderPerBatch={4}
            windowSize={3}
          />
        </View>
      )}

      {popularMovies.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Movies</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={popularMovies}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 2 }}
            renderItem={renderMovieCard}  // ✅ reuse same ref
            keyExtractor={(item) => `popular-${item.movie_id}`}
            decelerationRate="fast"
            initialNumToRender={4}
            maxToRenderPerBatch={4}
            windowSize={3}
          />
        </View>
      )}

      {top10Movies.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Movies</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={top10Movies}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 1 }}
            renderItem={renderRankedCard}  // ✅ use ref
            keyExtractor={(item) => `top10-${item.movie_id}`}
            decelerationRate="fast"
            initialNumToRender={4}
            maxToRenderPerBatch={4}
            windowSize={3}
          />
        </View>
      )}

      <View style={{ height: 24 }} />
    </>
  ), [heroSlides, trendingMovies, popularMovies, top10Movies, renderMovieCard, renderRankedCard]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#AB8BFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Error: {error.message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopBar />
      <FlatList
        data={[]}
        renderItem={null}
        ListHeaderComponent={ListHeader}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0D1A",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#0D0D1A",
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
    color: "#EF4444",
    fontSize: 14,
    textAlign: "center",
  },
  // Ranked card wrapper
  rankedCard: {
    position: "relative",
    marginRight: 1,
  },

  rankNumber: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },
});
