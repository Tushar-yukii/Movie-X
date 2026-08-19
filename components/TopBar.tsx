import {
  Modal,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";

import { icons } from "@/constants/icons";

type SearchTab = "Series" | "Movies" | "Anime";

type Props = {
  onSearchPress?: () => void;
  searchTab?: SearchTab;
};

const TopBar = ({ onSearchPress, searchTab = "Movies" }: Props) => {
  const router = useRouter();

  // Controls the profile bottom sheet
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);

  // SEARCH

  const handleSearchPress = () => {
    if (onSearchPress) {
      onSearchPress();
    } else {
      router.push({
        pathname: "/search-page",
        params: {
          defaultTab: searchTab,
        },
      });
    }
  };

  // PROFILE BUTTON

  const handleProfilePress = () => {
    setProfileMenuVisible(true);
  };

  // VIEW PROFILE

  const handleViewProfile = () => {
    // Close bottom sheet first
    setProfileMenuVisible(false);

    // IMPORTANT:
    // This is outside /(tabs), so Profile will NOT
    // show the bottom navigation.
    router.push("/profile");
  };

  // SETTINGS

  const handleSettings = () => {
    setProfileMenuVisible(false);
  };

  // CANCEL

  const handleCancel = () => {
    setProfileMenuVisible(false);
  };

  return (
    <>
      {/* 
          TOP BAR
       */}

      <View style={styles.topBar}>
        <LinearGradient
          colors={["rgba(0,0,0,0.55)", "transparent"]}
          style={styles.topBarGradientBg}
        />

        {/* PERSON BUTTON */}

        <TouchableOpacity
          onPress={handleProfilePress}
          style={styles.personCircle}
          activeOpacity={0.8}
        >
          <Image
            source={icons.person}
            style={styles.iconImg}
            contentFit="contain"
            tintColor="#FFFFFF"
          />
        </TouchableOpacity>

        {/* SEARCH BUTTON */}

        <TouchableOpacity
          onPress={handleSearchPress}
          style={styles.searchCircle}
          activeOpacity={0.8}
        >
          <Image
            source={icons.search}
            style={styles.iconImg}
            contentFit="contain"
            tintColor="#FFFFFF"
          />
        </TouchableOpacity>
      </View>

      {/* 
          PROFILE BOTTOM SHEET
       */}

      <Modal
        visible={profileMenuVisible}
        transparent
        animationType="slide"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalContainer}>
          {/* Transparent area above sheet */}

          <Pressable style={styles.modalOutside} onPress={handleCancel} />

          {/* 
              BOTTOM SHEET
           */}

          <View style={styles.bottomSheet}>
            {/* Small handle */}

            <View style={styles.sheetHandle} />

            {/* VIEW PROFILE */}

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleViewProfile}
              activeOpacity={0.75}
            >
              <View style={styles.menuIconBox}>
                <Image
                  source={icons.person}
                  style={styles.menuIcon}
                  contentFit="contain"
                  tintColor="#A78BFA"
                />
              </View>

              <Text style={styles.menuText}>View Profile</Text>

              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>

            {/* SETTINGS */}

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleSettings}
              activeOpacity={0.75}
            >
              <View style={styles.menuIconBox}>
                <Text style={styles.settingsIcon}>⚙</Text>
              </View>

              <Text style={styles.menuText}>Settings</Text>

              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>

            {/* CANCEL */}

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default TopBar;

const styles = StyleSheet.create({
  // TOP BAR

  topBar: {
    paddingTop:
      Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) + 8 : 52,

    paddingBottom: 8,
    paddingHorizontal: 16,

    position: "absolute",
    top: 0,
    left: 0,
    right: 0,

    zIndex: 10,

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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

    backgroundColor: "rgba(99,120,255,0.35)",

    borderWidth: 2,
    borderColor: "rgba(140,160,255,0.9)",

    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#6378FF",
    shadowOffset: {
      width: 0,
      height: 0,
    },
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

  // MODAL

  modalContainer: {
    flex: 1,

    // IMPORTANT:
    // No black overlay.
    // Your original page remains visible.
    backgroundColor: "transparent",

    justifyContent: "flex-end",
  },

  modalOutside: {
    flex: 1,

    // Completely transparent.
    // This prevents the page from becoming dark.
    backgroundColor: "transparent",
  },

  // BOTTOM SHEET

  bottomSheet: {
    backgroundColor: "#1B1B24",

    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,

    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === "android" ? 24 : 34,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.35,
    shadowRadius: 15,

    elevation: 20,
  },

  sheetHandle: {
    width: 42,
    height: 5,

    borderRadius: 3,

    backgroundColor: "#85858D",

    alignSelf: "center",

    marginBottom: 22,
  },

  // MENU ITEM

  menuItem: {
    height: 92,

    borderRadius: 22,

    backgroundColor: "#202027",

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 16,

    marginBottom: 16,
  },

  menuIconBox: {
    width: 52,
    height: 52,

    borderRadius: 16,

    backgroundColor: "#17171E",

    justifyContent: "center",
    alignItems: "center",

    marginRight: 18,
  },

  menuIcon: {
    width: 27,
    height: 27,
  },

  settingsIcon: {
    fontSize: 27,
    color: "#A78BFA",
  },

  menuText: {
    flex: 1,

    color: "#FFFFFF",

    fontSize: 18,
    fontWeight: "700",
  },

  arrow: {
    color: "#BDBDC5",

    fontSize: 32,
    fontWeight: "300",

    marginTop: -3,
  },

  // CANCEL

  cancelButton: {
    height: 76,

    borderRadius: 28,

    backgroundColor: "#E8A9D1",

    justifyContent: "center",
    alignItems: "center",

    marginTop: 4,
  },

  cancelText: {
    color: "#17171E",

    fontSize: 19,
    fontWeight: "700",
  },
});
