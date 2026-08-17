import { icons } from "@/constants/icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
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

type SearchTab = "Series" | "Movies" | "Anime";

type Props = {
  onSearchPress?: () => void;
  searchTab?: SearchTab;
};

const TopBar = ({ onSearchPress, searchTab = "Movies" }: Props) => {
  const router = useRouter();

  // Controls profile popup
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);

  // Search
  const handleSearchPress = () => {
    if (onSearchPress) {
      onSearchPress();
    } else {
      router.push({
        pathname: "/search-page",
        params: { defaultTab: searchTab },
      });
    }
  };

  // Open profile popup
  const handlePersonPress = () => {
    setProfileMenuVisible(true);
  };

  // Close profile popup
  const closeProfileMenu = () => {
    setProfileMenuVisible(false);
  };

  return (
    <>
      {/* ================= TOP BAR ================= */}

      <View style={styles.topBar}>
        <LinearGradient
          colors={["rgba(0,0,0,0.55)", "transparent"]}
          style={styles.topBarGradientBg}
        />

        {/* PERSON BUTTON */}
        <TouchableOpacity
          onPress={handlePersonPress}
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

      {/* ================= PROFILE BOTTOM MENU ================= */}

      <Modal
        visible={profileMenuVisible}
        transparent
        animationType="slide"
        onRequestClose={closeProfileMenu}
      >
        <View style={styles.modalContainer}>
          {/* Dark background */}
          <Pressable style={styles.modalBackdrop} onPress={closeProfileMenu} />

          {/* Bottom Sheet */}
          <View style={styles.bottomSheet}>
            {/* Small handle */}
            <View style={styles.sheetHandle} />

            {/* VIEW PROFILE */}
            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={() => {
                // Functionality will be added later
              }}
            >
              <View style={styles.menuIconBox}>
                <Image
                  source={icons.person}
                  style={styles.menuIcon}
                  contentFit="contain"
                  tintColor="#AB8BFF"
                />
              </View>

              <Text style={styles.menuText}>View Profile</Text>

              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>

            {/* SETTINGS */}
            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={() => {
                // Functionality will be added later
              }}
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
              activeOpacity={0.8}
              onPress={closeProfileMenu}
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

/* =====================================================
   STYLES
===================================================== */

const styles = StyleSheet.create({
  /* ---------- TOP BAR ---------- */

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

    backgroundColor: "rgba(99, 120, 255, 0.35)",

    borderWidth: 2,
    borderColor: "rgba(140, 160, 255, 0.9)",

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

  /* ---------- MODAL ---------- */

  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },

  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },

  /* ---------- BOTTOM SHEET ---------- */

  bottomSheet: {
    backgroundColor: "#1C1C23",

    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,

    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: Platform.OS === "ios" ? 34 : 24,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.35,
    shadowRadius: 12,

    elevation: 20,
  },

  sheetHandle: {
    width: 42,
    height: 5,
    borderRadius: 3,

    backgroundColor: "#777780",

    alignSelf: "center",

    marginBottom: 24,
  },

  /* ---------- MENU ITEM ---------- */

  menuItem: {
    height: 82,

    backgroundColor: "#202027",

    borderRadius: 18,

    marginBottom: 14,

    paddingHorizontal: 20,

    flexDirection: "row",
    alignItems: "center",
  },

  menuIconBox: {
    width: 48,
    height: 48,

    borderRadius: 15,

    backgroundColor: "#19191F",

    justifyContent: "center",
    alignItems: "center",

    marginRight: 18,
  },

  menuIcon: {
    width: 24,
    height: 24,
  },

  settingsIcon: {
    fontSize: 25,
    color: "#AB8BFF",
  },

  menuText: {
    flex: 1,

    color: "#FFFFFF",

    fontSize: 18,
    fontWeight: "600",
  },

  arrow: {
    color: "#A8A8B0",

    fontSize: 34,
    fontWeight: "300",

    marginTop: -3,
  },

  /* ---------- CANCEL ---------- */

  cancelButton: {
    height: 76,

    borderRadius: 24,

    backgroundColor: "#E8B5D6",

    justifyContent: "center",
    alignItems: "center",

    marginTop: 4,
  },

  cancelText: {
    color: "#2A1B28",

    fontSize: 19,
    fontWeight: "600",
  },
});
