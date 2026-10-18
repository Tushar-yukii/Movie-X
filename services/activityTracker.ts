import { useEffect, useState } from "react";
import { Platform } from "react-native";

export type ContentCategory = "anime" | "manga" | "novel" | "movie" | "series";
export type SpecificContentType =
  | "anime"
  | "manga"
  | "manhwa"
  | "manhua"
  | "novel"
  | "movie"
  | "series";

export type FilterCategory = "All" | "Anime" | "Manga" | "Novel";

export type ActivityRecord = {
  id: string;
  contentId: string;
  title: string;
  category: ContentCategory;
  specificType: SpecificContentType;
  posterUrl?: string | null;
  durationMinutes: number;
  episodesWatched: number;
  chaptersRead: number;
  completed: boolean;
  genres: string[];
  studio?: string | null;
  date: string; // YYYY-MM-DD
  timestamp: number; // ms
};

export type HeatmapCell = {
  date: string; // YYYY-MM-DD
  dayLabel: string;
  count: number;
  minutes: number;
  level: 0 | 1 | 2 | 3; // 0 = none, 1 = low, 2 = med, 3 = high
};

export type UserStats = {
  totalMinutes: number;
  formattedDuration: string;
  itemsConsumed: number;
  activeDays: number;
  episodesWatched: number;
  chaptersRead: number;
  avgEpisodesPerDay: number;
  avgChaptersPerDay: number;
  currentStreak: number;
  longestStreak: number;
  xp: number;
  level: number;
  rankTitle: string;
  rankIcon: string;
  levelProgressPercent: number;
  xpCurrentLevel: number;
  xpNextLevel: number;
  favoriteTitle: {
    title: string;
    posterUrl: string | null;
    category: string;
    durationMinutes: number;
    episodesOrChapters: string;
    contentId: string;
  } | null;
  topGenres: { name: string; count: number; percent: number }[];
  topStudios: { name: string; count: number; percent: number }[];
  heatmap: HeatmapCell[];
  completedCount: number;
  inProgressCount: number;
  mostActiveDay: string | null;
  hasActivity: boolean;
};

// Configurable Rank Levels
export const RANK_TIERS = [
  { level: 1, minXp: 0, maxXp: 100, title: "ACADEMY STUDENT", icon: "🎒" },
  { level: 2, minXp: 100, maxXp: 300, title: "GENIN", icon: "🥋" },
  { level: 3, minXp: 300, maxXp: 600, title: "CHUNIN", icon: "⚔️" },
  { level: 4, minXp: 600, maxXp: 1000, title: "JONIN", icon: "🛡️" },
  { level: 5, minXp: 1000, maxXp: 1500, title: "SPECIAL OPS", icon: "🦅" },
  { level: 6, minXp: 1500, maxXp: 2500, title: "HASHIRA", icon: "⚡" },
  { level: 7, minXp: 2500, maxXp: 5000, title: "OTAKU SAGE", icon: "👑" },
];

// In-Memory Activity Store
let activityStore: ActivityRecord[] = [];
let listeners: (() => void)[] = [];

const notifyListeners = () => {
  const currentListeners = [...listeners];
  for (const listener of currentListeners) {
    try {
      listener();
    } catch (err) {
      console.warn("Activity listener error:", err);
    }
  }
};

// Local storage key
const STORAGE_KEY = "@animex_user_activity_v1";

// Simple persistence adapter that works in Web & Native
const loadActivityFromStorage = async (): Promise<ActivityRecord[]> => {
  try {
    if (Platform.OS === "web" && typeof window !== "undefined" && window.localStorage) {
      const data = window.localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    }
  } catch (err) {
    console.warn("Could not read local activity storage:", err);
  }
  return [];
};

const saveActivityToStorage = async (records: ActivityRecord[]): Promise<void> => {
  try {
    if (Platform.OS === "web" && typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    }
  } catch (err) {
    console.warn("Could not write to local activity storage:", err);
  }
};

