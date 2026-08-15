import HeroSlider from "@/components/HeroSlider";
import SeriesCard from "@/components/SeriesCard";
import TopBar from "@/components/TopBar";
import useWebSeriesPage from "@/services/useWebSeriespage";
import { memo, useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";

type SeriesItem = {
  series_id: number;
  title: string;
  poster_url: string | null;
  release_date: string | null;
};

const MemoSeriesCard = memo(function MemoSeriesCard({
  item,
}: {
  item: SeriesItem;
}) {
  return <SeriesCard series={item} />;
});

export default function WebSeriesScreen() {
  const {
    heroSlides = [],
    trendingSeries = [],
    recentlyCompleted = [],
    topSeries = [],
    loading,
    error,
  } = useWebSeriesPage();

  const renderSeriesCard = useCallback(({ item }: { item: SeriesItem }) => {
    return <MemoSeriesCard item={item} />;
  }, []);

  const ListHeader = useCallback(() => {
    return (
      <>
        <HeroSlider slides={heroSlides} type="tv" label="Series" />

        {/* TRENDING WEB SERIES */}

        {trendingSeries.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trending Web Series</Text>

            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={trendingSeries}
              contentContainerStyle={styles.horizontalList}
              renderItem={renderSeriesCard}
              keyExtractor={(item) => `trending-series-${item.series_id}`}
              decelerationRate="fast"
              initialNumToRender={4}
              maxToRenderPerBatch={4}
              windowSize={3}
              removeClippedSubviews
            />
          </View>
        )}

        {/* RECENTLY COMPLETED */}

        {recentlyCompleted.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recently Completed</Text>

            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={recentlyCompleted}
              contentContainerStyle={styles.horizontalList}
              renderItem={renderSeriesCard}
              keyExtractor={(item) => `completed-series-${item.series_id}`}
              decelerationRate="fast"
              initialNumToRender={4}
              maxToRenderPerBatch={4}
              windowSize={3}
              removeClippedSubviews
            />
          </View>
        )}

        {/* TOP SERIES */}

        {topSeries.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Series</Text>

            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={topSeries}
              contentContainerStyle={styles.horizontalList}
              renderItem={renderSeriesCard}
              keyExtractor={(item) => `top-series-${item.series_id}`}
              decelerationRate="fast"
              initialNumToRender={4}
              maxToRenderPerBatch={4}
              windowSize={3}
              removeClippedSubviews
            />
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </>
    );
  }, [
    heroSlides,
    trendingSeries,
    recentlyCompleted,
    topSeries,
    renderSeriesCard,
  ]);

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
        contentContainerStyle={styles.mainList}
        removeClippedSubviews
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

  mainList: {
    paddingBottom: 100,
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

  horizontalList: {
    paddingHorizontal: 16,
    gap: 12,
  },

  bottomSpacing: {
    height: 24,
  },

  errorText: {
    color: "#EF4444",
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 20,
  },
});
