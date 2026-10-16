import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  Category,
  ContentType,
  createCategory,
  getItemCategoryIds,
  getSavedItemsByCategory,
  setItemCategories,
  useCategories,
} from "@/services/categoryStorage";

export interface AddToCategoryModalProps {
  visible: boolean;
  onClose: () => void;
  content: {
    id: string | number;
    type: ContentType;
    title: string;
    posterUrl: string | null;
    overview?: string;
    rating?: string | number | null;
    year?: string | null;
  };
  onSuccess?: (savedCount: number) => void;
}

const EMOJI_OPTIONS = [
  "📁",
  "🎬",
  "🍿",
  "📺",
  "⭐",
  "💖",
  "🔥",
  "🎯",
  "⚡",
  "📖",
  "🌸",
  "🏆",
];

const COLOR_OPTIONS = [
  "#AB8BFF", // Lavender
  "#7FE0D4", // Mint / Cyan
  "#FFA26B", // Peach / Orange
  "#E8A9D1", // Soft Pink
  "#7B6FCD", // Deep Purple
  "#FBBF24", // Gold
];

export default function AddToCategoryModal({
  visible,
  onClose,
  content,
  onSuccess,
}: AddToCategoryModalProps) {
  const { categories } = useCategories();

  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Create Category Sub-Modal State
  const [isCreating, setIsCreating] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatEmoji, setNewCatEmoji] = useState("📁");
  const [newCatColor, setNewCatColor] = useState("#AB8BFF");
  const [createError, setCreateError] = useState("");

  // Sync selected categories whenever modal opens or content changes
  useEffect(() => {
    if (visible && content?.id) {
      const currentIds = getItemCategoryIds(content.type, content.id);
      setSelectedIds(currentIds);
      setIsCreating(false);
      setCreateError("");
      setNewCatName("");
      setNewCatEmoji("📁");
      setNewCatColor("#AB8BFF");
    }
  }, [visible, content?.id, content?.type]);

  const toggleCategory = useCallback((categoryId: string) => {
    setSelectedIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  }, []);

  const handleDone = async () => {
    if (!content?.id) return;
    try {
      setSaving(true);
      await setItemCategories(
        {
          contentId: content.id,
          contentType: content.type,
          title: content.title,
          posterUrl: content.posterUrl,
          overview: content.overview,
          rating: content.rating,
          year: content.year,
        },
        selectedIds
      );
      setSaving(false);
      onClose();
      if (onSuccess) {
        onSuccess(selectedIds.length);
      }
    } catch (err) {
      console.warn("Failed to save categories:", err);
      setSaving(false);
    }
  };

  const handleCreateCategorySubmit = async () => {
    setCreateError("");
    const res = await createCategory(newCatName, newCatEmoji, newCatColor);
    if (!res.success) {
      setCreateError(res.error || "Failed to create category");
      return;
    }

    // Success: return to selection view, newly created category is in the list
    setIsCreating(false);
    setNewCatName("");
    setCreateError("");
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.sheetContainer}>
          {/* DRAG HANDLE */}
          <View style={styles.sheetHandle} />

          {/* MAIN MODAL VIEW */}
          {!isCreating ? (
            <>
              {/* HEADER */}
              <View style={styles.headerRow}>
                <View style={styles.headerTitleCol}>
                  <Text style={styles.modalTitle}>Add to Category</Text>
                  <Text style={styles.modalSubtitle} numberOfLines={1}>
                    {content?.title || "Organize content"}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.closeCircle}
                  onPress={onClose}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close" size={18} color="#C4C4CB" />
                </TouchableOpacity>
              </View>

              {/* CATEGORIES LIST OR EMPTY STATE */}
              {categories.length > 0 ? (
                <View style={styles.listWrapper}>
                  <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                  >
                    {categories.map((cat) => {
                      const isSelected = selectedIds.includes(cat.id);
                      const itemCount = getSavedItemsByCategory(cat.id).length;

                      return (
                        <TouchableOpacity
                          key={cat.id}
                          style={[
                            styles.categoryRow,
                            isSelected && styles.categoryRowSelected,
                          ]}
                          onPress={() => toggleCategory(cat.id)}
                          activeOpacity={0.75}
                        >
                          <View
                            style={[
                              styles.categoryIconBox,
                              { backgroundColor: `${cat.color}22` },
                            ]}
                          >
                            <Text style={styles.categoryEmoji}>{cat.icon}</Text>
                          </View>

                          <View style={styles.categoryInfo}>
                            <Text style={styles.categoryName} numberOfLines={1}>
                              {cat.name}
                            </Text>
                            <Text style={styles.categoryItemCount}>
                              {itemCount} {itemCount === 1 ? "item" : "items"}
                            </Text>
                          </View>

                          {/* SELECTION CHECKBOX */}
                          <View
                            style={[
                              styles.checkbox,
                              isSelected && styles.checkboxActive,
                            ]}
                          >
                            {isSelected && (
                              <Ionicons
                                name="checkmark"
                                size={15}
                                color="#FFFFFF"
                              />
                            )}
                          </View>
                        </TouchableOpacity>
                      );
                    })}

                    {/* NEW CATEGORY QUICK BUTTON */}
                    <TouchableOpacity
                      style={styles.createButtonInline}
                      onPress={() => {
                        setIsCreating(true);
                        setCreateError("");
                      }}
                      activeOpacity={0.8}
                    >
                      <View style={styles.createIconCircle}>
                        <Feather name="plus" size={16} color="#AB8BFF" />
                      </View>
                      <Text style={styles.createButtonInlineText}>
                        Create New Category
                      </Text>
                    </TouchableOpacity>
                  </ScrollView>
                </View>
              ) : (
                /* EMPTY STATE */
                <View style={styles.emptyContainer}>
                  <View style={styles.emptyIconCircle}>
                    <MaterialCommunityIcons
                      name="folder-plus-outline"
                      size={36}
                      color="#AB8BFF"
                    />
                  </View>
                  <Text style={styles.emptyTitle}>No Categories Yet</Text>
                  <Text style={styles.emptySubtitle}>
                    Create your first category to organize your favorite anime,
                    movies, and web series into custom lists.
                  </Text>
                  <TouchableOpacity
                    style={styles.emptyCreateButton}
                    onPress={() => {
                      setIsCreating(true);
                      setCreateError("");
                    }}
                    activeOpacity={0.85}
                  >
                    <Feather name="plus" size={16} color="#FFFFFF" />
                    <Text style={styles.emptyCreateButtonText}>
                      Create First Category
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* FOOTER ACTIONS */}
              <View style={styles.footerRow}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.doneButton,
                    saving && styles.doneButtonDisabled,
                  ]}
                  onPress={handleDone}
                  disabled={saving}
                  activeOpacity={0.85}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.doneButtonText}>Done</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          ) : (
            /* CREATE CATEGORY VIEW */
            <View style={styles.createViewContainer}>
              <View style={styles.headerRow}>
                <View style={styles.headerTitleCol}>
                  <Text style={styles.modalTitle}>New Category</Text>
                  <Text style={styles.modalSubtitle}>
                    Personalize your category collection
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.closeCircle}
                  onPress={() => setIsCreating(false)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={18} color="#C4C4CB" />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.createScroll}
                showsVerticalScrollIndicator={false}
              >
                {/* NAME INPUT */}
                <Text style={styles.inputLabel}>Category Name</Text>
                <TextInput
                  style={[
                    styles.nameInput,
                    createError ? styles.nameInputError : null,
                  ]}
                  placeholder="e.g. Watching, Plan to Watch, Favorites"
                  placeholderTextColor="#6B6A7E"
                  value={newCatName}
                  onChangeText={(text) => {
                    setNewCatName(text);
                    if (createError) setCreateError("");
                  }}
                  autoFocus
                  maxLength={35}
                />
                {createError ? (
                  <Text style={styles.errorText}>{createError}</Text>
                ) : null}

                {/* EMOJI / ICON SELECTOR */}
                <Text style={styles.inputLabel}>Select Icon</Text>
                <View style={styles.emojiGrid}>
                  {EMOJI_OPTIONS.map((emoji) => {
                    const isSelected = newCatEmoji === emoji;
                    return (
                      <TouchableOpacity
                        key={emoji}
                        style={[
                          styles.emojiPill,
                          isSelected && styles.emojiPillSelected,
                        ]}
                        onPress={() => setNewCatEmoji(emoji)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.emojiText}>{emoji}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* COLOR PALETTE */}
                <Text style={styles.inputLabel}>Theme Color</Text>
                <View style={styles.colorRow}>
                  {COLOR_OPTIONS.map((color) => {
                    const isSelected = newCatColor === color;
                    return (
                      <TouchableOpacity
                        key={color}
                        style={[
                          styles.colorCircle,
                          { backgroundColor: color },
                          isSelected && styles.colorCircleSelected,
                        ]}
                        onPress={() => setNewCatColor(color)}
                        activeOpacity={0.8}
                      >
                        {isSelected && (
                          <Ionicons
                            name="checkmark"
                            size={16}
                            color="#FFFFFF"
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>

              {/* CREATE ACTIONS */}
              <View style={styles.footerRow}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setIsCreating(false)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>Back</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.doneButton}
                  onPress={handleCreateCategorySubmit}
                  activeOpacity={0.85}
                >
                  <Text style={styles.doneButtonText}>Create Category</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.65)",
  },
  modalBackdrop: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: "#161524",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: Platform.OS === "android" ? 24 : 36,
    maxHeight: "85%",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  sheetHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#403E58",
    alignSelf: "center",
    marginBottom: 14,
  },

  /* HEADER */
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  headerTitleCol: {
    flex: 1,
    paddingRight: 10,
  },
  modalTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    color: "#8A8A9E",
    fontSize: 13,
    marginTop: 2,
  },
  closeCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#222035",
    justifyContent: "center",
    alignItems: "center",
  },

  /* LIST */
  listWrapper: {
    maxHeight: 320,
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingVertical: 4,
    gap: 8,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1F1D32",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  categoryRowSelected: {
    backgroundColor: "#292444",
    borderColor: "#AB8BFF",
  },
  categoryIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  categoryEmoji: {
    fontSize: 18,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 2,
  },
  categoryItemCount: {
    color: "#8A8A9E",
    fontSize: 12,
  },

  /* CHECKBOX */
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: "#4A4864",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#161524",
  },
  checkboxActive: {
    backgroundColor: "#AB8BFF",
    borderColor: "#AB8BFF",
  },

  /* INLINE CREATE BUTTON */
  createButtonInline: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "rgba(171, 139, 255, 0.35)",
    borderStyle: "dashed",
    marginTop: 6,
    marginBottom: 8,
  },
  createIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: "rgba(171, 139, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  createButtonInlineText: {
    color: "#AB8BFF",
    fontSize: 14,
    fontWeight: "700",
  },

  /* EMPTY STATE */
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 12,
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "rgba(171, 139, 255, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 6,
  },
  emptySubtitle: {
    color: "#8A8A9E",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  emptyCreateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#7B6FCD",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    gap: 8,
    shadowColor: "#7B6FCD",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyCreateButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  /* FOOTER */
  footerRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
    paddingTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#222035",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    color: "#A8B5DB",
    fontSize: 14,
    fontWeight: "700",
  },
  doneButton: {
    flex: 1.6,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#7B6FCD",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#7B6FCD",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  doneButtonDisabled: {
    opacity: 0.6,
  },
  doneButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  /* CREATE VIEW */
  createViewContainer: {
    paddingBottom: 4,
  },
  createScroll: {
    maxHeight: 340,
  },
  inputLabel: {
    color: "#A8B5DB",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
    marginTop: 12,
  },
  nameInput: {
    backgroundColor: "#1F1D32",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#FFFFFF",
    fontSize: 14,
  },
  nameInputError: {
    borderColor: "#EF4444",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 6,
    fontWeight: "600",
  },
  emojiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 6,
  },
  emojiPill: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#1F1D32",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  emojiPillSelected: {
    backgroundColor: "#292444",
    borderColor: "#AB8BFF",
    borderWidth: 1.5,
  },
  emojiText: {
    fontSize: 20,
  },
  colorRow: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 4,
    marginBottom: 10,
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  colorCircleSelected: {
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
});

