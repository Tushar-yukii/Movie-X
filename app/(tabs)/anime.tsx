// app/(tabs)/saved.tsx — Anime Page

import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { memo, useCallback } from "react";
import useAnimePage from "@/services/useAnimePage";
import HeroSlider from "@/components/HeroSlider";
import AnimePageCard from "@/components/AnimePageCard";
import TopBar from "@/components/TopBar";

// MemoAnimeCard — only re-renders when props change
// Critical for smooth horizontal scroll performance
const MemoAnimeCard = memo(({ item }: { item: any }) => (
  <AnimePageCard anime={item} />
));

export default function AnimeScreen() {
  const {
    heroSlides,
    trendingAnime,
    popularAnime,
    upcomingAnime,
    loading,
    error,
  } = useAnimePage();

  // Stable renderItem — no new function on re-render
  const renderAnimeCard = useCallback(
    ({ item }: { item: any }) => <MemoAnimeCard item={item} />,
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

  // All 4 sections inside ListHeaderComponent
  // One FlatList scrolls everything as single unit
  const ListHeader = () => (
    <>
      {/* Hero Slider — 15 top rated anime
          label="Anime" shows correct text under title */}
      <HeroSlider slides={heroSlides} label="Anime" />

      {/* Trending Anime — 18+ results */}
      {trendingAnime.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trending Animes</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={trendingAnime}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 2 }}
            renderItem={renderAnimeCard}
            keyExtractor={(item) => `trending-${item.anime_id}`}
            decelerationRate="fast"
            initialNumToRender={4}
            maxToRenderPerBatch={4}
            windowSize={3}
          />
        </View>
      )}

      {/* Popular Anime */}
      {popularAnime.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Animes</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={popularAnime}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 2 }}
            renderItem={renderAnimeCard}
            keyExtractor={(item) => `popular-${item.anime_id}`}
            decelerationRate="fast"
            initialNumToRender={4}
            maxToRenderPerBatch={4}
            windowSize={3}
          />
        </View>
      )}

      {/* Upcoming Anime */}
      {upcomingAnime.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Animes</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={upcomingAnime}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 2 }}
            renderItem={renderAnimeCard}
            keyExtractor={(item) => `upcoming-${item.anime_id}`}
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
      {/* Same floating top bar as all other pages */}
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
});
