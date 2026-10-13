import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { memo, useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  clearUserActivity,
  FilterCategory,
  formatDuration,
  HeatmapCell,
  logUserActivity,
  parseLocalDate,
  useActivityStats,
} from "@/services/activityTracker";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 32 - 12) / 2;

const CATEGORIES: { label: FilterCategory; icon: string; type: "mci" | "ion" }[] = [
  { label: "All", icon: "view-grid", type: "mci" },
  { label: "Anime", icon: "movie-open-outline", type: "mci" },
  { label: "Manga", icon: "book-open-variant", type: "mci" },
  { label: "Novel", icon: "book-outline", type: "ion" },
];

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

// Memoized Stat Card Component
interface StatCardProps {
  iconType: "feather" | "ion" | "mci";
  iconName: string;
  iconColor: string;
  iconBg: string;
  label: string;
  value: string | number;
  subtext: string;
}

const StatCard = memo(function StatCard({
  iconType,
  iconName,
  iconColor,
  iconBg,
  label,
  value,
  subtext,
}: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statCardHeader}>
        <View style={[styles.statIconBox, { backgroundColor: iconBg }]}>
          {iconType === "feather" && (
            <Feather name={iconName as any} size={15} color={iconColor} />
          )}
          {iconType === "ion" && (
            <Ionicons name={iconName as any} size={15} color={iconColor} />
          )}
          {iconType === "mci" && (
            <MaterialCommunityIcons
              name={iconName as any}
              size={15}
              color={iconColor}
            />
          )}
        </View>
        <Text style={styles.statLabel} numberOfLines={1}>
          {label}
        </Text>
      </View>
      <Text style={styles.statValue} numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.statSubtext} numberOfLines={1}>
        {subtext}
      </Text>
    </View>
  );
});
StatCard.displayName = "StatCard";

// Memoized Heatmap Cell Component
interface HeatmapCellItemProps {
  cell: HeatmapCell;
  isSelected: boolean;
  onPress: (cell: HeatmapCell) => void;
}

const HeatmapCellItem = memo(function HeatmapCellItem({
  cell,
  isSelected,
  onPress,
}: HeatmapCellItemProps) {
  let cellBg = "#1C1B2A";
  if (cell.level === 1) cellBg = "#3E3668";
  if (cell.level === 2) cellBg = "#6C63FF";
  if (cell.level === 3) cellBg = "#AB8BFF";

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onPress(cell)}
      hitSlop={{ top: 4, bottom: 4, left: 2, right: 2 }}
      style={[
        styles.heatmapCell,
        { backgroundColor: cellBg },
        isSelected && styles.heatmapCellSelected,
      ]}
    />
  );
});
HeatmapCellItem.displayName = "HeatmapCellItem";

