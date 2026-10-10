import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

type CategoryFilter = "All" | "Anime" | "Manga" | "Novel";

const CATEGORIES: { label: CategoryFilter; icon: string; type: "mci" | "ion" }[] = [
  { label: "All", icon: "view-grid", type: "mci" },
  { label: "Anime", icon: "movie-open-outline", type: "mci" },
  { label: "Manga", icon: "book-open-variant", type: "mci" },
  { label: "Novel", icon: "book-outline", type: "ion" },
];

const GENRES_DATA = [
  { name: "Action", count: 2, total: 2 },
  { name: "Drama", count: 2, total: 2 },
  { name: "Fantasy", count: 2, total: 2 },
  { name: "Adventure", count: 1, total: 2 },
  { name: "Comedy", count: 1, total: 2 },
];

const STUDIOS_DATA = [
  { name: "Toei Animation", count: 1 },
  { name: "Funimation", count: 1 },
  { name: "Fuji TV", count: 1 },
  { name: "4Kids Entertainment", count: 1 },
  { name: "TAP", count: 1 },
];

// 7 rows (days), 14 columns (weeks)
const HEATMAP_DAYS = ["T", "W", "T", "F", "S", "S", "M"];
const HEATMAP_MATRIX = [
  [0, 1, 2, 0, 3, 1, 0, 2, 0, 1, 3, 2, 0, 1],
  [1, 0, 3, 2, 1, 0, 2, 3, 1, 0, 1, 2, 3, 0],
  [0, 2, 1, 3, 0, 2, 1, 0, 3, 2, 0, 1, 2, 3],
  [2, 3, 0, 1, 2, 3, 0, 1, 2, 0, 3, 1, 0, 2],
  [1, 0, 2, 0, 3, 1, 2, 0, 1, 3, 2, 0, 1, 3],
  [3, 1, 0, 2, 1, 0, 3, 2, 0, 1, 2, 3, 0, 1],
  [0, 2, 3, 1, 0, 2, 1, 3, 0, 2, 1, 0, 2, 1],
];

