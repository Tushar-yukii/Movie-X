import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export interface ColorOption {
  id: string;
  name: string;
  hex: string;
}

export const CATEGORY_COLOR_OPTIONS: ColorOption[] = [
  { id: "lavender", name: "Lavender", hex: "#AAA4FF" },
  { id: "mint", name: "Mint", hex: "#7FE0D4" },
  { id: "orange", name: "Orange", hex: "#FFA26B" },
  { id: "pink", name: "Pink", hex: "#E8A9D1" },
  { id: "purple", name: "Purple", hex: "#7B6FCD" },
  { id: "yellow", name: "Yellow", hex: "#FBBF24" },
];

interface CategoryColorPickerProps {
  selectedColor: string;
  onSelectColor: (color: string) => void;
}

export default function CategoryColorPicker({
  selectedColor,
  onSelectColor,
}: CategoryColorPickerProps) {
  return (
    <View style={styles.container}>
      {CATEGORY_COLOR_OPTIONS.map((item) => {
        const isSelected = selectedColor.toLowerCase() === item.hex.toLowerCase();
        return (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.colorWrapper,
              isSelected && { borderColor: item.hex },
            ]}
            onPress={() => onSelectColor(item.hex)}
            activeOpacity={0.8}
          >
            <View style={[styles.colorCircle, { backgroundColor: item.hex }]}>
              {isSelected ? (
                <Ionicons name="checkmark" size={15} color="#0D0D1A" />
              ) : null}
            </View>
            <Text
              style={[
                styles.colorLabel,
                isSelected && { color: "#FFFFFF", fontWeight: "700" },
              ]}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  colorWrapper: {
    alignItems: "center",
    padding: 3,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  colorLabel: {
    fontSize: 10,
    color: "#8E8D9F",
    marginTop: 4,
    fontWeight: "500",
  },
});

