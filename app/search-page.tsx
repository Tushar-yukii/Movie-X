// app/search-page.tsx
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { icons } from "@/constants/icons";
import { tmdbFetch } from "@/services/api";

type SearchTab = "Movies" | "Series" | "Anime";

export default function SearchPage() {
  const router = useRouter();

  const { defaultTab } = useLocalSearchParams<{ defaultTab: string }>();

  //  THE FIX IS HERE — these 4 lines replace the old useState line
  //  Problem before: useState(defaultTab || "Movies") ran immediately
  //    before useLocalSearchParams finished reading the URL params
  //    so defaultTab was always undefined on first render
  //    causing activeTab to always start as "Movies"
  //
  //  Fix: we validate the param BEFORE passing to useState
  //    validTabs array checks if param is one of our 3 real tabs
  //    if yes → use it directly
  //    if no (undefined/wrong value) → fallback to "Movies"
  //    This way useState gets the CORRECT value from the very start
  const validTabs: SearchTab[] = ["Movies", "Series", "Anime"];
  const initialTab: SearchTab =
    defaultTab && validTabs.includes(defaultTab as SearchTab)
      ? (defaultTab as SearchTab)
      : "Movies";
  const [activeTab, setActiveTab] = useState<SearchTab>(initialTab);

  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // When tab changes, re-run search with same query
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      handleSearch(searchQuery);
    }
  }, [activeTab]);

  // Debounced search — waits 500ms after typing stops
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        handleSearch(searchQuery);
      } else {
        setResults([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      let data: any[] = [];

      if (activeTab === "Movies") {
        const res = await tmdbFetch<{ results: any[] }>(
          `/search/movie?query=${encodeURIComponent(query)}`,
        );
        data = res.results;
      } else if (activeTab === "Series") {
        const res = await tmdbFetch<{ results: any[] }>(
          `/search/tv?query=${encodeURIComponent(query)}`,
        );
        data = res.results.filter(
          (item) => !item.origin_country?.includes("JP"),
        );
      } else if (activeTab === "Anime") {
        const res = await tmdbFetch<{ results: any[] }>(
          `/search/tv?query=${encodeURIComponent(query)}`,
        );
        data = res.results.filter(
          (item) =>
            item.origin_country?.includes("JP") || item.genre_ids?.includes(16),
        );
      }

      setResults(data);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleResultPress = (item: any) => {
    router.push({
      pathname: "/movies/[id]",
      params: { id: item.id.toString() },
    });
  };

  const getTitle = (item: any) => item.title || item.name || "Unknown";

  const getYear = (item: any) =>
    (item.release_date || item.first_air_date)?.split("-")[0] ?? "—";

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchInputRow}>
        <Image
          source={icons.search}
          style={styles.searchIcon}
          contentFit="contain"
          tintColor="#6B7280"
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          placeholderTextColor="#6B7280"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus={true}
          returnKeyType="search"
          autoCapitalize="none"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setSearchQuery("");
              setResults([]);
            }}
          >
            <Text style={styles.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabsRow}>
        {(["Movies", "Series", "Anime"] as SearchTab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={styles.tabBtn}
          >
            <View style={styles.tabIconRow}>
              <Image
                source={
                  tab === "Movies"
                    ? icons.tabHome
                    : tab === "Series"
                      ? icons.tabSeries
                      : icons.tabAnime
                }
                style={styles.tabIcon}
                contentFit="contain"
                tintColor={activeTab === tab ? "#6C63FF" : "#6B7280"}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.tabTextActive,
                ]}
              >
                {tab}
              </Text>
            </View>
            {/* Purple underline on active tab */}
            {activeTab === tab && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Divider */}
      <View style={styles.tabDivider} />

      {/* Loading */}
      {loading && (
        <ActivityIndicator
          color="#6C63FF"
          size="large"
          style={{ marginTop: 40 }}
        />
      )}

      {/* Empty state — before typing */}
      {!loading && results.length === 0 && searchQuery.length < 2 && (
        <View style={styles.emptyContainer}>
          <Image
            source={icons.search}
            style={styles.emptyIcon}
            contentFit="contain"
            tintColor="#3A3A5C"
          />
          <Text style={styles.emptyText}>
            Search for {activeTab.toLowerCase()}
          </Text>
        </View>
      )}

      {/* No results */}
      {!loading && results.length === 0 && searchQuery.length >= 2 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No {activeTab} found for "{searchQuery}"
          </Text>
        </View>
      )}

      {/* Results List */}
      {!loading && results.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.resultRow}
              activeOpacity={0.7}
              onPress={() => handleResultPress(item)}
            >
              <Image
                source={{
                  uri: item.poster_path
                    ? `https://image.tmdb.org/t/p/w92${item.poster_path}`
                    : "https://placehold.co/92x138/1a1a1a/FFFFFF.png",
                }}
                style={styles.poster}
                contentFit="cover"
              />
              <View style={styles.resultInfo}>
                <Text style={styles.resultTitle} numberOfLines={2}>
                  {getTitle(item)}
                </Text>
                <View style={styles.metaRow}>
                  <Text style={styles.metaText}>{getYear(item)}</Text>
                  <View style={styles.metaDot} />
                  <Text style={styles.metaText}>{activeTab}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0F",
    paddingTop: Platform.OS === "ios" ? 56 : 48,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1A1A2E",
    justifyContent: "center",
    alignItems: "center",
  },
  closeBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  searchInputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A2E",
    marginHorizontal: 16,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 10,
    marginBottom: 20,
  },
  searchIcon: {
    width: 20,
    height: 20,
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
  },
  tabsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
  },
  tabBtn: {
    flex: 1,
    alignItems: "center",
    paddingBottom: 12,
  },
  tabIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  tabIcon: {
    width: 18,
    height: 18,
  },
  tabText: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "600",
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  tabUnderline: {
    position: "absolute",
    bottom: 0,
    left: 16,
    right: 16,
    height: 2,
    backgroundColor: "#6C63FF",
    borderRadius: 1,
  },
  tabDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginBottom: 8,
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 14,
  },
  poster: {
    width: 52,
    height: 78,
    borderRadius: 8,
    backgroundColor: "#1A1A2E",
  },
  resultInfo: {
    flex: 1,
    gap: 4,
  },
  resultTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    color: "#6B7280",
    fontSize: 12,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#6B7280",
  },
  separator: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginHorizontal: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    paddingBottom: 80,
  },
  emptyIcon: {
    width: 60,
    height: 60,
  },
  emptyText: {
    color: "#6B7280",
    fontSize: 14,
    textAlign: "center",
  },
});