export default function StatsScreen() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<FilterCategory>("All");
  const { stats, loading } = useActivityStats(activeCategory);

  // Selected Heatmap Cell Tooltip Modal
  const [selectedCell, setSelectedCell] = useState<HeatmapCell | null>(null);

  // Quick Activity Logger Modal (for testing & manual tracking)
  const [logModalVisible, setLogModalVisible] = useState(false);

  // Heatmap rows (7 days x 14 weeks)
  const heatmapRows = useMemo(() => {
    const rows: HeatmapCell[][] = [[], [], [], [], [], [], []];
    stats.heatmap.forEach((cell, idx) => {
      const rowIndex = idx % 7;
      rows[rowIndex].push(cell);
    });
    return rows;
  }, [stats.heatmap]);

  const handleSelectCell = useCallback((cell: HeatmapCell) => {
    setSelectedCell((prev) => (prev?.date === cell.date ? null : cell));
  }, []);

  const tooltipDateFormatted = useMemo(() => {
    if (!selectedCell) return "";
    try {
      const d = parseLocalDate(selectedCell.date);
      return d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return selectedCell.date;
    }
  }, [selectedCell]);

  const handleQuickLog = useCallback(
    async (category: "anime" | "manga" | "novel") => {
      let title = "Solo Leveling";
      let genres = ["Action", "Fantasy"];
      let studio = "A-1 Pictures";
      let eps = 1;
      let chs = 0;
      let minutes = 24;

      if (category === "manga") {
        title = "Lookism";
        genres = ["Action", "Drama"];
        studio = "PTJ Comics";
        eps = 0;
        chs = 1;
        minutes = 15;
      } else if (category === "novel") {
        title = "Omniscient Reader";
        genres = ["Fantasy", "Adventure"];
        studio = "Sing Shong";
        eps = 0;
        chs = 1;
        minutes = 20;
      }

      await logUserActivity({
        contentId: title.toLowerCase().replace(/\s+/g, "_"),
        title,
        category,
        specificType: category === "manga" ? "manhwa" : category,
        posterUrl:
          category === "manga"
            ? "https://images.unsplash.com/photo-1618336753974-aae8e04506aa?q=80&w=300&auto=format&fit=crop"
            : "https://image.tmdb.org/t/p/w500/geCRueV3ElhRTr0xtJuPxJ8BGdM.jpg",
        durationMinutes: minutes,
        episodesWatched: eps,
        chaptersRead: chs,
        completed: false,
        genres,
        studio,
      });
      setLogModalVisible(false);
    },
    []
  );

  const handleResetUser = useCallback(async () => {
    await clearUserActivity();
    setSelectedCell(null);
    setLogModalVisible(false);
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#0D0D1A" />
        <ActivityIndicator size="large" color="#AB8BFF" />
        <Text style={styles.loadingText}>Loading your statistics...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D1A" />

      {/* AMBIENT BACKGROUND GLOW */}
      <LinearGradient
        colors={["rgba(108, 99, 255, 0.12)", "rgba(13, 13, 26, 0.0)"]}
        style={styles.ambientGlow}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.5 }}
        pointerEvents="none"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* TOP PROFILE & HEADER SECTION */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.avatarWrapper}
            activeOpacity={0.8}
            onPress={() => router.push("/profile")}
          >
            <View style={styles.avatarBox}>
              <Ionicons name="person" size={26} color="#C4C4CB" />
            </View>
            <View style={styles.badgeCount}>
              <Text style={styles.badgeText}>{stats.itemsConsumed}</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <View style={styles.brandRow}>
              <Text style={styles.brandTag}>ANIMEX STATS</Text>
              <TouchableOpacity
                onPress={() => setLogModalVisible(true)}
                style={styles.manageButton}
                activeOpacity={0.7}
              >
                <Ionicons name="flash-outline" size={13} color="#AB8BFF" />
                <Text style={styles.manageButtonText}>Track</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.headerTitle}>Overview</Text>
            <Text style={styles.headerSubtitle}>
              {stats.hasActivity
                ? `${stats.itemsConsumed} ${
                    stats.itemsConsumed === 1 ? "title" : "titles"
                  } tracked across ${stats.activeDays} ${
                    stats.activeDays === 1 ? "day" : "days"
                  }`
                : "No watch or reading activity yet"}
            </Text>
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
          <LinearGradient
            colors={["rgba(171, 139, 255, 0.08)", "rgba(22, 21, 36, 0.95)"]}
            style={styles.cardGradient}
          >
            <View style={styles.rankHeader}>
              <View style={styles.rankIconBox}>
                <Text style={styles.rankEmoji}>{stats.rankIcon}</Text>
              </View>
              <View style={styles.rankTextContainer}>
                <Text style={styles.rankTitle}>{stats.rankTitle}</Text>
                <Text style={styles.rankSubtitle}>
                  Otaku Rank • Level {stats.level}
                </Text>
              </View>
              <View style={styles.xpPill}>
                <Text style={styles.xpText}>{stats.xp} XP</Text>
              </View>
            </View>

            <View style={styles.progressLabelsRow}>
              <Text style={styles.progressLabel}>Level Progress</Text>
              <Text style={styles.progressValue}>
                {stats.xp} / {stats.xpNextLevel} XP ({stats.levelProgressPercent}%)
              </Text>
            </View>

            <View style={styles.progressBarTrack}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width:
                      stats.levelProgressPercent > 0
                        ? `${stats.levelProgressPercent}%`
                        : "0%",
                  },
                ]}
              />
            </View>
          </LinearGradient>
        </View>

        {/* OVERVIEW STATS (RESPONSIVE 2-COLUMN GRID) */}
        <Text style={styles.sectionHeading}>Activity Breakdown</Text>
        <View style={styles.statsGrid}>
          <StatCard
            iconType="feather"
            iconName="clock"
            iconColor="#AB8BFF"
            iconBg="#2A2346"
            label="Time Spent"
            value={stats.formattedDuration}
            subtext={stats.hasActivity ? "Recorded time" : "0m recorded"}
          />

          <StatCard
            iconType="ion"
            iconName="albums-outline"
            iconColor="#A8B5DB"
            iconBg="#202A44"
            label="Items Consumed"
            value={stats.itemsConsumed}
            subtext={
              stats.itemsConsumed === 1
                ? "1 unique title"
                : `${stats.itemsConsumed} unique titles`
            }
          />

          <StatCard
            iconType="ion"
            iconName="calendar-outline"
            iconColor="#C4C4CB"
            iconBg="#282938"
            label="Days Active"
            value={`${stats.activeDays} ${
              stats.activeDays === 1 ? "day" : "days"
            }`}
            subtext={stats.activeDays > 0 ? "Active days" : "0 days logged"}
          />

          <StatCard
            iconType="ion"
            iconName="play-circle-outline"
            iconColor="#E8A9D1"
            iconBg="#35223A"
            label="Episodes Watched"
            value={stats.episodesWatched}
            subtext={
              stats.avgEpisodesPerDay > 0
                ? `Avg ${stats.avgEpisodesPerDay}/day`
                : "0 avg episodes"
            }
          />

          <StatCard
            iconType="mci"
            iconName="book-open-page-variant-outline"
            iconColor="#7FE0D4"
            iconBg="#1E3036"
            label="Chapters Read"
            value={stats.chaptersRead}
            subtext={
              stats.avgChaptersPerDay > 0
                ? `Avg ${stats.avgChaptersPerDay}/day`
                : "0 avg chapters"
            }
          />

          <StatCard
            iconType="ion"
            iconName="flame-outline"
            iconColor="#FFA26B"
            iconBg="#3B261D"
            label="Current Streak"
            value={`${stats.currentStreak} ${
              stats.currentStreak === 1 ? "day" : "days"
            }`}
            subtext={`Best: ${stats.longestStreak} ${
              stats.longestStreak === 1 ? "day" : "days"
            }`}
          />
        </View>

        {/* FAVORITE TITLE SECTION */}
        <Text style={styles.sectionHeading}>Favorite Title</Text>
        {stats.favoriteTitle ? (
          <TouchableOpacity
            style={styles.favoriteCard}
            activeOpacity={0.85}
            onPress={() => {
              if (stats.favoriteTitle?.contentId) {
                router.push({
                  pathname: "/movies/[id]",
                  params: {
                    id: stats.favoriteTitle.contentId,
                    type:
                      activeCategory === "Anime"
                        ? "anime"
                        : activeCategory === "All"
                        ? "movie"
                        : "anime",
                  },
                });
              }
            }}
          >
            <View style={styles.favoriteContent}>
              <View style={styles.favoriteTagRow}>
                <Ionicons name="bookmark" size={13} color="#AB8BFF" />
                <Text style={styles.favoriteTagText}>
                  FAVORITE • {formatDuration(stats.favoriteTitle.durationMinutes)} spent ›
                </Text>
              </View>
              <Text style={styles.favoriteTitle} numberOfLines={2}>
                {stats.favoriteTitle.title}
              </Text>
              <View style={styles.favoriteMetaRow}>
                <View style={styles.categoryBadgePill}>
                  <Text style={styles.categoryBadgeText}>
                    {stats.favoriteTitle.category}
                  </Text>
                </View>
                {stats.favoriteTitle.episodesOrChapters ? (
                  <Text style={styles.favoriteMetaText}>
                    {stats.favoriteTitle.episodesOrChapters}
                  </Text>
                ) : null}
              </View>
            </View>

            {stats.favoriteTitle.posterUrl ? (
              <Image
                source={{ uri: stats.favoriteTitle.posterUrl }}
                style={styles.favoriteImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.favoriteImagePlaceholder}>
                <Ionicons name="film-outline" size={28} color="#6C63FF" />
              </View>
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="heart-outline" size={24} color="#AB8BFF" />
            </View>
            <Text style={styles.emptyTitle}>No favorite title yet</Text>
            <Text style={styles.emptyDescription}>
              Start watching anime or reading manga to discover your top favorite titles.
            </Text>
          </View>
        )}

        {/* ACTIVITY HEATMAP SECTION */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardSectionTitle}>Activity Heatmap</Text>
            <View style={styles.heatmapLegend}>
              <Text style={styles.legendText}>Less</Text>
              <View style={[styles.legendBox, { backgroundColor: "#1C1B2A" }]} />
              <View style={[styles.legendBox, { backgroundColor: "#3E3668" }]} />
              <View style={[styles.legendBox, { backgroundColor: "#6C63FF" }]} />
              <View style={[styles.legendBox, { backgroundColor: "#AB8BFF" }]} />
              <Text style={styles.legendText}>More</Text>
            </View>
          </View>

          <View style={styles.heatmapWrapper}>
            <View style={styles.heatmapDaysColumn}>
              {DAY_LABELS.map((day, idx) => (
                <Text key={`day-label-${idx}`} style={styles.heatmapDayText}>
                  {day}
                </Text>
              ))}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.heatmapGrid}>
                {heatmapRows.map((row, rowIdx) => (
                  <View key={`heatmap-row-${rowIdx}`} style={styles.heatmapRow}>
                    {row.map((cell) => (
                      <HeatmapCellItem
                        key={cell.date}
                        cell={cell}
                        isSelected={selectedCell?.date === cell.date}
                        onPress={handleSelectCell}
                      />
                    ))}
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>

          {selectedCell ? (
            <View style={styles.heatmapTooltipBox}>
              <Text style={styles.tooltipDateText}>
                {tooltipDateFormatted}
              </Text>
              <Text style={styles.tooltipDetailsText}>
                {selectedCell.count > 0
                  ? `${selectedCell.count} ${
                      selectedCell.count === 1
                        ? "activity session"
                        : "activity sessions"
                    } • ${formatDuration(selectedCell.minutes)} spent`
                  : "No activity recorded on this day"}
              </Text>
            </View>
          ) : (
            <Text style={styles.heatmapHint}>
              Tap any date cell to view activity summary
            </Text>
          )}
        </View>

        {/* DETAILED INSIGHTS SECTION */}
        <Text style={styles.sectionHeading}>Detailed Insights</Text>

        {/* TOP GENRES CARD */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.insightHeaderLeft}>
              <MaterialCommunityIcons
                name="shape-outline"
                size={18}
                color="#A8B5DB"
              />
              <Text style={styles.cardHeaderTitle}>Top Genres</Text>
            </View>
            {stats.topGenres.length > 0 && (
              <Text style={styles.insightHeaderCount}>
                {stats.topGenres.length}{" "}
                {stats.topGenres.length === 1 ? "genre" : "genres"}
              </Text>
            )}
          </View>

          {stats.topGenres.length > 0 ? (
            <View style={styles.insightsList}>
              {stats.topGenres.map((genre) => (
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
                        { width: `${Math.max(8, genre.percent)}%` },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyInsightBox}>
              <Text style={styles.emptyInsightTitle}>No genre data recorded</Text>
              <Text style={styles.emptyInsightSub}>
                Genre preferences will appear as you explore and complete titles.
              </Text>
            </View>
          )}
        </View>

        {/* TOP STUDIOS CARD */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.insightHeaderLeft}>
              <MaterialCommunityIcons
                name="movie-roll"
                size={18}
                color="#A8B5DB"
              />
              <Text style={styles.cardHeaderTitle}>Top Studios</Text>
            </View>
            {stats.topStudios.length > 0 && (
              <Text style={styles.insightHeaderCount}>
                {stats.topStudios.length}{" "}
                {stats.topStudios.length === 1 ? "studio" : "studios"}
              </Text>
            )}
          </View>

          {stats.topStudios.length > 0 ? (
            <View style={styles.insightsList}>
              {stats.topStudios.map((studio) => (
                <View key={studio.name} style={styles.insightItem}>
                  <View style={styles.insightLabelRow}>
                    <Text style={styles.insightName}>{studio.name}</Text>
                    <Text style={styles.insightCount}>
                      {studio.count} {studio.count === 1 ? "title" : "titles"}
                    </Text>
                  </View>
                  <View style={styles.insightTrack}>
                    <View
                      style={[
                        styles.insightFill,
                        {
                          width: `${Math.max(8, studio.percent)}%`,
                          backgroundColor: "#AB8BFF",
                        },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyInsightBox}>
              <Text style={styles.emptyInsightTitle}>
                No animation studios logged
              </Text>
              <Text style={styles.emptyInsightSub}>
                Track anime episodes to discover your most-watched production studios.
              </Text>
            </View>
          )}
        </View>

        {/* ADDITIONAL INSIGHTS CARD */}
        {stats.hasActivity && (
          <View style={styles.card}>
            <Text style={styles.cardSectionTitle}>Viewing Habits</Text>
            <View style={styles.summaryStatsRow}>
              <View style={styles.summaryStatItem}>
                <Text style={styles.summaryStatNumber}>
                  {stats.completedCount}
                </Text>
                <Text style={styles.summaryStatLabel}>Completed</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryStatItem}>
                <Text style={styles.summaryStatNumber}>
                  {stats.inProgressCount}
                </Text>
                <Text style={styles.summaryStatLabel}>In Progress</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryStatItem}>
                <Text style={styles.summaryStatNumber}>
                  {stats.mostActiveDay || "—"}
                </Text>
                <Text style={styles.summaryStatLabel}>Peak Day</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* QUICK TRACKING & TESTING MODAL */}
      <Modal
        visible={logModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setLogModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setLogModalVisible(false)}
          />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalHeading}>Track Activity</Text>
            <Text style={styles.modalSubheading}>
              Simulate or record your entertainment sessions to update your real-time stats.
            </Text>

            <View style={styles.modalActionsList}>
              <TouchableOpacity
                style={styles.modalActionButton}
                onPress={() => handleQuickLog("anime")}
                activeOpacity={0.8}
              >
                <View style={[styles.modalActionIcon, { backgroundColor: "#2A2346" }]}>
                  <Ionicons name="play" size={18} color="#AB8BFF" />
                </View>
                <View style={styles.modalActionTextCol}>
                  <Text style={styles.modalActionTitle}>Watched Anime Episode</Text>
                  <Text style={styles.modalActionDesc}>
                    +20 XP • Solo Leveling Ep. 1 (24m)
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#8A8A9E" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalActionButton}
                onPress={() => handleQuickLog("manga")}
                activeOpacity={0.8}
              >
                <View style={[styles.modalActionIcon, { backgroundColor: "#1E3036" }]}>
                  <MaterialCommunityIcons
                    name="book-open-variant"
                    size={18}
                    color="#7FE0D4"
                  />
                </View>
                <View style={styles.modalActionTextCol}>
                  <Text style={styles.modalActionTitle}>Read Manga / Manhwa Chapter</Text>
                  <Text style={styles.modalActionDesc}>
                    +10 XP • Lookism Ch. 1 (15m)
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#8A8A9E" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalActionButton}
                onPress={() => handleQuickLog("novel")}
                activeOpacity={0.8}
              >
                <View style={[styles.modalActionIcon, { backgroundColor: "#35223A" }]}>
                  <Ionicons name="book-outline" size={18} color="#E8A9D1" />
                </View>
                <View style={styles.modalActionTextCol}>
                  <Text style={styles.modalActionTitle}>Read Light Novel Session</Text>
                  <Text style={styles.modalActionDesc}>
                    +10 XP • Omniscient Reader Ch. 1 (20m)
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#8A8A9E" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleResetUser}
              activeOpacity={0.8}
            >
              <Ionicons name="refresh-outline" size={16} color="#EF4444" />
              <Text style={styles.resetButtonText}>Reset All Stats (Test Zero State)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  loadingText: {
    color: "#8A8A9E",
    fontSize: 14,
    marginTop: 12,
  },
  ambientGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 280,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? 44 : 54,
    paddingBottom: 120, // Prevents bottom navigation overlap
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
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#1B192A",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(171, 139, 255, 0.35)",
  },
  badgeCount: {
    position: "absolute",
    top: -3,
    right: -3,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
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
    fontWeight: "800",
  },
  headerInfo: {
    flex: 1,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  brandTag: {
    color: "#AB8BFF",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  manageButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(171, 139, 255, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  manageButtonText: {
    color: "#AB8BFF",
    fontSize: 11,
    fontWeight: "700",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.5,
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
    paddingHorizontal: 6,
    borderRadius: 14,
    backgroundColor: "#161524",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  categoryPillActive: {
    backgroundColor: "#2B2844",
    borderColor: "#AB8BFF",
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

  /* CARD STYLES */
  card: {
    backgroundColor: "#161524",
    borderRadius: 22,
    overflow: "hidden",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
  },
  cardGradient: {
    padding: 18,
  },
  sectionHeading: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "800",
    marginBottom: 12,
    marginTop: 6,
  },

  /* RANK CARD */
  rankHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  rankIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#2B1A24",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  rankEmoji: {
    fontSize: 22,
  },
  rankTextContainer: {
    flex: 1,
  },
  rankTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  rankSubtitle: {
    color: "#8A8A9E",
    fontSize: 12,
    marginTop: 2,
  },
  xpPill: {
    backgroundColor: "rgba(171, 139, 255, 0.16)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(171,139,255,0.35)",
  },
  xpText: {
    color: "#AB8BFF",
    fontSize: 12,
    fontWeight: "800",
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
    height: 7,
    borderRadius: 4,
    backgroundColor: "#222035",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: "#AB8BFF",
  },

  /* OVERVIEW 2-COLUMN GRID */
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    width: CARD_WIDTH,
    backgroundColor: "#161524",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  statCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  statIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  statLabel: {
    color: "#8A8A9E",
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  statValue: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 4,
  },
  statSubtext: {
    color: "#6B6A7E",
    fontSize: 11,
    fontWeight: "500",
  },

  /* FAVORITE TITLE */
  favoriteCard: {
    backgroundColor: "#161524",
    borderRadius: 22,
    padding: 16,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
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
    marginBottom: 8,
  },
  favoriteMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  categoryBadgePill: {
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryBadgeText: {
    color: "#C4C4CB",
    fontSize: 10,
    fontWeight: "700",
  },
  favoriteMetaText: {
    color: "#8A8A9E",
    fontSize: 12,
  },
  favoriteImage: {
    width: 78,
    height: 88,
    borderRadius: 14,
    backgroundColor: "#242338",
  },
  favoriteImagePlaceholder: {
    width: 78,
    height: 88,
    borderRadius: 14,
    backgroundColor: "#201F33",
    justifyContent: "center",
    alignItems: "center",
  },

  /* EMPTY STATES */
  emptyCard: {
    backgroundColor: "#161524",
    borderRadius: 22,
    padding: 24,
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  emptyIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(171, 139, 255, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
    textAlign: "center",
  },
  emptyDescription: {
    color: "#8A8A9E",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
    paddingHorizontal: 16,
  },

  /* HEATMAP */
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.04)",
  },
  cardSectionTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  heatmapLegend: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendText: {
    color: "#6B6A7E",
    fontSize: 10,
    fontWeight: "600",
    marginHorizontal: 2,
  },
  legendBox: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  heatmapWrapper: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  heatmapDaysColumn: {
    marginRight: 8,
    gap: 4,
    justifyContent: "flex-start",
  },
  heatmapDayText: {
    color: "#6B6A7E",
    fontSize: 9,
    fontWeight: "700",
    height: 14,
    lineHeight: 14,
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
  heatmapCellSelected: {
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  heatmapTooltipBox: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#1F1D32",
    borderWidth: 1,
    borderColor: "rgba(171, 139, 255, 0.3)",
  },
  tooltipDateText: {
    color: "#AB8BFF",
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 2,
  },
  tooltipDetailsText: {
    color: "#FFFFFF",
    fontSize: 13,
  },
  heatmapHint: {
    color: "#6B6A7E",
    fontSize: 11,
    textAlign: "center",
    marginBottom: 14,
  },

  /* INSIGHTS */
  insightHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardHeaderTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  insightHeaderCount: {
    color: "#8A8A9E",
    fontSize: 12,
    fontWeight: "600",
  },
  insightsList: {
    padding: 16,
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
  emptyInsightBox: {
    padding: 20,
    alignItems: "center",
  },
  emptyInsightTitle: {
    color: "#C4C4CB",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
  },
  emptyInsightSub: {
    color: "#6B6A7E",
    fontSize: 11,
    textAlign: "center",
  },

  /* VIEWING HABITS SUMMARY */
  summaryStatsRow: {
    flexDirection: "row",
    paddingVertical: 18,
    paddingHorizontal: 12,
    justifyContent: "space-around",
    alignItems: "center",
  },
  summaryStatItem: {
    alignItems: "center",
    flex: 1,
  },
  summaryStatNumber: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 4,
  },
  summaryStatLabel: {
    color: "#8A8A9E",
    fontSize: 11,
    fontWeight: "600",
  },
  summaryDivider: {
    width: 1,
    height: 28,
    backgroundColor: "rgba(255,255,255,0.06)",
  },

  /* MODAL */
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.65)",
  },
  modalBackdrop: {
    flex: 1,
  },
  modalSheet: {
    backgroundColor: "#161524",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === "android" ? 24 : 38,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  modalHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#403E58",
    alignSelf: "center",
    marginBottom: 16,
  },
  modalHeading: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 6,
  },
  modalSubheading: {
    color: "#8A8A9E",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 20,
  },
  modalActionsList: {
    gap: 10,
    marginBottom: 18,
  },
  modalActionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1F1D32",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  modalActionIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  modalActionTextCol: {
    flex: 1,
  },
  modalActionTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
  },
  modalActionDesc: {
    color: "#8A8A9E",
    fontSize: 12,
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.25)",
  },
  resetButtonText: {
    color: "#EF4444",
    fontSize: 13,
    fontWeight: "700",
  },
});
