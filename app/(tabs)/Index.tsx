import { icons } from "@/constants/icons";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { fetchMovies } from "@/services/api";
import useFetch from "@/services/useFetch";
import TrendingCard from "@/components/TrendingCard";
import AnimeCard from "@/components/AnimeCard";
import HeroSlider from "@/components/HeroSlider";
import useTrendingMovies from "@/services/useTrendingMovies";
import useTrendingAnime from "@/services/useTrendingAnime";
import useHeroAnime from "@/services/useHeroAnime";
import { LinearGradient } from "expo-linear-gradient";
import { memo, useCallback, useState } from "react";
import TopBar from "@/components/TopBar";

// 🧠 MemoTrendingCard — only re-renders when props change
const MemoTrendingCard = memo(({ item }: { item: any }) => (
  <TrendingCard movie={item} />
));

export default function Index() {
  const router = useRouter();

  // Search state
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Data hooks
  const { slides, loading: heroLoading } = useHeroAnime();
  const {
    trendingAnime,
    loading: animeLoading,
    error: animeError,
  } = useTrendingAnime();
  const {
    trendingMovies,
    loading: trendingLoading,
    error: trendingError,
  } = useTrendingMovies();

  // fetchMovies with no query = popular/discover movies
  // Used for Popular Movies horizontal row
  const {
    data: movies,
    loading: moviesLoading,
    error: moviesError,
  } = useFetch(() => fetchMovies({ query: "" }));

  const isLoading =
    heroLoading || animeLoading || trendingLoading || moviesLoading;
  const isError = animeError || trendingError || moviesError;

  // Search handlers
  const handleSearch = async (text: string) => {
    setSearchQuery(text);
    if (text.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    try {
      const results = await fetchMovies({ query: text });
      setSearchResults(results);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setSearchLoading(false);
    }
  };

  const closeSearch = () => {
    setSearchVisible(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  // ListHeader contains ALL sections
  // movies added to dependency array so Popular Movies
  // section updates when movies data loads
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
          Error:{" "}
          {animeError?.message ||
            trendingError?.message ||
            moviesError?.message}
        </Text>
      );
    }

    return (
      <>
        {/* Hero Slider */}
        <HeroSlider slides={slides} label="Anime" />

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

        {/* Popular Movies — horizontal scroll
            Maps movies (Movie type) → TrendingCard shape
            TrendingCard expects: movie_id, title, poster_url, release_date
            Movie type has:       id,       title, poster_path, release_date
            So we map the shape difference here                              */}
        {movies && movies.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Popular Movies</Text>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={movies}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 2 }}
              renderItem={({ item }) => (
                <TrendingCard
                  movie={{
                    movie_id: item.id,
                    title: item.title,
                    poster_url: item.poster_path
                      ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                      : null,
                    release_date: item.release_date ?? null,
                  }}
                />
              )}
              keyExtractor={(item, index) => `popular-${item.id}-${index}`}
              decelerationRate="fast"
              initialNumToRender={4}
              maxToRenderPerBatch={4}
              windowSize={3}
            />
          </View>
        )}

        {/* Bottom spacing so last row isn't hidden by tab bar */}
        <View style={{ height: 24 }} />
      </>
    );
  }, [isLoading, isError, slides, trendingAnime, trendingMovies, movies]);

  return (
    <View style={styles.container}>
      {/* topbar */}
      {/* // index.tsx — Home page → Movies search tab */}
      <TopBar onSearchPress={() => setSearchVisible(true)} searchTab="Movies" />
      {/* // play.tsx — Movies page → Movies search tab */}
      <TopBar searchTab="Movies" />
      {/* // search.tsx — Series page → Series search tab */}
      <TopBar searchTab="Series" />
      {/* // saved.tsx — Anime page → Anime search tab */}
      <TopBar searchTab="Anime" />
      {/* Single FlatList — data=[] because everything
          is inside ListHeaderComponent
          No more numColumns or grid layout              */}
      <FlatList
        data={[]}
        renderItem={null}
        ListHeaderComponent={ListHeader}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
      {/* Inline Search Overlay */}
      {searchVisible && (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.searchOverlay}
        >
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

          {searchLoading && (
            <ActivityIndicator color="#6C63FF" style={{ marginTop: 24 }} />
          )}

          {!searchLoading && searchQuery.length < 2 && (
            <Text style={styles.noResults}>Start typing to search...</Text>
          )}

          {!searchLoading &&
            searchQuery.length >= 2 &&
            searchResults.length === 0 && (
              <Text style={styles.noResults}>
                No results found for "{searchQuery}"
              </Text>
            )}

          {!searchLoading && searchResults.length > 0 && (
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={{ paddingBottom: 100 }}
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
                      params: { id: item.id.toString() },
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
});
