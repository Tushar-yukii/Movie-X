// app/(tabs)/search.tsx — now Web Series page

import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
  Platform,
} from "react-native";
import { memo, useCallback } from "react";
// import useWebSeriesPage from "@/services/useWebSeriesPage";
import HeroSlider from "@/components/HeroSlider";
import SeriesCard from "@/components/SeriesCard";
import useWebSeriesPage from "@/services/useWebSeriespage";

// Memoized SeriesCard for horizontal rows
const MemoSeriesCard = memo(({ item }: { item: any }) => (
  <SeriesCard series={item} />
));

export default function WebSeriesScreen() {
  const {
    heroSlides,
    trendingSeries,
    recentlyCompleted,
    upcomingSeries,
    loading,
    error,
  } = useWebSeriesPage();

  // ✅ Memoized renderItem — prevents re-renders
  const renderSeriesCard = useCallback(
    ({ item }: { item: any }) => <MemoSeriesCard item={item} />,
    []
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

  // ✅ ListHeaderComponent — hero slider + all 3 horizontal sections
  // Same pattern as home page — everything is header of one FlatList
  // So the page scrolls as one smooth unit
  const ListHeader = () => (
    <>
      {/* Hero Slider — 15 popular web series, auto slides */}
      <HeroSlider slides={heroSlides} />

      {/* Trending Web Series */}
      {trendingSeries.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trending Web Series</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={trendingSeries}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
            renderItem={renderSeriesCard}
            keyExtractor={(item) => item.series_id.toString()}
            decelerationRate="fast"
            initialNumToRender={4}
            maxToRenderPerBatch={4}
            windowSize={3}
          />
        </View>
      )}

      {/* Recently Completed */}
      {recentlyCompleted.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recently Completed</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={recentlyCompleted}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
            renderItem={renderSeriesCard}
            keyExtractor={(item) => `completed-${item.series_id}`}
            decelerationRate="fast"
            initialNumToRender={4}
            maxToRenderPerBatch={4}
            windowSize={3}
          />
        </View>
      )}

      {/* Upcoming Web Series */}
      {upcomingSeries.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Web Series</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={upcomingSeries}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
            renderItem={renderSeriesCard}
            keyExtractor={(item) => `upcoming-${item.series_id}`}
            decelerationRate="fast"
            initialNumToRender={4}
            maxToRenderPerBatch={4}
            windowSize={3}
          />
        </View>
      )}

      {/* Bottom spacing */}
      <View style={{ height: 24 }} />
    </>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={[]}               // empty — all content is in ListHeader
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