// Initialize from storage
let initialized = false;
export const initActivityTracker = async () => {
  if (initialized) return;
  initialized = true;
  const stored = await loadActivityFromStorage();
  if (stored && stored.length > 0) {
    activityStore = stored;
    notifyListeners();
  }
};

// Helper to format minutes
export const formatDuration = (totalMinutes: number): string => {
  if (totalMinutes <= 0) return "0m";
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
  }
  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  return `${minutes}m`;
};

// Helper: current date formatted YYYY-MM-DD
export const getTodayDateString = (d = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Helper: parse YYYY-MM-DD reliably in local time without UTC offset bugs
export const parseLocalDate = (dateStr: string): Date => {
  const parts = dateStr.split("-");
  if (parts.length !== 3) return new Date();
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  return new Date(year, month, day, 12, 0, 0); // Noon avoids DST hour boundary shifts
};

// Category filter matcher
const matchesCategory = (record: ActivityRecord, filter: FilterCategory): boolean => {
  if (filter === "All") return true;
  if (filter === "Anime") return record.category === "anime";
  if (filter === "Manga") {
    return (
      record.category === "manga" ||
      record.specificType === "manga" ||
      record.specificType === "manhwa" ||
      record.specificType === "manhua"
    );
  }
  if (filter === "Novel") return record.category === "novel";
  return true;
};

// Calculate streaks
const calculateStreaks = (records: ActivityRecord[]): { currentStreak: number; longestStreak: number } => {
  if (records.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const distinctDates = Array.from(new Set(records.map((r) => r.date))).sort();
  if (distinctDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  let longest = 1;
  let currentStreakRun = 1;

  for (let i = 1; i < distinctDates.length; i++) {
    const prev = parseLocalDate(distinctDates[i - 1]).getTime();
    const curr = parseLocalDate(distinctDates[i]).getTime();
    const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      currentStreakRun += 1;
      if (currentStreakRun > longest) {
        longest = currentStreakRun;
      }
    } else {
      currentStreakRun = 1;
    }
  }

  // Calculate current active streak ending at today or yesterday
  const today = getTodayDateString();
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = getTodayDateString(yesterdayDate);

  const lastActiveDate = distinctDates[distinctDates.length - 1];
  let activeStreak = 0;

  if (lastActiveDate === today || lastActiveDate === yesterday) {
    activeStreak = 1;
    let checkDate = parseLocalDate(lastActiveDate);

    for (let i = distinctDates.length - 2; i >= 0; i--) {
      checkDate.setDate(checkDate.getDate() - 1);
      const expectedDateStr = getTodayDateString(checkDate);
      if (distinctDates[i] === expectedDateStr) {
        activeStreak += 1;
      } else {
        break;
      }
    }
  }

  return { currentStreak: activeStreak, longestStreak: longest };
};

// Generate 14-week Activity Heatmap Grid aligned with Sunday
const generateHeatmap = (records: ActivityRecord[]): HeatmapCell[] => {
  const cells: HeatmapCell[] = [];
  const countByDate = new Map<string, { count: number; minutes: number }>();

  records.forEach((r) => {
    const existing = countByDate.get(r.date) || { count: 0, minutes: 0 };
    countByDate.set(r.date, {
      count: existing.count + (r.episodesWatched || r.chaptersRead || 1),
      minutes: existing.minutes + (r.durationMinutes || 0),
    });
  });

  const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

  // 14 weeks = 98 days aligned with Sunday
  const today = new Date();
  const currentDayOfWeek = today.getDay(); // 0 is Sunday
  const startDate = new Date(today);
  // Start on Sunday 13 weeks prior to current week's Sunday
  startDate.setDate(today.getDate() - currentDayOfWeek - 13 * 7);

  for (let i = 0; i < 98; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const dateStr = getTodayDateString(d);
    const dayLabel = DAY_LABELS[d.getDay()];
    const stats = countByDate.get(dateStr) || { count: 0, minutes: 0 };

    let level: 0 | 1 | 2 | 3 = 0;
    if (stats.count > 0 || stats.minutes > 0) {
      if (stats.count >= 4 || stats.minutes >= 80) {
        level = 3;
      } else if (stats.count >= 2 || stats.minutes >= 40) {
        level = 2;
      } else {
        level = 1;
      }
    }

    cells.push({
      date: dateStr,
      dayLabel,
      count: stats.count,
      minutes: stats.minutes,
      level,
    });
  }

  return cells;
};

// Compute User Stats from Activity Store
export const calculateUserStats = (filter: FilterCategory = "All"): UserStats => {
  const filtered = activityStore.filter((r) => matchesCategory(r, filter));

  if (filtered.length === 0) {
    return {
      totalMinutes: 0,
      formattedDuration: "0m",
      itemsConsumed: 0,
      activeDays: 0,
      episodesWatched: 0,
      chaptersRead: 0,
      avgEpisodesPerDay: 0,
      avgChaptersPerDay: 0,
      currentStreak: 0,
      longestStreak: 0,
      xp: 0,
      level: 1,
      rankTitle: RANK_TIERS[0].title,
      rankIcon: RANK_TIERS[0].icon,
      levelProgressPercent: 0,
      xpCurrentLevel: 0,
      xpNextLevel: RANK_TIERS[0].maxXp,
      favoriteTitle: null,
      topGenres: [],
      topStudios: [],
      heatmap: generateHeatmap([]),
      completedCount: 0,
      inProgressCount: 0,
      mostActiveDay: null,
      hasActivity: false,
    };
  }

  // 1. Totals
  let totalMinutes = 0;
  let episodesWatched = 0;
  let chaptersRead = 0;
  let completedCount = 0;
  const distinctTitles = new Set<string>();
  const distinctDays = new Set<string>();
  const timeByTitle = new Map<
    string,
    { title: string; posterUrl: string | null; category: string; minutes: number; eps: number; chs: number; contentId: string }
  >();
  const genreCount = new Map<string, Set<string>>();
  const studioCount = new Map<string, Set<string>>();
  const countByDayOfWeek = new Map<string, number>();

  filtered.forEach((r) => {
    totalMinutes += r.durationMinutes || 0;
    episodesWatched += r.episodesWatched || 0;
    chaptersRead += r.chaptersRead || 0;
    if (r.completed) completedCount += 1;
    distinctTitles.add(r.contentId || r.title);
    distinctDays.add(r.date);

    // Favorite tracker
    const titleKey = r.contentId || r.title;
    const existing = timeByTitle.get(titleKey) || {
      title: r.title,
      posterUrl: r.posterUrl || null,
      category: r.category,
      minutes: 0,
      eps: 0,
      chs: 0,
      contentId: r.contentId,
    };
    existing.minutes += r.durationMinutes || 0;
    existing.eps += r.episodesWatched || 0;
    existing.chs += r.chaptersRead || 0;
    if (r.posterUrl && !existing.posterUrl) {
      existing.posterUrl = r.posterUrl;
    }
    timeByTitle.set(titleKey, existing);

    // Genres
    if (r.genres && Array.isArray(r.genres)) {
      r.genres.forEach((g) => {
        if (!genreCount.has(g)) genreCount.set(g, new Set());
        genreCount.get(g)!.add(titleKey);
      });
    }

    // Studios
    if (r.studio) {
      if (!studioCount.has(r.studio)) studioCount.set(r.studio, new Set());
      studioCount.get(r.studio)!.add(titleKey);
    }

    // Day of week frequency
    try {
      const dayName = parseLocalDate(r.date).toLocaleDateString("en-US", { weekday: "long" });
      countByDayOfWeek.set(dayName, (countByDayOfWeek.get(dayName) || 0) + 1);
    } catch {
      // ignore date format error
    }
  });

  const activeDays = distinctDays.size;
  const itemsConsumed = distinctTitles.size;
  const inProgressCount = Math.max(0, itemsConsumed - completedCount);

  // 2. Averages
  const avgEpisodesPerDay =
    activeDays > 0 ? parseFloat((episodesWatched / activeDays).toFixed(1)) : 0;
  const avgChaptersPerDay =
    activeDays > 0 ? parseFloat((chaptersRead / activeDays).toFixed(1)) : 0;

  // 3. Streaks
  const { currentStreak, longestStreak } = calculateStreaks(filtered);

  // 4. XP & Rank System
  // 1 ep = 20 XP, 1 ch = 10 XP, completed = 50 XP, 1 hr watched = 15 XP
  const xp =
    episodesWatched * 20 +
    chaptersRead * 10 +
    completedCount * 50 +
    Math.floor((totalMinutes / 60) * 15);

  let currentRankTier = RANK_TIERS[0];
  for (let i = RANK_TIERS.length - 1; i >= 0; i--) {
    if (xp >= RANK_TIERS[i].minXp) {
      currentRankTier = RANK_TIERS[i];
      break;
    }
  }

  const xpCurrentLevel = currentRankTier.minXp;
  const xpNextLevel = currentRankTier.maxXp;
  const xpInTier = xp - xpCurrentLevel;
  const xpTierRange = xpNextLevel - xpCurrentLevel;
  const levelProgressPercent = Math.min(100, Math.max(0, Math.round((xpInTier / xpTierRange) * 100)));

  // 5. Favorite Title
  let favoriteTitle: UserStats["favoriteTitle"] = null;
  if (timeByTitle.size > 0) {
    const sorted = Array.from(timeByTitle.values()).sort((a, b) => b.minutes - a.minutes);
    const fav = sorted[0];
    let epsOrChapters = "";
    if (fav.eps > 0) {
      epsOrChapters = `${fav.eps} ${fav.eps === 1 ? "episode" : "episodes"}`;
    } else if (fav.chs > 0) {
      epsOrChapters = `${fav.chs} ${fav.chs === 1 ? "chapter" : "chapters"}`;
    }

    favoriteTitle = {
      title: fav.title,
      posterUrl: fav.posterUrl,
      category: fav.category.toUpperCase(),
      durationMinutes: fav.minutes,
      episodesOrChapters: epsOrChapters,
      contentId: fav.contentId,
    };
  }

  // 6. Top Genres
  const sortedGenres = Array.from(genreCount.entries())
    .map(([name, set]) => ({ name, count: set.size }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const maxGenreCount = sortedGenres.length > 0 ? sortedGenres[0].count : 1;
  const topGenres = sortedGenres.map((g) => ({
    name: g.name,
    count: g.count,
    percent: Math.min(100, Math.round((g.count / maxGenreCount) * 100)),
  }));

  // 7. Top Studios
  const sortedStudios = Array.from(studioCount.entries())
    .map(([name, set]) => ({ name, count: set.size }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const maxStudioCount = sortedStudios.length > 0 ? sortedStudios[0].count : 1;
  const topStudios = sortedStudios.map((s) => ({
    name: s.name,
    count: s.count,
    percent: Math.min(100, Math.round((s.count / maxStudioCount) * 100)),
  }));

  // 8. Most Active Day
  let mostActiveDay: string | null = null;
  let highestDayCount = 0;
  countByDayOfWeek.forEach((count, day) => {
    if (count > highestDayCount) {
      highestDayCount = count;
      mostActiveDay = day;
    }
  });

  return {
    totalMinutes,
    formattedDuration: formatDuration(totalMinutes),
    itemsConsumed,
    activeDays,
    episodesWatched,
    chaptersRead,
    avgEpisodesPerDay,
    avgChaptersPerDay,
    currentStreak,
    longestStreak,
    xp,
    level: currentRankTier.level,
    rankTitle: currentRankTier.title,
    rankIcon: currentRankTier.icon,
    levelProgressPercent,
    xpCurrentLevel,
    xpNextLevel,
    favoriteTitle,
    topGenres,
    topStudios,
    heatmap: generateHeatmap(filtered),
    completedCount,
    inProgressCount,
    mostActiveDay,
    hasActivity: true,
  };
};

// Add or update activity
export const logUserActivity = async (
  activity: Omit<ActivityRecord, "id" | "timestamp" | "date"> & { date?: string; timestamp?: number }
): Promise<void> => {
  const timestamp = activity.timestamp || Date.now();
  const date = activity.date || getTodayDateString(new Date(timestamp));
  const id = `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const record: ActivityRecord = {
    ...activity,
    id,
    date,
    timestamp,
  };

  activityStore.push(record);
  await saveActivityToStorage(activityStore);
  notifyListeners();
};

// Clear all activity (for testing a fresh user zero state)
export const clearUserActivity = async (): Promise<void> => {
  activityStore = [];
  await saveActivityToStorage(activityStore);
  notifyListeners();
};

// Seed realistic test data (for testing user progress)
export const seedSampleActivity = async (): Promise<void> => {
  const today = new Date();
  const sampleRecords: Omit<ActivityRecord, "id" | "timestamp">[] = [
    {
      contentId: "lookism_1",
      title: "Lookism",
      category: "manga",
      specificType: "manhwa",
      posterUrl: "https://images.unsplash.com/photo-1618336753974-aae8e04506aa?q=80&w=300&auto=format&fit=crop",
      durationMinutes: 490,
      episodesWatched: 0,
      chaptersRead: 53,
      completed: false,
      genres: ["Action", "Drama", "Fantasy"],
      studio: "PTJ Comics",
      date: getTodayDateString(today),
    },
    {
      contentId: "solo_leveling_1",
      title: "Solo Leveling",
      category: "anime",
      specificType: "anime",
      posterUrl: "https://image.tmdb.org/t/p/w500/geCRueV3ElhRTr0xtJuPxJ8BGdM.jpg",
      durationMinutes: 120,
      episodesWatched: 5,
      chaptersRead: 0,
      completed: false,
      genres: ["Action", "Fantasy", "Adventure"],
      studio: "A-1 Pictures",
      date: getTodayDateString(new Date(today.getTime() - 86400000)),
    },
    {
      contentId: "frieren_1",
      title: "Frieren: Beyond Journey's End",
      category: "anime",
      specificType: "anime",
      posterUrl: "https://image.tmdb.org/t/p/w500/dqzenchTd7lp5zht7BdlqM7RBhD.jpg",
      durationMinutes: 140,
      episodesWatched: 6,
      chaptersRead: 0,
      completed: true,
      genres: ["Fantasy", "Adventure", "Drama"],
      studio: "Madhouse",
      date: getTodayDateString(new Date(today.getTime() - 86400000 * 2)),
    },
  ];

  for (const item of sampleRecords) {
    await logUserActivity(item);
  }
};

// React hook to access activity stats with automatic re-renders
export const useActivityStats = (filter: FilterCategory = "All") => {
  const [stats, setStats] = useState<UserStats>(() => calculateUserStats(filter));
  const [loading, setLoading] = useState<boolean>(!initialized);

  useEffect(() => {
    let isMounted = true;

    if (initialized) {
      setStats(calculateUserStats(filter));
    } else {
      initActivityTracker().then(() => {
        if (isMounted) {
          setStats(calculateUserStats(filter));
          setLoading(false);
        }
      });
    }

    const handleChange = () => {
      if (isMounted) {
        setStats(calculateUserStats(filter));
      }
    };

    const unsubscribe = () => {
      const idx = listeners.indexOf(handleChange);
      if (idx !== -1) listeners.splice(idx, 1);
    };

    listeners.push(handleChange);

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [filter]);

  return { stats, loading, refresh: () => setStats(calculateUserStats(filter)) };
};

