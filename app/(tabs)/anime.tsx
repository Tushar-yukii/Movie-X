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

  const renderAnimeCard = useCallback(
    ({ item }: { item: any }) => <MemoAnimeCard item={item} />,
    [],
  );

  // ListHeader defined at top level — after hooks, before return
  const ListHeader = useCallback(
    () => (
      <>
        <HeroSlider slides={heroSlides} label="Anime" type="tv" />

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
    ),
    [heroSlides, trendingAnime, popularAnime, upcomingAnime, renderAnimeCard],
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

  return (
    <View style={styles.container}>
      <TopBar searchTab="Anime" />
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
