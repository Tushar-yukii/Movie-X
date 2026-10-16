import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  Category,
  deleteCategory,
  removeItemFromCategory,
  renameCategory,
  SavedItem,
  useCategories,
  useSavedItems,
} from "@/services/categoryStorage";
import CreateCategorySheet from "@/components/CreateCategorySheet";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 32 - 12) / 2;

export default function LibraryScreen() {
  const router = useRouter();
  const { categories, loading } = useCategories();
  const savedItems = useSavedItems();

  // Active selected category ("ALL" or specific category id)
  const [activeCategoryId, setActiveCategoryId] = useState<string>("ALL");

  // Create Category Modal state
  const [createModalVisible, setCreateModalVisible] = useState(false);

  // Rename Category Modal state
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [targetCategory, setTargetCategory] = useState<Category | null>(null);
  const [renameText, setRenameText] = useState("");
  const [renameError, setRenameError] = useState("");

  // Items to display based on active category
  const displayedItems = useMemo<SavedItem[]>(() => {
    if (activeCategoryId === "ALL") {
      // Deduplicate items across categories for the "ALL" view
      const uniqueMap = new Map<string, SavedItem>();
      savedItems.forEach((item) => {
        const key = `${item.contentType}_${item.contentId}`;
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, item);
        }
      });
      return Array.from(uniqueMap.values());
    }
    return savedItems.filter((item) => item.categoryId === activeCategoryId);
  }, [activeCategoryId, savedItems]);

  const activeCategory = useMemo(() => {
    return categories.find((c) => c.id === activeCategoryId) || null;
  }, [activeCategoryId, categories]);

  // Handle Remove Item
  const handleRemoveItem = (item: SavedItem) => {
    Alert.alert(
      "Remove Item",
      activeCategoryId === "ALL"
        ? `Remove "${item.title}" from this category?`
        : `Remove "${item.title}" from "${activeCategory?.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            const catId =
              activeCategoryId === "ALL" ? item.categoryId : activeCategoryId;
            await removeItemFromCategory(catId, item.contentType, item.contentId);
          },
        },
      ]
    );
  };

  // Handle Delete Category
  const handleDeleteCategory = (category: Category) => {
    Alert.alert(
      "Delete Category",
      `Are you sure you want to delete "${category.name}"? Titles in this category will not be deleted from other categories.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteCategory(category.id);
            if (activeCategoryId === category.id) {
              setActiveCategoryId("ALL");
            }
          },
        },
      ]
    );
  };



  // Handle Rename Category
  const handleRenameSubmit = async () => {
    if (!targetCategory) return;
    setRenameError("");
    const res = await renameCategory(targetCategory.id, renameText);
    if (!res.success) {
      setRenameError(res.error || "Failed to rename category");
      return;
    }
    setRenameModalVisible(false);
    setTargetCategory(null);
    setRenameText("");
  };

  // Open item detail
  const handleOpenDetail = (item: SavedItem) => {
    router.push({
      pathname: "/movies/[id]",
      params: {
        id: item.contentId,
        type: item.contentType,
      },
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#0D0D1A" />
        <ActivityIndicator size="large" color="#AB8BFF" />
        <Text style={styles.loadingText}>Loading library...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D1A" />

      {/* AMBIENT GLOW */}
      <LinearGradient
        colors={["rgba(108, 99, 255, 0.12)", "rgba(13, 13, 26, 0.0)"]}
        style={styles.ambientGlow}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.5 }}
        pointerEvents="none"
      />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.headerTitleCol}>
          <Text style={styles.headerTitle}>My Library</Text>
          <Text style={styles.headerSubtitle}>
            {categories.length} {categories.length === 1 ? "category" : "categories"} • {displayedItems.length} saved
          </Text>
        </View>

        <TouchableOpacity
          style={styles.newCatHeaderButton}
          onPress={() => setCreateModalVisible(true)}
          activeOpacity={0.8}
        >
          <Feather name="plus" size={16} color="#AB8BFF" />
          <Text style={styles.newCatHeaderText}>New</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* CATEGORY PILLS BAR */}
        {categories.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pillsScroll}
          >
            {/* ALL PILL */}
            <TouchableOpacity
              style={[
                styles.categoryPill,
                activeCategoryId === "ALL" && styles.categoryPillActive,
              ]}
              onPress={() => setActiveCategoryId("ALL")}
              activeOpacity={0.8}
            >
              <Text style={styles.categoryPillEmoji}>🌟</Text>
              <Text
                style={[
                  styles.categoryPillText,
                  activeCategoryId === "ALL" && styles.categoryPillTextActive,
                ]}
              >
                All Titles
              </Text>
            </TouchableOpacity>

            {/* CUSTOM CATEGORY PILLS */}
            {categories.map((cat) => {
              const isSelected = activeCategoryId === cat.id;
              const count = savedItems.filter((item) => item.categoryId === cat.id).length;

              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryPill,
                    isSelected && styles.categoryPillActive,
                  ]}
                  onPress={() => setActiveCategoryId(cat.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.categoryPillEmoji}>{cat.icon}</Text>
                  <Text
                    style={[
                      styles.categoryPillText,
                      isSelected && styles.categoryPillTextActive,
                    ]}
                  >
                    {cat.name} ({count})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        ) : null}

        {/* ACTIVE CATEGORY HEADER & MANAGEMENT OPTIONS */}
        {activeCategory && (
          <View style={styles.categoryManageBar}>
            <View style={styles.categoryManageLeft}>
              <View
                style={[
                  styles.categoryIconBadge,
                  { backgroundColor: `${activeCategory.color}22` },
                ]}
              >
                <Text style={styles.categoryIconBadgeText}>
                  {activeCategory.icon}
                </Text>
              </View>
              <View>
                <Text style={styles.categoryManageTitle}>
                  {activeCategory.name}
                </Text>
                <Text style={styles.categoryManageMeta}>
                  {displayedItems.length} {displayedItems.length === 1 ? "title" : "titles"}
                </Text>
              </View>
            </View>

            <View style={styles.categoryManageActions}>
              <TouchableOpacity
                style={styles.manageIconBtn}
                onPress={() => {
                  setTargetCategory(activeCategory);
                  setRenameText(activeCategory.name);
                  setRenameError("");
                  setRenameModalVisible(true);
                }}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Feather name="edit-2" size={15} color="#A8B5DB" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.manageIconBtn, styles.deleteIconBtn]}
                onPress={() => handleDeleteCategory(activeCategory)}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="trash-outline" size={16} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* SAVED ITEMS GRID OR EMPTY STATES */}
        {displayedItems.length > 0 ? (
          <View style={styles.itemsGrid}>
            {displayedItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.card}
                activeOpacity={0.85}
                onPress={() => handleOpenDetail(item)}
              >
                {/* POSTER IMAGE */}
                <View style={styles.posterWrapper}>
                  {item.posterUrl ? (
                    <Image
                      source={{ uri: item.posterUrl }}
                      style={styles.posterImage}
                      contentFit="cover"
                      transition={200}
                    />
                  ) : (
                    <View style={styles.posterPlaceholder}>
                      <Ionicons name="film-outline" size={32} color="#6C63FF" />
                    </View>
                  )}

                  {/* TYPE BADGE */}
                  <View
                    style={[
                      styles.typeBadge,
                      item.contentType === "anime"
                        ? styles.typeBadgeAnime
                        : item.contentType === "series"
                        ? styles.typeBadgeSeries
                        : styles.typeBadgeMovie,
                    ]}
                  >
                    <Text style={styles.typeBadgeText}>
                      {item.contentType.toUpperCase()}
                    </Text>
                  </View>

                  {/* QUICK REMOVE BUTTON */}
                  <TouchableOpacity
                    style={styles.cardRemoveBtn}
                    onPress={() => handleRemoveItem(item)}
                    activeOpacity={0.75}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Ionicons name="close" size={13} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                {/* INFO */}
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {item.title}
                </Text>

                <View style={styles.cardMetaRow}>
                  {item.rating ? (
                    <Text style={styles.cardRating}>★ {item.rating}</Text>
                  ) : null}
                  {item.year ? (
                    <Text style={styles.cardYear}>{item.year}</Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          /* EMPTY STATE */
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <MaterialCommunityIcons
                name="bookmark-multiple-outline"
                size={44}
                color="#AB8BFF"
              />
            </View>
            <Text style={styles.emptyTitle}>
              {categories.length === 0
                ? "No Categories Created"
                : "No Titles in this Category"}
            </Text>
            <Text style={styles.emptySubtitle}>
              {categories.length === 0
                ? "Create custom categories to organize anime, movies, and series your way."
                : `Start saving titles to "${activeCategory?.name || "your categories"}" from any detail page.`}
            </Text>

            {categories.length === 0 ? (
              <TouchableOpacity
                style={styles.createFirstBtn}
                onPress={() => setCreateModalVisible(true)}
                activeOpacity={0.85}
              >
                <Feather name="plus" size={16} color="#FFFFFF" />
                <Text style={styles.createFirstBtnText}>
                  Create First Category
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        )}
      </ScrollView>

      {/* CREATE CATEGORY BOTTOM SHEET */}
      <CreateCategorySheet
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onSuccess={(newCategory) => {
          setCreateModalVisible(false);
          setActiveCategoryId(newCategory.id);
        }}
      />

      {/* RENAME CATEGORY MODAL */}
      <Modal
        visible={renameModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRenameModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setRenameModalVisible(false)}
          />

          <View style={styles.modalBox}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalHeading}>Rename Category</Text>
              <TouchableOpacity
                onPress={() => setRenameModalVisible(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={20} color="#8A8A9E" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>New Name</Text>
            <TextInput
              style={[
                styles.modalInput,
                renameError ? styles.modalInputError : null,
              ]}
              value={renameText}
              onChangeText={(text) => {
                setRenameText(text);
                if (renameError) setRenameError("");
              }}
              autoFocus
              maxLength={35}
            />
            {renameError ? (
              <Text style={styles.modalErrorText}>{renameError}</Text>
            ) : null}

            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setRenameModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={handleRenameSubmit}
                activeOpacity={0.85}
              >
                <Text style={styles.modalSubmitBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
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
    height: 260,
  },

  /* HEADER */
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? 44 : 54,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#1B192A",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  headerTitleCol: {
    flex: 1,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    color: "#8A8A9E",
    fontSize: 12,
    marginTop: 2,
  },
  newCatHeaderButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(171, 139, 255, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 4,
  },
  newCatHeaderText: {
    color: "#AB8BFF",
    fontSize: 12,
    fontWeight: "700",
  },

  /* SCROLL CONTENT */
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },

  /* CATEGORY PILLS */
  pillsScroll: {
    gap: 8,
    paddingBottom: 16,
  },
  categoryPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#161524",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  categoryPillActive: {
    backgroundColor: "#292444",
    borderColor: "#AB8BFF",
  },
  categoryPillEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  categoryPillText: {
    color: "#8A8A9E",
    fontSize: 13,
    fontWeight: "600",
  },
  categoryPillTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  /* CATEGORY MANAGE BAR */
  categoryManageBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#161524",
    padding: 12,
    borderRadius: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  categoryManageLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  categoryIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  categoryIconBadgeText: {
    fontSize: 18,
  },
  categoryManageTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  categoryManageMeta: {
    color: "#8A8A9E",
    fontSize: 11,
    marginTop: 1,
  },
  categoryManageActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  manageIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#222035",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteIconBtn: {
    backgroundColor: "rgba(239, 68, 68, 0.12)",
  },

  /* ITEMS GRID */
  itemsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: "#161524",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    paddingBottom: 10,
  },
  posterWrapper: {
    width: "100%",
    height: CARD_WIDTH * 1.45,
    position: "relative",
    backgroundColor: "#201F33",
  },
  posterImage: {
    width: "100%",
    height: "100%",
  },
  posterPlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  typeBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: "rgba(0,0,0,0.65)",
  },
  typeBadgeAnime: {
    backgroundColor: "rgba(171, 139, 255, 0.85)",
  },
  typeBadgeMovie: {
    backgroundColor: "rgba(127, 224, 212, 0.85)",
  },
  typeBadgeSeries: {
    backgroundColor: "rgba(232, 169, 209, 0.85)",
  },
  typeBadgeText: {
    color: "#000000",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  cardRemoveBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 8,
    paddingHorizontal: 8,
    lineHeight: 17,
  },
  cardMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 8,
    marginTop: 4,
  },
  cardRating: {
    color: "#FFA26B",
    fontSize: 11,
    fontWeight: "700",
  },
  cardYear: {
    color: "#6B6A7E",
    fontSize: 11,
  },

  /* EMPTY STATES */
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(171, 139, 255, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    color: "#8A8A9E",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  createFirstBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#7B6FCD",
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 14,
    gap: 8,
  },
  createFirstBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  /* MODAL */
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 20,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalBox: {
    width: "100%",
    backgroundColor: "#161524",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  modalHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalHeading: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  modalLabel: {
    color: "#A8B5DB",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 6,
    marginTop: 10,
  },
  modalInput: {
    backgroundColor: "#1F1D32",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#FFFFFF",
    fontSize: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  modalInputError: {
    borderColor: "#EF4444",
  },
  modalErrorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 6,
    fontWeight: "600",
  },
  emojiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  emojiPill: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#1F1D32",
    justifyContent: "center",
    alignItems: "center",
  },
  emojiPillSelected: {
    backgroundColor: "#292444",
    borderWidth: 1.5,
    borderColor: "#AB8BFF",
  },
  emojiText: {
    fontSize: 18,
  },
  colorRow: {
    flexDirection: "row",
    gap: 10,
    paddingVertical: 4,
  },
  colorCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  colorCircleSelected: {
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  modalActionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#222035",
    alignItems: "center",
  },
  modalCancelBtnText: {
    color: "#A8B5DB",
    fontSize: 13,
    fontWeight: "700",
  },
  modalSubmitBtn: {
    flex: 1.4,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#7B6FCD",
    alignItems: "center",
  },
  modalSubmitBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
});

