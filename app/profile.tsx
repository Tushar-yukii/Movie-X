import { icons } from "@/constants/icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";

import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProfileScreen() {
  // --------------------------------
  // USER NAME
  // --------------------------------

  const [name, setName] = useState("yukki");

  // Temporary name while editing
  const [editName, setEditName] = useState(name);

  // Controls Edit Name modal
  const [editModalVisible, setEditModalVisible] = useState(false);

  // --------------------------------
  // OPEN EDIT NAME
  // --------------------------------

  const openEditName = () => {
    setEditName(name);
    setEditModalVisible(true);
  };

  // --------------------------------
  // SAVE NAME
  // --------------------------------

  const saveName = () => {
    const trimmedName = editName.trim();

    if (trimmedName.length === 0) {
      return;
    }

    setName(trimmedName);
    setEditModalVisible(false);
  };

  // --------------------------------
  // CLOSE EDIT MODAL
  // --------------------------------

  const closeEditModal = () => {
    setEditModalVisible(false);
    setEditName(name);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* =========================
            HEADER
        ========================== */}

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>
        </View>

        {/* =========================
            USER CARD
        ========================== */}

        <TouchableOpacity
          style={styles.profileCard}
          onPress={openEditName}
          activeOpacity={0.8}
        >
          {/* Profile icon */}

          <View style={styles.profileIconCircle}>
            <Image
              source={icons.person}
              style={styles.profileIcon}
              contentFit="contain"
              tintColor="#777780"
            />
          </View>

          {/* Name */}

          <View style={styles.nameContainer}>
            <Text style={styles.userName} numberOfLines={1}>
              {name}
            </Text>

            <Text style={styles.editHint}>Tap to edit name</Text>
          </View>

          {/* Arrow */}

          <Text style={styles.profileArrow}>›</Text>
        </TouchableOpacity>

        {/* =========================
            STATISTICS
        ========================== */}

        <Text style={styles.sectionTitle}>Statistics</Text>

        <View style={styles.statisticsRow}>
          {/* ANIME */}

          <View style={styles.statCard}>
            <View
              style={[
                styles.statIconBox,
                {
                  backgroundColor: "#373849",
                },
              ]}
            >
              <Text style={styles.statIcon}>✨</Text>
            </View>

            <Text style={styles.statNumber}>0</Text>

            <Text style={styles.statLabel}>Anime</Text>
          </View>

          {/* MOVIES */}

          <View style={styles.statCard}>
            <View
              style={[
                styles.statIconBox,
                {
                  backgroundColor: "#373849",
                },
              ]}
            >
              <Text style={styles.statIcon}>▦</Text>
            </View>

            <Text style={styles.statNumber}>0</Text>

            <Text style={styles.statLabel}>Movies</Text>
          </View>

          {/* SERIES */}

          <View style={styles.statCard}>
            <View
              style={[
                styles.statIconBox,
                {
                  backgroundColor: "#413743",
                },
              ]}
            >
              <Text
                style={[
                  styles.statIcon,
                  {
                    color: "#E7A9D0",
                  },
                ]}
              >
                ▣
              </Text>
            </View>

            <Text style={styles.statNumber}>0</Text>

            <Text style={styles.statLabel}>Series</Text>
          </View>
        </View>

        {/* =========================
            GENRES
        ========================== */}

        <Text style={styles.sectionTitle}>Genres</Text>

        <View style={styles.genresCard}>
          <Text style={styles.noGenres}>No genres available</Text>
        </View>
      </ScrollView>

      {/* =========================
          EDIT NAME MODAL
      ========================== */}

      <Modal
        visible={editModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeEditModal}
      >
        <KeyboardAvoidingView
          style={styles.editModalContainer}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {/* Transparent outside area */}

          <Pressable style={styles.editModalOutside} onPress={closeEditModal} />

          {/* EDIT BOX */}

          <View style={styles.editModalBox}>
            {/* HEADER */}

            <View style={styles.editHeader}>
              <Text style={styles.editTitle}>Edit Name</Text>

              <TouchableOpacity
                style={styles.editCloseButton}
                onPress={closeEditModal}
              >
                <Text style={styles.editCloseText}>×</Text>
              </TouchableOpacity>
            </View>

            {/* INPUT */}

            <View style={styles.inputContainer}>
              <View style={styles.inputIconBox}>
                <Image
                  source={icons.person}
                  style={styles.inputIcon}
                  contentFit="contain"
                  tintColor="#AFA9FF"
                />
              </View>

              <TextInput
                value={editName}
                onChangeText={setEditName}
                style={styles.nameInput}
                placeholder="Enter your name"
                placeholderTextColor="#777780"
                autoFocus
                maxLength={30}
                returnKeyType="done"
                onSubmitEditing={saveName}
              />
            </View>

            {/* SAVE */}

            <TouchableOpacity
              style={styles.saveButton}
              onPress={saveName}
              activeOpacity={0.8}
            >
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  // =================================
  // MAIN
  // =================================

  container: {
    flex: 1,
    backgroundColor: "#111116",
  },

  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "android" ? 48 : 60,
    paddingBottom: 50,
  },

  // =================================
  // HEADER
  // =================================

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    marginBottom: 38,
  },

  headerTitle: {
    color: "#FFFFFF",

    fontSize: 40,
    fontWeight: "700",

    letterSpacing: -1,
  },

  closeButton: {
    width: 58,
    height: 58,

    borderRadius: 29,

    backgroundColor: "#2B2B32",

    justifyContent: "center",
    alignItems: "center",
  },

  closeText: {
    color: "#FFFFFF",

    fontSize: 40,
    fontWeight: "300",

    lineHeight: 42,
  },

  // =================================
  // PROFILE CARD
  // =================================

  profileCard: {
    height: 274,

    borderRadius: 32,

    backgroundColor: "#222228",

    paddingHorizontal: 30,

    flexDirection: "row",
    alignItems: "center",

    marginBottom: 76,
  },

  profileIconCircle: {
    width: 186,
    height: 186,

    borderRadius: 93,

    backgroundColor: "#0D0D12",

    justifyContent: "center",
    alignItems: "center",

    marginRight: 40,
  },

  profileIcon: {
    width: 90,
    height: 90,
  },

  nameContainer: {
    flex: 1,
  },

  userName: {
    color: "#FFFFFF",

    fontSize: 38,
    fontWeight: "700",

    marginBottom: 8,
  },

  editHint: {
    color: "#777780",

    fontSize: 13,
  },

  profileArrow: {
    color: "#A7A7AF",

    fontSize: 36,

    marginLeft: 8,
  },

  // =================================
  // SECTION
  // =================================

  sectionTitle: {
    color: "#8F8F98",

    fontSize: 28,
    fontWeight: "700",

    marginBottom: 28,
  },

  // =================================
  // STATISTICS
  // =================================

  statisticsRow: {
    flexDirection: "row",

    gap: 12,

    marginBottom: 76,
  },

  statCard: {
    flex: 1,

    height: 348,

    borderRadius: 32,

    backgroundColor: "#222228",

    justifyContent: "space-between",
    alignItems: "center",

    paddingVertical: 38,
  },

  statIconBox: {
    width: 112,
    height: 112,

    borderRadius: 30,

    justifyContent: "center",
    alignItems: "center",
  },

  statIcon: {
    color: "#AFA9FF",

    fontSize: 40,
  },

  statNumber: {
    color: "#FFFFFF",

    fontSize: 58,
    fontWeight: "500",
  },

  statLabel: {
    color: "#C4C4CB",

    fontSize: 23,
  },

  // =================================
  // GENRES
  // =================================

  genresCard: {
    height: 160,

    borderRadius: 32,

    backgroundColor: "#222228",

    justifyContent: "center",
    alignItems: "center",
  },

  noGenres: {
    color: "#C8C8D0",

    fontSize: 21,
  },

  // =================================
  // EDIT NAME MODAL
  // =================================

  editModalContainer: {
    flex: 1,

    justifyContent: "flex-end",

    backgroundColor: "transparent",
  },

  editModalOutside: {
    flex: 1,

    backgroundColor: "rgba(0,0,0,0.55)",
  },

  editModalBox: {
    backgroundColor: "#15151C",

    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,

    paddingHorizontal: 30,
    paddingTop: 30,
    paddingBottom: 38,
  },

  editHeader: {
    flexDirection: "row",

    alignItems: "center",
    justifyContent: "space-between",

    marginBottom: 28,
  },

  editTitle: {
    color: "#FFFFFF",

    fontSize: 30,
    fontWeight: "700",
  },

  editCloseButton: {
    width: 58,
    height: 58,

    borderRadius: 29,

    backgroundColor: "#36363E",

    justifyContent: "center",
    alignItems: "center",
  },

  editCloseText: {
    color: "#FFFFFF",

    fontSize: 38,

    lineHeight: 40,
  },

  // =================================
  // INPUT
  // =================================

  inputContainer: {
    height: 76,

    borderRadius: 30,

    backgroundColor: "#222228",

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 12,

    marginBottom: 28,
  },

  inputIconBox: {
    width: 54,
    height: 54,

    borderRadius: 18,

    backgroundColor: "#0F0F15",

    justifyContent: "center",
    alignItems: "center",

    marginRight: 12,
  },

  inputIcon: {
    width: 28,
    height: 28,
  },

  nameInput: {
    flex: 1,

    color: "#FFFFFF",

    fontSize: 21,
    fontWeight: "600",

    paddingVertical: 0,
  },

  // =================================
  // SAVE
  // =================================

  saveButton: {
    height: 76,

    borderRadius: 38,

    backgroundColor: "#B7BAFF",

    justifyContent: "center",
    alignItems: "center",
  },

  saveText: {
    color: "#202028",

    fontSize: 22,
    fontWeight: "700",
  },
});
