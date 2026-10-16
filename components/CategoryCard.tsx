import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Category } from "@/services/categoryStorage";

interface CategoryCardProps {
  category: Category;
  isSelected: boolean;
  itemCount: number;
  onPress: () => void;
}

export default function CategoryCard({
  category,
  isSelected,
  itemCount,
  onPress,
}: CategoryCardProps) {
  const accentColor = category.color || "#AAA4FF";

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSelected && {
          backgroundColor: "#24203A",
          borderColor: accentColor,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View
        style={[
          styles.iconBox,
          { backgroundColor: `${accentColor}25` },
        ]}
      >
        <Text style={styles.emoji}>{category.icon || "📁"}</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {category.name}
        </Text>
        <Text style={styles.count}>
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </Text>
      </View>

      <View
        style={[
          styles.checkbox,
          isSelected && {
            backgroundColor: accentColor,
            borderColor: accentColor,
          },
        ]}
      >
        {isSelected ? (
          <Ionicons name="checkmark" size={14} color="#0D0D1A" />
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#161526",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  emoji: {
    fontSize: 20,
  },
  info: {
    flex: 1,
    paddingRight: 8,
  },
  name: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 2,
  },
  count: {
    color: "#8E8D9F",
    fontSize: 12,
    fontWeight: "500",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: "#4A4864",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#100E1C",
  },
});

