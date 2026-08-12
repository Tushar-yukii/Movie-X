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

import { memo, useCallback, useState } from "react";

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
   MEMOIZED CARDS
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
   HOME SCREEN
 */

export default function Index() {
  const router = useRouter();

  /* 
     SEARCH STATE
   */

  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  /* 
     HERO
  */

  const { slides, loading: heroLoading } = useHeroAnime();

  /* 
     TRENDING ANIME
   */

  const {
    trendingAnime,
    loading: animeLoading,
    error: animeError,
  } = useTrendingAnime();

  /* 
     TRNDING MOVIES
  */

  const {
    trendingMovies,
    loading: trendingLoading,
    error: trendingError,
  } = useTrendingMovies();

  /* 
     MOVIES
     
     We don't need the movie data here right now.
     We only need loading + error state.
   */

  const { loading: moviesLoading, error: moviesError } = useFetch(() =>
    fetchMovies({ query: "" }),
  );

  /* 
     TOP SERIES
  */

  const { data: topSeries, loading: topSeriesLoading } = useFetch(() =>
    fetchTopSeries(),
  );

  /* 
     GLOBAL LOADING / ERROR
  */

  const isLoading =
    heroLoading ||
    animeLoading ||
    trendingLoading ||
    moviesLoading ||
    topSeriesLoading;

  const isError = animeError || trendingError || moviesError;

  /* 
     ANIME CARD RENDERER
   */

  const renderAnimeCard = useCallback(
    ({ item }: { item: any }) => <MemoAnimeCard item={item} />,
    [],
  );

  /* 
     TRENDING MOVIE CARD RENDERER
   */

  const renderTrendingCard = useCallback(
    ({ item }: { item: any }) => <MemoTrendingCard item={item} />,
    [],
  );

  /* 
     SEARCH
   */

  const handleSearch = async (text: string) => {
    setSearchQuery(text);

    if (text.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);

    try {
      const results = await fetchMovies({
        query: text,
      });

      setSearchResults(results);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setSearchLoading(false);
    }
  };

  /* 
     CLOSE SEARCH
   */

  const closeSearch = () => {
    setSearchVisible(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  /* 
     LIST HEADER
     
     IMPORTANT:
     All values used inside this callback are included
     in the dependency array below.
   */

  const ListHeader = useCallback(() => {
    /* 
       LOADING
     */

    if (isLoading) {
      return (
        <ActivityIndicator
          size="large"
          color="#AB8BFF"
          style={{
            marginTop: 120,
          }}
        />
      );
    }

    /* 
       ERROR
     */

    if (isError) {
      return (
        <Text style={styles.errorText}>
          Error:{" "}
          {animeError?.message ||
            trendingError?.message ||
            moviesError?.message}
        </Text>
      );
    }

    /* 
       MAIN HOME CONTENT
     */

    return (
      <>
        {/* 
            HERO SLIDER
         */}

        <HeroSlider slides={slides} label="Anime" type="tv" />

        {/* 
            TRENDING ANIME
         */}

        {trendingAnime.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trending Anime</Text>

            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={trendingAnime}
              contentContainerStyle={{
                paddingHorizontal: 16,
                gap: 2,
              }}
              renderItem={renderAnimeCard}
              keyExtractor={(item) => item.anime_id.toString()}
              decelerationRate="fast"
              initialNumToRender={4}
              maxToRenderPerBatch={4}
              windowSize={3}
            />
          </View>
        )}

        {/* 
            TRENDING MOVIES
         */}

        {trendingMovies.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trending Movies</Text>

            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={trendingMovies}
              contentContainerStyle={{
                paddingHorizontal: 16,
                gap: 2,
              }}
              renderItem={renderTrendingCard}
              keyExtractor={(item) => item.movie_id.toString()}
              decelerationRate="fast"
              initialNumToRender={4}
              maxToRenderPerBatch={4}
              windowSize={3}
            />
          </View>
        )}

        {/* =
            TOP SERIES
        = */}

        {topSeries && topSeries.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Series</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 16,
                gap: 2,
              }}
              decelerationRate="fast"
            >
              {topSeries.map((item: any, index: number) => (
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

        {/* Bottom spacing */}
        <View style={{ height: 24 }} />
      </>
    );
  }, [
    isLoading,
    isError,

    slides,

    trendingAnime,
    trendingMovies,
    topSeries,

    animeError?.message,
    trendingError?.message,
    moviesError?.message,

    renderAnimeCard,
    renderTrendingCard,
  ]);

  /* =
     MAIN SCREEN
  = */

  return (
    <View style={styles.container}>
      {/* 
          TOP BAR
       */}

      <TopBar onSearchPress={() => setSearchVisible(true)} searchTab="Movies" />

      {/* 
          MAIN LIST
       */}

      <FlatList
        data={[]}
        renderItem={null}
        ListHeaderComponent={ListHeader}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 100,
        }}
      />

      {/* 
          SEARCH OVERLAY
       */}

      {searchVisible && (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.searchOverlay}
        >
          {/* 
              SEARCH INPUT
           */}

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
              autoFocus={true}
              returnKeyType="search"
              autoCapitalize="none"
            />

            <TouchableOpacity onPress={closeSearch}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* 
              SEARCH LOADING
           */}

          {searchLoading && (
            <ActivityIndicator
              color="#6C63FF"
              style={{
                marginTop: 24,
              }}
            />
          )}

          {/*
              INITIAL SEARCH MESSAGE
           */}

          {!searchLoading && searchQuery.length < 2 && (
            <Text style={styles.noResults}>Start typing to search...</Text>
          )}

          {/* 
              NO RESULTS
         */}

          {!searchLoading &&
            searchQuery.length >= 2 &&
            searchResults.length === 0 && (
              <Text style={styles.noResults}>
                No results found for {searchQuery}
              </Text>
            )}

          {/*
              SEARCH RESULTS
          */}

          {!searchLoading && searchResults.length > 0 && (
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={{
                paddingBottom: 100,
              }}
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
                  {/* 
                        POSTER
                    */}

                  <Image
                    source={{
                      uri: item.poster_path
                        ? `https://image.tmdb.org/t/p/w92${item.poster_path}`
                        : "https://placehold.co/92x138/1a1a1a/FFFFFF.png",
                    }}
                    style={styles.resultPoster}
                    contentFit="cover"
                  />

                  {/* RESULT INFORMATION */}

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

// STYLES

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0D1A",
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

  // SEARCH OVERLAY

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

  //  SEARCH RESULTS

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

  //TOP SERIES

  rankedCard: {
    position: "relative",

    marginRight: 12,
  },

  rankBadge: {
    position: "absolute",

    top: 8,
    left: 8,

    zIndex: 10,

    backgroundColor: "#6C63FF",

    paddingHorizontal: 8,
    paddingVertical: 3,

    borderRadius: 8,
  },

  rankNumber: {
    color: "#FFFFFF",

    fontSize: 11,

    fontWeight: "800",
  },
});
