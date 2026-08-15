import AnimeCard from "@/components/AnimeCard";
import HeroSlider from "@/components/HeroSlider";
import SeriesCard from "@/components/SeriesCard";
import TopBar from "@/components/TopBar";
import TrendingCard from "@/components/TrendingCard";

import { icons } from "@/constants/icons";

import { fetchMovies, fetchTopSeries } from "@/services/api";
import useFetch from "@/services/useFetch";
import useHeroAnime from "@/services/useHeroAnime";
import useTrendingAnime from "@/services/useTrendingAnime";
import useTrendingMovies from "@/services/useTrendingMovies";

import { Image } from "expo-image";
import { useRouter } from "expo-router";

import { memo, useCallback, useMemo, useState } from "react";

import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

/* 
   Memoized cards
 */

const MemoTrendingCard = memo(function MemoTrendingCard({
  item,
}: {
  item: any;
}) {
  return <TrendingCard movie={item} />;
});

const MemoAnimeCard = memo(function MemoAnimeCard({ item }: { item: any }) {
  return <AnimeCard anime={item} />;
});

/* 
   Home screen
 */

export default function Index() {
  const router = useRouter();

  /* 
     Search state
   */

  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  /* 
     Hero
   */

  const { slides, loading: heroLoading } = useHeroAnime();

  /* 
     Trending anime
   */

  const {
    trendingAnime,
    loading: animeLoading,
    error: animeError,
  } = useTrendingAnime();

  /* 
     Trending movies
   */

  const {
    trendingMovies,
    loading: trendingLoading,
    error: trendingError,
  } = useTrendingMovies();

  /* 
     Top series

     IMPORTANT:
     This function is memoized.
     Therefore useFetch does not receive a new
     function on every render.
   */

  const fetchTopSeriesData = useCallback(() => {
    return fetchTopSeries();
  }, []);

  const {
    data: topSeries,
    loading: topSeriesLoading,
    error: topSeriesError,
  } = useFetch(fetchTopSeriesData);

  const uniqueTopSeries = useMemo(() => {
    if (!topSeries || !Array.isArray(topSeries)) {
      return [];
    }

    const seen = new Set<number>();

    return topSeries.filter((item: any) => {
      if (!item?.id) {
        return false;
      }

      if (seen.has(item.id)) {
        return false;
      }

      seen.add(item.id);
      return true;
    });
  }, [topSeries]);

  /* 
     Global loading
   */

  const isLoading =
    heroLoading || animeLoading || trendingLoading || topSeriesLoading;

  /* 
     Global error
   */

  const errorMessage =
    animeError?.message ||
    trendingError?.message ||
    topSeriesError?.message ||
    null;

  /* 
     Anime card renderer
   */

  const renderAnimeCard = useCallback(({ item }: { item: any }) => {
    return <MemoAnimeCard item={item} />;
  }, []);

  /* 
     Trending movie card renderer
   */

  const renderTrendingCard = useCallback(({ item }: { item: any }) => {
    return <MemoTrendingCard item={item} />;
  }, []);

  /* 
     Search
   */

  const handleSearch = useCallback(async (text: string) => {
    setSearchQuery(text);

    const query = text.trim();

    if (query.length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);

    try {
      const results = await fetchMovies({
        query,
      });

      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  /* 
     Close search
   */

  const closeSearch = useCallback(() => {
    setSearchVisible(false);
    setSearchQuery("");
    setSearchResults([]);
    setSearchLoading(false);
  }, []);

  /* 
     Open search
   */

  const openSearch = useCallback(() => {
    setSearchVisible(true);
  }, []);

  /* 
     Home list header
   */

  const ListHeader = useCallback(() => {
    /* 
       Loading
     */

    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#AB8BFF" />
        </View>
      );
    }

    /* 
       Error
     */

    if (errorMessage) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>

          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      );
    }

    /* 
       Main home content
     */

    return (
      <>
        {/* Hero */}

        {slides.length > 0 && (
          <HeroSlider slides={slides} label="Anime" type="tv" />
        )}

        {/* Trending anime */}

        {trendingAnime.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trending Anime</Text>

            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={trendingAnime}
              contentContainerStyle={styles.horizontalContent}
              renderItem={renderAnimeCard}
              keyExtractor={(item, index) => `anime-${item.anime_id}-${index}`}
              decelerationRate="fast"
              initialNumToRender={4}
              maxToRenderPerBatch={4}
              windowSize={3}
            />
          </View>
        )}

        {/* Trending movies */}

        {trendingMovies.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trending Movies</Text>

            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={trendingMovies}
              contentContainerStyle={styles.horizontalContent}
              renderItem={renderTrendingCard}
              keyExtractor={(item, index) => `movie-${item.movie_id}-${index}`}
              decelerationRate="fast"
              initialNumToRender={4}
              maxToRenderPerBatch={4}
              windowSize={3}
            />
          </View>
        )}

        {/* Top series */}

        {/* Top series */}

        {uniqueTopSeries.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Series</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalstyle}
              decelerationRate="fast"
            >
              {uniqueTopSeries.map((item: any) => (
                <View key={`top-series-${item.id}`} style={styles.rankedCard}>
                  <SeriesCard
                    series={{
                      series_id: item.id,
                      title: item.name,
                      poster_url: item.poster_path
                        ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                        : null,
                      release_date: item.first_air_date ?? null,
                    }}
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        )}
        <View style={styles.bottomSpacing} />
      </>
    );
  }, [
    isLoading,
    errorMessage,
    slides,
    trendingAnime,
    trendingMovies,
    uniqueTopSeries,
    renderAnimeCard,
    renderTrendingCard,
  ]);

  /* 
     Main screen
   */

  return (
    <View style={styles.container}>
      <TopBar onSearchPress={openSearch} searchTab="Movies" />

      <FlatList
        data={[]}
        renderItem={null}
        ListHeaderComponent={ListHeader}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.mainListContent}
      />

      {/* Search overlay */}

      {searchVisible && (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.searchOverlay}
        >
          {/* Search input */}

          <View style={styles.searchInputRow}>
            <Image
              source={icons.search}
              style={styles.searchInputIcon}
              contentFit="contain"
              tintColor="#6B7280"
            />

            <TextInput
              style={styles.searchInput}
              placeholder="Search movies, anime..."
              placeholderTextColor="#6B7280"
              value={searchQuery}
              onChangeText={handleSearch}
              autoFocus
              returnKeyType="search"
              autoCapitalize="none"
            />

            <TouchableOpacity onPress={closeSearch} activeOpacity={0.7}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Search loading */}

          {searchLoading && (
            <ActivityIndicator color="#6C63FF" style={styles.searchLoader} />
          )}

          {/* Initial message */}

          {!searchLoading && searchQuery.trim().length < 2 && (
            <Text style={styles.noResults}>Start typing to search...</Text>
          )}

          {/* No results */}

          {!searchLoading &&
            searchQuery.trim().length >= 2 &&
            searchResults.length === 0 && (
              <Text style={styles.noResults}>
                No results found for {searchQuery}
              </Text>
            )}

          {/* Search results */}

          {!searchLoading && searchResults.length > 0 && (
            <FlatList
              data={searchResults}
              keyExtractor={(item, index) => `search-${item.id}-${index}`}
              contentContainerStyle={styles.searchResultsContent}
              keyboardShouldPersistTaps="handled"
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.resultRow}
                  activeOpacity={0.7}
                  onPress={() => {
                    closeSearch();

                    router.push({
                      pathname: "/movies/[id]",
                      params: {
                        id: item.id.toString(),
                        type: "movie",
                      },
                    });
                  }}
                >
                  <Image
                    source={{
                      uri: item.poster_path
                        ? `https://image.tmdb.org/t/p/w92${item.poster_path}`
                        : "https://placehold.co/92x138/1a1a1a/FFFFFF.png",
                    }}
                    style={styles.resultPoster}
                    contentFit="cover"
                  />

                  <View style={styles.resultInfo}>
                    <Text style={styles.resultTitle} numberOfLines={2}>
                      {item.title}
                    </Text>

                    <View style={styles.resultMeta}>
                      <Text style={styles.resultYear}>
                        {item.release_date?.split("-")[0] ?? "—"}
                      </Text>

                      <View style={styles.metaDot} />

                      <Text style={styles.resultType}>Movie</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

/* 
   Styles
 */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0D1A",
  },

  mainListContent: {
    paddingBottom: 100,
  },

  loadingContainer: {
    minHeight: 500,
    justifyContent: "center",
    alignItems: "center",
  },

  errorContainer: {
    paddingHorizontal: 20,
    marginTop: 120,
    alignItems: "center",
  },

  errorTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },

  errorText: {
    color: "#EF4444",
    fontSize: 14,
    textAlign: "center",
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

  horizontalContent: {
    paddingHorizontal: 16,
    gap: 2,
  },
  horizontalstyle: {
    paddingHorizontal: 16,
    gap: 2,
  },

  bottomSpacing: {
    height: 24,
  },

  /* Search */

  searchOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#0D0D1A",
    zIndex: 20,
    paddingTop: Platform.OS === "ios" ? 56 : 48,
  },

  searchInputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A2E",
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },

  searchInputIcon: {
    width: 18,
    height: 18,
  },

  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 15,
    paddingVertical: 0,
  },

  closeBtn: {
    color: "#6B7280",
    fontSize: 18,
    paddingHorizontal: 4,
  },

  searchLoader: {
    marginTop: 24,
  },

  searchResultsContent: {
    paddingBottom: 100,
  },

  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },

  resultPoster: {
    width: 52,
    height: 78,
    borderRadius: 6,
    backgroundColor: "#1A1A2E",
  },

  resultInfo: {
    flex: 1,
  },

  resultTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },

  resultMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  resultYear: {
    color: "#6B7280",
    fontSize: 12,
  },

  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#6B7280",
  },

  resultType: {
    color: "#6B7280",
    fontSize: 12,
  },

  separator: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginHorizontal: 16,
  },

  noResults: {
    color: "#6B7280",
    fontSize: 14,
    textAlign: "center",
    marginTop: 40,
  },

  /* Top series */

  rankedCard: {
    position: "relative",
    marginRight: 12,
  },
});
