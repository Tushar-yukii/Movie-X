import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CategoryCard from "@/components/CategoryCard";
import CreateCategorySheet from "@/components/CreateCategorySheet";
import {
  Category,
  ContentType,
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

export default function AddToCategoryModal({
  visible,
  onClose,
  content,
  onSuccess,
}: AddToCategoryModalProps) {
  const insets = useSafeAreaInsets();
  const { categories } = useCategories();

  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Dedicated Create Category Sheet state
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);

  // Sync selected categories whenever modal opens or content changes
  useEffect(() => {
    if (visible && content?.id) {
      const currentIds = getItemCategoryIds(content.type, content.id);
      setSelectedIds(currentIds);
      setIsCreateSheetOpen(false);
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

  // Called when a new category is created in CreateCategorySheet
  const handleCreateCategorySuccess = (newCategory: Category) => {
    // Close the create sheet
    setIsCreateSheetOpen(false);
    // Auto-select the newly created category so user can immediately save to it
    setSelectedIds((prev) =>
      prev.includes(newCategory.id) ? prev : [...prev, newCategory.id]
    );
  };

  const contentTypeLabel =
    content?.type === "anime"
      ? "ANIME"
      : content?.type === "series"
      ? "SERIES"
      : "MOVIE";

  return (
    <>
      {/* 1. MAIN ADD TO CATEGORY BOTTOM SHEET */}
      <Modal
        visible={visible && !isCreateSheetOpen}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={onClose}
          />

          <View
            style={[
              styles.sheetContainer,
              {
                paddingBottom: Math.max(
                  insets.bottom,
                  Platform.OS === "android" ? 18 : 28
                ),
              },
            ]}
          >
            {/* DRAG HANDLE */}
            <View style={styles.handleContainer}>
              <View style={styles.sheetHandle} />
            </View>

            {/* HEADER */}
            <View style={styles.headerRow}>
              <View style={styles.headerTitleCol}>
                <View style={styles.titleBadgeRow}>
                  <Text style={styles.modalTitle}>Add to Category</Text>
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeBadgeText}>{contentTypeLabel}</Text>
                  </View>
                </View>
                <Text style={styles.modalSubtitle} numberOfLines={1}>
                  {content?.title || "Organize content"}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.closeCircle}
                onPress={onClose}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
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
                      <CategoryCard
                        key={cat.id}
                        category={cat}
                        isSelected={isSelected}
                        itemCount={itemCount}
                        onPress={() => toggleCategory(cat.id)}
                      />
                    );
                  })}

                  {/* PROMINENT CREATE NEW CATEGORY ROW */}
                  <TouchableOpacity
                    style={styles.createButtonInline}
                    onPress={() => setIsCreateSheetOpen(true)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.createIconCircle}>
                      <Feather name="plus" size={16} color="#AAA4FF" />
                    </View>
                    <View style={styles.createInlineTextCol}>
                      <Text style={styles.createButtonInlineText}>
                        Create New Category
                      </Text>
                      <Text style={styles.createButtonInlineSub}>
                        Add a new custom collection
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color="#AAA4FF"
                    />
                  </TouchableOpacity>
                </ScrollView>
              </View>
            ) : (
              /* EMPTY STATE: "NO CATEGORIES YET" */
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}>
                  <MaterialCommunityIcons
                    name="folder-plus-outline"
                    size={40}
                    color="#AAA4FF"
                  />
                </View>
                <Text style={styles.emptyTitle}>No Categories Yet</Text>
                <Text style={styles.emptySubtitle}>
                  Create your first category to organize your favorite anime,
                  movies, and web series into custom lists.
                </Text>

                {/* PROMINENT "CREATE NEW CATEGORY" CARD */}
                <TouchableOpacity
                  style={styles.emptyCreateCard}
                  onPress={() => setIsCreateSheetOpen(true)}
                  activeOpacity={0.85}
                >
                  <View style={styles.emptyCardIconCircle}>
                    <Feather name="plus" size={18} color="#AAA4FF" />
                  </View>
                  <View style={styles.emptyCardTextCol}>
                    <Text style={styles.emptyCardTitle}>
                      Create New Category
                    </Text>
                    <Text style={styles.emptyCardSub}>
                      Tap to customize your first collection
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color="#AAA4FF"
                  />
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
                  <ActivityIndicator size="small" color="#0D0D1A" />
                ) : (
                  <Text style={styles.doneButtonText}>Done</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 2. DEDICATED CREATE CATEGORY BOTTOM SHEET */}
      <CreateCategorySheet
        visible={isCreateSheetOpen}
        onClose={() => setIsCreateSheetOpen(false)}
        onSuccess={handleCreateCategorySuccess}
      />
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.72)",
  },
  modalBackdrop: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: "#171625",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    maxHeight: "88%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 20,
  },
  handleContainer: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 6,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },

  /* HEADER */
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 4,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  headerTitleCol: {
    flex: 1,
    paddingRight: 10,
  },
  titleBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  modalTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  typeBadge: {
    backgroundColor: "rgba(170, 164, 255, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(170, 164, 255, 0.3)",
  },
  typeBadgeText: {
    color: "#AAA4FF",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  modalSubtitle: {
    color: "#8E8D9F",
    fontSize: 13,
    marginTop: 3,
    fontWeight: "500",
  },
  closeCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.04)",
  },

  /* LIST */
  listWrapper: {
    maxHeight: 340,
    paddingTop: 8,
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingVertical: 4,
    gap: 10,
  },

  /* INLINE CREATE BUTTON */
  createButtonInline: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "rgba(170, 164, 255, 0.35)",
    borderStyle: "dashed",
    backgroundColor: "rgba(170, 164, 255, 0.05)",
    marginTop: 4,
    marginBottom: 6,
  },
  createIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "rgba(170, 164, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  createInlineTextCol: {
    flex: 1,
  },
  createButtonInlineText: {
    color: "#AAA4FF",
    fontSize: 14,
    fontWeight: "700",
  },
  createButtonInlineSub: {
    color: "#8E8D9F",
    fontSize: 11,
    fontWeight: "500",
    marginTop: 1,
  },

  /* EMPTY STATE */
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(170, 164, 255, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(170, 164, 255, 0.2)",
  },
  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "800",
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  emptySubtitle: {
    color: "#8E8D9F",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 16,
    fontWeight: "500",
  },
  emptyCreateCard: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(170, 164, 255, 0.08)",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "rgba(170, 164, 255, 0.35)",
    borderStyle: "dashed",
    gap: 12,
  },
  emptyCardIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(170, 164, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyCardTextCol: {
    flex: 1,
  },
  emptyCardTitle: {
    color: "#AAA4FF",
    fontSize: 15,
    fontWeight: "700",
  },
  emptyCardSub: {
    color: "#8E8D9F",
    fontSize: 12,
    fontWeight: "500",
    marginTop: 1,
  },

  /* FOOTER */
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingTop: 14,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.05)",
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#222035",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  cancelButtonText: {
    color: "#C4C4CB",
    fontSize: 14,
    fontWeight: "700",
  },
  doneButton: {
    flex: 1.6,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#AAA4FF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#AAA4FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  doneButtonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  doneButtonText: {
    color: "#0D0D1A",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
});
