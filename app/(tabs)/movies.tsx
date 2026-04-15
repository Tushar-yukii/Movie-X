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

  // Stable renderItem — no new function reference on re-render
  const renderMovieCard = useCallback(
    ({ item }: { item: any }) => <MemoMovieCard item={item} />,
    [],
  );

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

  // All sections inside ListHeaderComponent
  // Same pattern as home + web series pages
  // One FlatList scrolls everything smoothly
  const ListHeader = () => (
    <>
      {/* Hero Slider — 15 top rated movies
          label="Movie" shows "Movie" instead of "Anime"/"Series" */}
      <HeroSlider slides={heroSlides} label="Movie" />

      {/* Trending Movies */}
      {trendingMovies.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trending Movies</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={trendingMovies}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 2 }}
            renderItem={renderMovieCard}
            keyExtractor={(item) => `trending-${item.movie_id}`}
            decelerationRate="fast"
            initialNumToRender={4}
            maxToRenderPerBatch={4}
            windowSize={3}
          />
        </View>
      )}

      {/* Popular Movies */}
      {popularMovies.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Movies</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={popularMovies}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 2 }}
            renderItem={renderMovieCard}
            keyExtractor={(item) => `popular-${item.movie_id}`}
            decelerationRate="fast"
            initialNumToRender={4}
            maxToRenderPerBatch={4}
            windowSize={3}
          />
        </View>
      )}

      {/* Top 10 Movies — exactly 10 item */}
      {top10Movies.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Movies</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={top10Movies}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 1 }}
            renderItem={({ item, index }) => (
              //  Wrapper View to add ranking number badge
              <View style={styles.rankedCard}>
                <TrendingCard movie={item} />
              </View>
            )}
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
  );

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
