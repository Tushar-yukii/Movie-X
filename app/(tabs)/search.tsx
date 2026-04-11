import type { Movie } from "@/services/api";
import { useState, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { icons } from "@/constants/icons";
import useFetch from "@/services/useFetch";
import { fetchMovies } from "@/services/api";
import { useRouter } from "expo-router";

const Search = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: movies = [],
    loading,
    error,
    refetch: loadMovies,
    reset,
  } = useFetch(() => fetchMovies({ query: searchQuery }), false);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  // Debounced search — waits 500ms after user stops typing
  // before making API call. Prevents calling API on every keystroke
  // Example: user types "Naruto" → API called once after pause
  // not 6 times for N-a-r-u-t-o
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (searchQuery.trim()) {
        await loadMovies();
      } else {
        reset();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  return (
    <View style={styles.container}>
      {/* ── Search Input Bar at top ──
          Stays fixed at top, results scroll below it
          autoFocus opens keyboard immediately when tab opens */}
      <View style={styles.searchBarWrapper}>
        <View style={styles.searchInputRow}>
          <Image
            source={icons.search}
            style={styles.searchIcon}
            contentFit="contain"
            tintColor="#6B7280"
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search movies, anime..."
            placeholderTextColor="#6B7280"
            value={searchQuery}
            onChangeText={handleSearch}
            returnKeyType="search"
            autoCapitalize="none"
          />
          {/* Clear button — only shows when text is typed */}
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery("");
                reset();
              }}
            >
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Loading spinner ── */}
      {loading && (
        <ActivityIndicator
          size="large"
          color="#6C63FF"
          style={{ marginTop: 30 }}
        />
      )}

      {/* ── Error message ── */}
      {error && <Text style={styles.errorText}>Error: {error.message}</Text>}

      {/* ── Results List — like Image 2 ── 
          Each row: small poster | title + date + type
          Separator line between each result               */}
      {!loading && !error && (
        <FlatList
          data={movies as Movie[]}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          contentContainerStyle={{ paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
          // 🧠 Thin dashed separator line between results
          // exactly like Image 2's dividers
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.resultRow}
              activeOpacity={0.7}
              onPress={() =>
                router.push({
                  pathname: "/movies/[id]",
                  params: { id: item.id.toString() },
                })
              }
            >
              {/* Small poster — left side */}
              <Image
                source={{
                  uri: item.poster_path
                    ? `https://image.tmdb.org/t/p/w92${item.poster_path}`
                    : "https://placehold.co/92x138/1a1a1a/FFFFFF.png",
                }}
                style={styles.poster}
                contentFit="cover"
              />

              {/* Title + meta — right side */}
              <View style={styles.resultInfo}>
                {/* Movie title — bold white */}
                <Text style={styles.resultTitle} numberOfLines={2}>
                  {item.title}
                </Text>

                {/* Date • Type • Runtime row — like Image 2 */}
                <View style={styles.metaRow}>
                  {item.release_date && (
                    <Text style={styles.metaText}>{item.release_date}</Text>
                  )}
                  <View style={styles.metaDot} />
                  <Text style={styles.metaText}>Movie</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          // ── Empty states ──
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery.trim()
                  ? `No results found for "${searchQuery}"`
                  : "Start typing to search movies..."}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

export default Search;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0D1A",
    paddingTop: Platform.OS === "ios" ? 56 : 48,
  },

  // ── Search bar ──
  searchBarWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    // Subtle bottom border separates search bar from results
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  searchInputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A2E",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 10,
  },
  searchIcon: {
    width: 18,
    height: 18,
  },
  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
    paddingVertical: 0,
  },
  clearBtn: {
    color: "#6B7280",
    fontSize: 16,
    paddingHorizontal: 4,
  },

  // ── Result row — like Image 2 ──
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
  },
  poster: {
    width: 56,
    height: 84,
    borderRadius: 6,
    backgroundColor: "#1A1A2E",
  },
  resultInfo: {
    flex: 1,
    gap: 6,
  },
  resultTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  metaText: {
    color: "#6B7280",
    fontSize: 12,
  },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#6B7280",
  },

  // ── Separator ──
  // Dashed look using low opacity — like Image 2's dividers
  separator: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.07)",
    marginHorizontal: 16,
  },

  // ── Empty & Error ──
  emptyContainer: {
    marginTop: 60,
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyText: {
    color: "#6B7280",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 14,
    padding: 20,
    textAlign: "center",
  },
});
