import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export interface IconOption {
  id: string;
  emoji: string;
  label: string;
}

export const CATEGORY_ICON_OPTIONS: IconOption[] = [
  { id: "folder", emoji: "📁", label: "Folder" },
  { id: "movies", emoji: "🎬", label: "Movies" },
  { id: "watchlist", emoji: "🍿", label: "Watchlist" },
  { id: "series", emoji: "📺", label: "Series" },
  { id: "favorites", emoji: "⭐", label: "Favorites" },
  { id: "loved", emoji: "💖", label: "Loved" },
  { id: "trending", emoji: "🔥", label: "Trending" },
  { id: "goals", emoji: "🎯", label: "Goals" },
  { id: "quick_picks", emoji: "⚡", label: "Picks" },
  { id: "manga", emoji: "📖", label: "Manga" },
  { id: "anime", emoji: "🌸", label: "Anime" },
  { id: "completed", emoji: "🏆", label: "Finished" },
];

interface CategoryIconPickerProps {
  selectedEmoji: string;
  onSelectEmoji: (emoji: string) => void;
  accentColor?: string;
}

export default function CategoryIconPicker({
  selectedEmoji,
  onSelectEmoji,
  accentColor = "#AAA4FF",
}: CategoryIconPickerProps) {
  return (
    <View style={styles.grid}>
      {CATEGORY_ICON_OPTIONS.map((item) => {
        const isSelected = selectedEmoji === item.emoji;
        return (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.iconCard,
              isSelected && {
                borderColor: accentColor,
                backgroundColor: `${accentColor}22`,
              },
            ]}
            onPress={() => onSelectEmoji(item.emoji)}
            activeOpacity={0.7}
          >
            <Text style={styles.emojiText}>{item.emoji}</Text>
            <Text
              style={[
                styles.labelText,
                isSelected && { color: "#FFFFFF", fontWeight: "700" },
              ]}
              numberOfLines={1}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 8,
  },
  iconCard: {
    width: "23%",
    height: 58,
    borderRadius: 14,
    backgroundColor: "#161526",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  emojiText: {
    fontSize: 20,
    marginBottom: 2,
  },
  labelText: {
    fontSize: 10,
    color: "#8E8D9F",
    fontWeight: "500",
  },
});