export default function StatsScreen() {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("All");

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D1A" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* TOP PROFILE & STATS HEADER */}
        <View style={styles.headerRow}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarBox}>
              <Ionicons name="person" size={24} color="#C4C4CB" />
            </View>
            <View style={styles.badgeCount}>
              <Text style={styles.badgeText}>4</Text>
            </View>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Stats</Text>
            <Text style={styles.headerSubtitle}>Your watch & read statistics</Text>
          </View>
        </View>

        {/* CATEGORY FILTER PILLS */}
        <View style={styles.categoriesRow}>
          {CATEGORIES.map((cat) => {
            const isSelected = activeCategory === cat.label;
            return (
              <TouchableOpacity
                key={cat.label}
                activeOpacity={0.8}
                onPress={() => setActiveCategory(cat.label)}
                style={[
                  styles.categoryPill,
                  isSelected && styles.categoryPillActive,
                ]}
              >
                {cat.type === "mci" ? (
                  <MaterialCommunityIcons
                    name={cat.icon as any}
                    size={16}
                    color={isSelected ? "#FFFFFF" : "#8A8A9E"}
                    style={styles.categoryIcon}
                  />
                ) : (
                  <Ionicons
                    name={cat.icon as any}
                    size={16}
                    color={isSelected ? "#FFFFFF" : "#8A8A9E"}
                    style={styles.categoryIcon}
                  />
                )}
                <Text
                  style={[
                    styles.categoryText,
                    isSelected && styles.categoryTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* RANK LEVEL CARD */}
        <View style={styles.card}>
          <View style={styles.rankHeader}>
            <View style={styles.rankIconBox}>
              <Text style={styles.backpackEmoji}>🎒</Text>
            </View>
            <View style={styles.rankTextContainer}>
              <Text style={styles.rankTitle}>ACADEMY STUDENT</Text>
              <Text style={styles.rankSubtitle}>Otaku Rank Level</Text>
            </View>
            <View style={styles.xpPill}>
              <Text style={styles.xpText}>90 XP</Text>
            </View>
          </View>

          <View style={styles.progressLabelsRow}>
            <Text style={styles.progressLabel}>Level Progress</Text>
            <Text style={styles.progressValue}>9.1h / 10h</Text>
          </View>

          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: "91%" }]} />
          </View>
        </View>

        {/* STATS 2x3 GRID */}
        <View style={styles.statsGrid}>
          {/* Box 1 */}
          <View style={styles.statBox}>
            <View style={styles.statHeader}>
              <Feather name="clock" size={13} color="#8A8A9E" />
              <Text style={styles.statLabel} numberOfLines={1}>
                TIME SPENT
              </Text>
            </View>
            <Text style={styles.statValue}>9h 4m</Text>
          </View>

          {/* Box 2 */}
          <View style={styles.statBox}>
            <View style={styles.statHeader}>
              <Ionicons
                name="document-text-outline"
                size={13}
                color="#8A8A9E"
              />
              <Text style={styles.statLabel} numberOfLines={1}>
                Items Consu...
              </Text>
            </View>
            <Text style={styles.statValue}>53</Text>
          </View>

          {/* Box 3 */}
          <View style={styles.statBox}>
            <View style={styles.statHeader}>
              <Ionicons name="calendar-outline" size={13} color="#8A8A9E" />
              <Text style={styles.statLabel} numberOfLines={1}>
                DAYS ACTIVE
              </Text>
            </View>
            <Text style={styles.statValue}>12</Text>
          </View>

          {/* Box 4 */}
          <View style={styles.statBox}>
            <View style={styles.statHeader}>
              <Ionicons name="play-circle-outline" size={13} color="#8A8A9E" />
              <Text style={styles.statLabel} numberOfLines={1}>
                Avg Episodes
              </Text>
            </View>
            <Text style={styles.statValue}>0.3/day</Text>
          </View>

          {/* Box 5 */}
          <View style={styles.statBox}>
            <View style={styles.statHeader}>
              <MaterialCommunityIcons
                name="book-open-outline"
                size={13}
                color="#8A8A9E"
              />
              <Text style={styles.statLabel} numberOfLines={1}>
                Avg Chapters
              </Text>
            </View>
            <Text style={styles.statValue}>4.2/day</Text>
          </View>

          {/* Box 6 */}
          <View style={styles.statBox}>
            <View style={styles.statHeader}>
              <Ionicons name="flame-outline" size={13} color="#8A8A9E" />
              <Text style={styles.statLabel} numberOfLines={1}>
                Streak (Cur/L...
              </Text>
            </View>
            <Text style={styles.statValue}>12d / 12d</Text>
          </View>
        </View>

        {/* FAVORITE TITLE SECTION */}
        <Text style={styles.sectionHeading}>Favorite Title</Text>
        <TouchableOpacity style={styles.favoriteCard} activeOpacity={0.85}>
          <View style={styles.favoriteContent}>
            <View style={styles.favoriteTagRow}>
              <Ionicons name="bookmark" size={13} color="#AB8BFF" />
              <Text style={styles.favoriteTagText}>
                FAVORITE • 8h 10m spent ›
              </Text>
            </View>
            <Text style={styles.favoriteTitle}>Lookism</Text>
          </View>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1618336753974-aae8e04506aa?q=80&w=300&auto=format&fit=crop",
            }}
            style={styles.favoriteImage}
            resizeMode="cover"
          />
        </TouchableOpacity>

        {/* ACTIVITY HEATMAP SECTION */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Activity Heatmap</Text>
          <View style={styles.heatmapWrapper}>
            <View style={styles.heatmapDaysColumn}>
              {HEATMAP_DAYS.map((day, idx) => (
                <Text key={`day-${idx}`} style={styles.heatmapDayText}>
                  {day}
                </Text>
              ))}
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.heatmapGrid}>
                {HEATMAP_MATRIX.map((row, rowIdx) => (
                  <View key={`row-${rowIdx}`} style={styles.heatmapRow}>
                    {row.map((val, colIdx) => {
                      let cellColor = "#1D1C2A";
                      if (val === 1) cellColor = "#39355B";
                      if (val === 2) cellColor = "#665C9E";
                      if (val === 3) cellColor = "#A499DF";
                      return (
                        <View
                          key={`cell-${rowIdx}-${colIdx}`}
                          style={[
                            styles.heatmapCell,
                            { backgroundColor: cellColor },
                          ]}
                        />
                      );
                    })}
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>

        {/* DETAILED INSIGHTS SECTION */}
        <Text style={styles.sectionHeading}>Detailed Insights</Text>

        {/* TOP GENRES CARD */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <MaterialCommunityIcons
              name="shape-outline"
              size={18}
              color="#A8B5DB"
            />
            <Text style={styles.cardHeaderTitle}>Top Genres</Text>
          </View>

          <View style={styles.insightsList}>
            {GENRES_DATA.map((genre) => (
              <View key={genre.name} style={styles.insightItem}>
                <View style={styles.insightLabelRow}>
                  <Text style={styles.insightName}>{genre.name}</Text>
                  <Text style={styles.insightCount}>
                    {genre.count} {genre.count === 1 ? "title" : "titles"}
                  </Text>
                </View>
                <View style={styles.insightTrack}>
                  <View
                    style={[
                      styles.insightFill,
                      {
                        width: `${(genre.count / genre.total) * 100}%`,
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* TOP STUDIOS CARD */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <MaterialCommunityIcons
              name="movie-roll"
              size={18}
              color="#A8B5DB"
            />
            <Text style={styles.cardHeaderTitle}>Top Studios</Text>
          </View>

          <View style={styles.insightsList}>
            {STUDIOS_DATA.map((studio) => (
              <View key={studio.name} style={styles.insightItem}>
                <View style={styles.insightLabelRow}>
                  <Text style={styles.insightName}>{studio.name}</Text>
                  <Text style={styles.insightCount}>{studio.count} title</Text>
                </View>
                <View style={styles.insightTrack}>
                  <View
                    style={[
                      styles.insightFill,
                      {
                        width: "100%",
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0D1A",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? 44 : 54,
    paddingBottom: 110,
  },

  /* HEADER */
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  avatarWrapper: {
    position: "relative",
    marginRight: 14,
  },
  avatarBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#1D1C2B",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#2B2A3D",
  },
  badgeCount: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#7B6FCD",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#0D0D1A",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    color: "#8A8A9E",
    fontSize: 13,
    marginTop: 2,
  },

  /* CATEGORY PILLS */
  categoriesRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  categoryPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: "#161524",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  categoryPillActive: {
    backgroundColor: "#2B2844",
    borderColor: "#6C63FF",
  },
  categoryIcon: {
    marginRight: 5,
  },
  categoryText: {
    color: "#8A8A9E",
    fontSize: 12,
    fontWeight: "600",
  },
  categoryTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  /* COMMON CARD */
  card: {
    backgroundColor: "#161524",
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  sectionHeading: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 12,
    marginTop: 4,
  },

  /* RANK CARD */
  rankHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  rankIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#2B1A24",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  backpackEmoji: {
    fontSize: 20,
  },
  rankTextContainer: {
    flex: 1,
  },
  rankTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  rankSubtitle: {
    color: "#8A8A9E",
    fontSize: 12,
    marginTop: 2,
  },
  xpPill: {
    backgroundColor: "#232138",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(171,139,255,0.25)",
  },
  xpText: {
    color: "#AB8BFF",
    fontSize: 12,
    fontWeight: "700",
  },
  progressLabelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressLabel: {
    color: "#8A8A9E",
    fontSize: 12,
    fontWeight: "600",
  },
  progressValue: {
    color: "#C4C4CB",
    fontSize: 12,
    fontWeight: "600",
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#262438",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: "#A8B5DB",
  },

  /* STATS 2x3 GRID */
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  statBox: {
    width: (width - 32 - 20) / 3,
    backgroundColor: "#161524",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  statHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  statLabel: {
    color: "#8A8A9E",
    fontSize: 10,
    fontWeight: "600",
    flex: 1,
  },
  statValue: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  /* FAVORITE TITLE */
  favoriteCard: {
    backgroundColor: "#161524",
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  favoriteContent: {
    flex: 1,
    paddingRight: 16,
  },
  favoriteTagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  favoriteTagText: {
    color: "#AB8BFF",
    fontSize: 11,
    fontWeight: "700",
  },
  favoriteTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  favoriteImage: {
    width: 90,
    height: 70,
    borderRadius: 12,
    backgroundColor: "#242338",
  },

  /* ACTIVITY HEATMAP */
  cardSectionTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 14,
  },
  heatmapWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  heatmapDaysColumn: {
    marginRight: 8,
    justifyContent: "space-between",
    height: 7 * 16,
  },
  heatmapDayText: {
    color: "#8A8A9E",
    fontSize: 9,
    fontWeight: "700",
    height: 16,
    lineHeight: 16,
  },
  heatmapGrid: {
    flexDirection: "column",
    gap: 4,
  },
  heatmapRow: {
    flexDirection: "row",
    gap: 4,
  },
  heatmapCell: {
    width: 14,
    height: 14,
    borderRadius: 3,
  },

  /* DETAILED INSIGHTS */
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  cardHeaderTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  insightsList: {
    gap: 14,
  },
  insightItem: {
    gap: 6,
  },
  insightLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  insightName: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  insightCount: {
    color: "#8A8A9E",
    fontSize: 12,
    fontWeight: "600",
  },
  insightTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#222035",
    overflow: "hidden",
  },
  insightFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: "#A8B5DB",
  },
});
