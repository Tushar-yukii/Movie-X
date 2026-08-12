import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { memo, useCallback } from "react";
import HeroSlider from "@/components/HeroSlider";
import SeriesCard from "@/components/SeriesCard";
import useWebSeriesPage from "@/services/useWebSeriespage";
import TopBar from "@/components/TopBar";

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

  //  before any early returns
  const renderSeriesCard = useCallback(
    ({ item }: { item: any }) => <MemoSeriesCard item={item} />,
    [],
  );

  //  before any early returns
  const ListHeader = useCallback(
    () => (
      <>
        <HeroSlider slides={heroSlides} type="tv" label="Series" />

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
              removeClippedSubviews={true}
            />
          </View>
        )}

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
              removeClippedSubviews={true}
            />
          </View>
        )}

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
              removeClippedSubviews={true}
            />
          </View>
        )}

        <View style={{ height: 24 }} />
      </>
    ),
    [heroSlides, trendingSeries, recentlyCompleted, upcomingSeries, renderSeriesCard],
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
      <TopBar searchTab="Series" />
      <FlatList
        data={[]}
        renderItem={null}
        ListHeaderComponent={ListHeader}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        removeClippedSubviews={true}
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