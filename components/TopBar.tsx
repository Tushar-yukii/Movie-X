// all 3 pages - home , series , movies top bar with person icon
// this is calles a - reusable companent in react.

// components/TopBar.tsx

import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { icons } from "@/constants/icons";

type SearchTab = "Series" | "Movies" | "Anime";

type Props = {
  onSearchPress?: () => void;
  searchTab?: SearchTab;
};
  // onSearchPress is still optional
  // Home page passes its own function (inline overlay)
  // Other pages don't pass anything → default behavior kicks in

const TopBar = ({ onSearchPress, searchTab = "Movies" }: Props) => {
  const router = useRouter();

  // Default search behavior — navigate to search tab
  // This runs ONLY when no onSearchPress is passed from parent
  // Home page passes its own function so this never runs there
  const handleSearchPress = () => {
    if (onSearchPress) {
      // Parent passed a custom function — use it
      // Example: home page opens inline overlay
      onSearchPress();
    } else {
      // No custom function passed — use default behavior
      // Navigate to search tab so user can type and search
      router.push({
        pathname: "/search-page",
        params: { defaultTab: searchTab },
      });
    }
  };

  return (
    <View style={styles.topBar}>
      <LinearGradient
        colors={["rgba(0,0,0,0.55)", "transparent"]}
        style={styles.topBarGradientBg}
      />

      <TouchableOpacity
        onPress={() => router.push("/(tabs)/profile")}
        style={styles.personCircle}
      >
        <Image
          source={icons.person}
          style={styles.iconImg}
          contentFit="contain"
          tintColor="#FFFFFF"
        />
      </TouchableOpacity>

      {/* Now uses handleSearchPress instead of onSearchPress directly
          handleSearchPress checks if custom function exists
          if yes → use it, if no → navigate to search tab */}
      <TouchableOpacity onPress={handleSearchPress} style={styles.searchCircle}>
        <Image
          source={icons.search}
          style={styles.iconImg}
          contentFit="contain"
          tintColor="#FFFFFF"
        />
      </TouchableOpacity>
    </View>
  );
};

export default TopBar;

const styles = StyleSheet.create({
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
});
