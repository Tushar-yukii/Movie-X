import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Image } from "expo-image";

import { useLocalSearchParams, useRouter } from "expo-router";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { icons } from "@/constants/icons";
import { tmdbFetch } from "@/services/api";

/* 
   TYPES
 */

type SearchTab = "Movies" | "Series" | "Anime";

type SearchResult = {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  origin_country?: string[];
  genre_ids?: number[];
};

type SearchResponse = {
  results: SearchResult[];
};

/* 
   CONSTANTS
 */

const SEARCH_TABS: SearchTab[] = ["Movies", "Series", "Anime"];

const SEARCH_DELAY = 500;

/* 
   SEARCH PAGE
 */

export default function SearchPage() {
  const router = useRouter();

  /* 
     ROUTE PARAMS
   */

  const { defaultTab } = useLocalSearchParams<{
    defaultTab?: string;
  }>();

  /* 
     INITIAL TAB
   */

  const initialTab = useMemo<SearchTab>(() => {
    if (defaultTab && SEARCH_TABS.includes(defaultTab as SearchTab)) {
      return defaultTab as SearchTab;
    }

    return "Movies";
  }, [defaultTab]);

  /* 
     STATE
   */

  const [activeTab, setActiveTab] = useState<SearchTab>(initialTab);

  const [searchQuery, setSearchQuery] = useState("");

  const [results, setResults] = useState<SearchResult[]>([]);

  const [loading, setLoading] = useState(false);

  /*
   * Used to prevent an older API response from replacing
   * newer search results.
   */
  const searchRequestId = useRef(0);

  /* 
     KEEP TAB IN SYNC WITH ROUTE PARAM
     
     If another screen opens SearchPage with:
     
     ?defaultTab=Anime
     
     this updates the selected tab.
   */

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  /* 
     SEARCH FUNCTION
     
     useCallback is important here.
     
     It gives handleSearch a stable reference until
     activeTab changes.
   */

  const handleSearch = useCallback(
    async (query: string) => {
      const trimmedQuery = query.trim();

      /* 
         Don't search for less than 2 characters
       */
      if (trimmedQuery.length < 2) {
        setResults([]);
        setLoading(false);
        return;
      }

      /* 
         Create request ID
         
         This prevents old API responses from overwriting
         newer search results.
       */

      const requestId = ++searchRequestId.current;

      setLoading(true);

      try {
        let data: SearchResult[] = [];

        /* 
           MOVIES
         */

        if (activeTab === "Movies") {
          const response = await tmdbFetch<SearchResponse>(
            `/search/movie?query=${encodeURIComponent(trimmedQuery)}`,
          );

          data = response.results ?? [];
        } else if (activeTab === "Series") {
          /* 
           SERIES
           
           Exclude Japanese-origin TV shows so that
           anime stays in the Anime tab.
         */
          const response = await tmdbFetch<SearchResponse>(
            `/search/tv?query=${encodeURIComponent(trimmedQuery)}`,
          );

          data = (response.results ?? []).filter(
            (item) => !item.origin_country?.includes("JP"),
          );
        } else if (activeTab === "Anime") {
          /* 
           ANIME
           
           TMDB doesn't have a dedicated anime search
           endpoint, so we filter TV results.
         */
          const response = await tmdbFetch<SearchResponse>(
            `/search/tv?query=${encodeURIComponent(trimmedQuery)}`,
          );

          data = (response.results ?? []).filter(
            (item) =>
              item.origin_country?.includes("JP") ||
              item.genre_ids?.includes(16),
          );
        }

        /* 
           Only update state if this is the latest request.
        - */

        if (requestId === searchRequestId.current) {
          setResults(data);
        }
      } catch (error) {
        console.error("Search error:", error);

        /*
         * Don't show an old request's error after a
         * newer request has already started.
         */
        if (requestId === searchRequestId.current) {
          setResults([]);
        }
      } finally {
        if (requestId === searchRequestId.current) {
          setLoading(false);
        }
      }
    },
    [activeTab],
  );

  /* 
     DEBOUNCED SEARCH
     
     This replaces BOTH of your old useEffects.
     
     Old:
       useEffect(..., [activeTab])
       useEffect(..., [searchQuery])
     
     New:
       One effect handles both.
   */

  useEffect(() => {
    const trimmedQuery = searchQuery.trim();

    /* 
       Clear results immediately when query is empty
       or less than 2 characters.
    - */

    if (trimmedQuery.length < 2) {
      setResults([]);
      setLoading(false);

      return;
    }

    /* 
       Wait 500ms after typing stops.
    - */

    const timer = setTimeout(() => {
      handleSearch(trimmedQuery);
    }, SEARCH_DELAY);

    /* 
       Cancel previous timer.
    - */

    return () => {
      clearTimeout(timer);
    };
  }, [searchQuery, handleSearch]);

  /* 
     RESULT PRESS
 */

  const handleResultPress = useCallback(
    (item: SearchResult) => {
      router.push({
        pathname: "/movies/[id]",
        params: {
          id: item.id.toString(),
          type:
            activeTab === "Movies"
              ? "movie"
              : activeTab === "Series"
                ? "tv"
                : "anime",
        },
      });
    },
    [router, activeTab],
  );

  /* 
     GET TITLE
  */

  const getTitle = useCallback((item: SearchResult) => {
    return item.title || item.name || "Unknown";
  }, []);

  /*
     GET YEAR
   */

  const getYear = useCallback((item: SearchResult) => {
    return (item.release_date || item.first_air_date)?.split("-")[0] ?? "—";
  }, []);

  /* 
     CLEAR SEARCH
 */

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setResults([]);
    setLoading(false);
  }, []);

  /* 
     RENDER RESULT
   */

  const renderResult = useCallback(
    ({ item }: { item: SearchResult }) => {
      return (
        <TouchableOpacity
          style={styles.resultRow}
          activeOpacity={0.7}
          onPress={() => handleResultPress(item)}
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
            style={styles.poster}
            contentFit="cover"
          />

          {/* =
              INFORMATION
           */}

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
      );
    },
    [handleResultPress, getTitle, getYear, activeTab],
  );

  /* 
     KEY EXTRACTOR
   */

  const keyExtractor = useCallback(
    (item: SearchResult) => item.id.toString(),
    [],
  );

  /* 
     TAB BUTTON
   */

  const renderTab = useCallback(
    (tab: SearchTab) => {
      const isActive = activeTab === tab;

      return (
        <TouchableOpacity
          key={tab}
          onPress={() => setActiveTab(tab)}
          style={styles.tabBtn}
          activeOpacity={0.7}
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
              tintColor={isActive ? "#6C63FF" : "#6B7280"}
            />

            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
              {tab}
            </Text>
          </View>

          {/* Active underline */}

          {isActive && <View style={styles.tabUnderline} />}
        </TouchableOpacity>
      );
    },
    [activeTab],
  );

  /* 
     MAIN UI
   */

  return (
    <View style={styles.container}>
      {/* 
          HEADER
       */}

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search</Text>

        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.closeBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* 
          SEARCH INPUT
       */}

      <View style={styles.searchInputRow}>
        <Image
          source={icons.search}
          style={styles.searchIcon}
          contentFit="contain"
          tintColor="#6B7280"
        />

        <TextInput
          style={styles.searchInput}
          placeholder={`Search ${activeTab.toLowerCase()}...`}
          placeholderTextColor="#6B7280"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />

        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={clearSearch} activeOpacity={0.7}>
            <Text style={styles.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 
          FILTER TABS
       */}

      <View style={styles.tabsRow}>{SEARCH_TABS.map(renderTab)}</View>

      {/* 
          DIVIDER
       */}

      <View style={styles.tabDivider} />

      {/* 
          LOADING
       */}

      {loading && (
        <ActivityIndicator color="#6C63FF" size="large" style={styles.loader} />
      )}

      {/* 
          EMPTY STATE
          
          No search started yet.
       */}

      {!loading && results.length === 0 && searchQuery.trim().length < 2 && (
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

          <Text style={styles.emptyHint}>Enter at least 2 characters</Text>
        </View>
      )}

      {/* 
          NO RESULTS
       */}

      {!loading && results.length === 0 && searchQuery.trim().length >= 2 && (
        <View style={styles.emptyContainer}>
          <Image
            source={icons.search}
            style={styles.emptyIcon}
            contentFit="contain"
            tintColor="#3A3A5C"
          />

          <Text style={styles.emptyText}>
            No {activeTab.toLowerCase()} found
          </Text>

          <Text style={styles.emptyHint} numberOfLines={2}>
            Try a different search term
          </Text>
        </View>
      )}

      {!loading && results.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={keyExtractor}
          renderItem={renderResult}
          contentContainerStyle={styles.resultsContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={SearchSeparator}
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={5}
          removeClippedSubviews={Platform.OS === "android"}
        />
      )}
    </View>
  );
}

function SearchSeparator() {
  return <View style={styles.separator} />;
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

  loader: {
    marginTop: 40,
  },

  /* 
     RESULTS
   */

  resultsContent: {
    paddingBottom: 100,
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

  /* 
     EMPTY STATE
   */

  emptyContainer: {
    flex: 1,

    justifyContent: "center",
    alignItems: "center",

    gap: 12,

    paddingHorizontal: 30,
    paddingBottom: 100,
  },

  emptyIcon: {
    width: 60,
    height: 60,

    marginBottom: 4,
  },

  emptyText: {
    color: "#6B7280",

    fontSize: 15,

    fontWeight: "600",

    textAlign: "center",
  },

  emptyHint: {
    color: "#3A3A5C",

    fontSize: 12,

    textAlign: "center",
  },
});
