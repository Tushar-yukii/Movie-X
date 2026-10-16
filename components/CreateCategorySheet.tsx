import { Feather, Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CategoryColorPicker, {
  CATEGORY_COLOR_OPTIONS,
} from "@/components/CategoryColorPicker";
import CategoryIconPicker, {
  CATEGORY_ICON_OPTIONS,
} from "@/components/CategoryIconPicker";
import {
  Category,
  createCategory,
  getCategories,
} from "@/services/categoryStorage";

export interface CreateCategorySheetProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (newCategory: Category) => void;
}

export default function CreateCategorySheet({
  visible,
  onClose,
  onSuccess,
}: CreateCategorySheetProps) {
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);

  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("📁");
  const [color, setColor] = useState("#AAA4FF");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Reset form when sheet opens
  useEffect(() => {
    if (visible) {
      setName("");
      setEmoji(CATEGORY_ICON_OPTIONS[0].emoji);
      setColor(CATEGORY_COLOR_OPTIONS[0].hex);
      setError(null);
      setLoading(false);
      // Short delay for smooth modal animation before focusing input
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  // Real-time duplicate check
  const duplicateName = useMemo(() => {
    const trimmed = name.trim().toLowerCase();
    if (!trimmed) return false;
    const currentCategories = getCategories();
    return currentCategories.some(
      (c) => c.name.trim().toLowerCase() === trimmed
    );
  }, [name]);

  const validateInput = (): boolean => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please enter a category name");
      return false;
    }
    if (duplicateName) {
      setError(`A category named "${trimmed}" already exists`);
      return false;
    }
    setError(null);
    return true;
  };

  const handleCreate = async () => {
    if (!validateInput()) return;
    try {
      setLoading(true);
      setError(null);
      const res = await createCategory(name, emoji, color);
      if (!res.success || !res.category) {
        setError(res.error || "Failed to create category");
        setLoading(false);
        return;
      }
      setLoading(false);
      onSuccess(res.category);
    } catch (err) {
      console.warn("Failed to create category:", err);
      setError("An unexpected error occurred while saving");
      setLoading(false);
    }
  };

  const isFormValid = name.trim().length > 0 && !duplicateName;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View
          style={[
            styles.sheet,
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
            <View style={styles.dragHandle} />
          </View>

          {/* HEADER */}
          <View style={styles.header}>
            <View style={styles.headerTextGroup}>
              <Text style={styles.title}>New Category</Text>
              <Text style={styles.subtitle}>Personalize your collection</Text>
            </View>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={18} color="#C4C4CB" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* LIVE PREVIEW BADGE */}
            <View style={styles.previewContainer}>
              <Text style={styles.previewCaption}>PREVIEW</Text>
              <View
                style={[
                  styles.previewCard,
                  { borderColor: `${color}44`, backgroundColor: "#121120" },
                ]}
              >
                <View
                  style={[
                    styles.previewIconBox,
                    { backgroundColor: `${color}25` },
                  ]}
                >
                  <Text style={styles.previewEmoji}>{emoji}</Text>
                </View>
                <View style={styles.previewTextGroup}>
                  <Text style={styles.previewName} numberOfLines={1}>
                    {name.trim() || "Category Name"}
                  </Text>
                  <Text style={[styles.previewMeta, { color }]}>
                    Active AnimeX Collection
                  </Text>
                </View>
                <View
                  style={[styles.previewPill, { backgroundColor: `${color}33` }]}
                >
                  <Text style={[styles.previewPillText, { color }]}>0 titles</Text>
                </View>
              </View>
            </View>

            {/* CATEGORY NAME INPUT */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionLabel}>Category Name</Text>
                <Text style={styles.charCount}>{name.length}/35</Text>
              </View>

              <View
                style={[
                  styles.inputBox,
                  isFocused && { borderColor: color },
                  (error || duplicateName) && styles.inputBoxError,
                ]}
              >
                <TextInput
                  ref={inputRef}
                  style={styles.textInput}
                  placeholder="e.g. Watching, Plan to Watch, Favorites"
                  placeholderTextColor="#6B6A7E"
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    if (error) setError(null);
                  }}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => {
                    setIsFocused(false);
                    validateInput();
                  }}
                  maxLength={35}
                  returnKeyType="done"
                  onSubmitEditing={handleCreate}
                />
                {name.length > 0 ? (
                  <TouchableOpacity
                    onPress={() => {
                      setName("");
                      setError(null);
                    }}
                    style={styles.clearBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="close-circle" size={16} color="#8E8D9F" />
                  </TouchableOpacity>
                ) : null}
              </View>

              {error ? (
                <View style={styles.errorRow}>
                  <Feather name="alert-circle" size={13} color="#F87171" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : duplicateName ? (
                <View style={styles.errorRow}>
                  <Feather name="alert-circle" size={13} color="#F87171" />
                  <Text style={styles.errorText}>
                    A category with this name already exists
                  </Text>
                </View>
              ) : null}
            </View>

            {/* SELECT ICON */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Select Icon</Text>
              <CategoryIconPicker
                selectedEmoji={emoji}
                onSelectEmoji={(em) => setEmoji(em)}
                accentColor={color}
              />
            </View>

            {/* THEME COLOR */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Theme Color</Text>
              <CategoryColorPicker
                selectedColor={color}
                onSelectColor={(c) => setColor(c)}
              />
            </View>
          </ScrollView>

          {/* FOOTER ACTIONS */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              activeOpacity={0.7}
              disabled={loading}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.createButton,
                { backgroundColor: color },
                (!isFormValid || loading) && styles.createButtonDisabled,
              ]}
              onPress={handleCreate}
              activeOpacity={0.85}
              disabled={!isFormValid || loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#0D0D1A" />
              ) : (
                <Text style={styles.createText}>Create Category</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.72)",
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    backgroundColor: "#171625",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
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
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  headerTextGroup: {
    flex: 1,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  subtitle: {
    color: "#8E8D9F",
    fontSize: 13,
    marginTop: 2,
    fontWeight: "500",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.04)",
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
    gap: 16,
  },
  previewContainer: {
    marginBottom: 2,
  },
  previewCaption: {
    fontSize: 10,
    fontWeight: "700",
    color: "#6B6A7E",
    letterSpacing: 1,
    marginBottom: 6,
  },
  previewCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  previewIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  previewEmoji: {
    fontSize: 20,
  },
  previewTextGroup: {
    flex: 1,
  },
  previewName: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  previewMeta: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  previewPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  previewPillText: {
    fontSize: 11,
    fontWeight: "700",
  },
  section: {
    gap: 8,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionLabel: {
    color: "#C4C4CB",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  charCount: {
    color: "#6B6A7E",
    fontSize: 11,
    fontWeight: "600",
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#100E1C",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 14,
    height: 48,
  },
  inputBoxError: {
    borderColor: "#F87171",
  },
  textInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 4,
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  errorText: {
    color: "#F87171",
    fontSize: 12,
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.05)",
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#222035",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  cancelText: {
    color: "#C4C4CB",
    fontSize: 14,
    fontWeight: "700",
  },
  createButton: {
    flex: 1.6,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#AAA4FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  createButtonDisabled: {
    opacity: 0.45,
    shadowOpacity: 0,
    elevation: 0,
  },
  createText: {
    color: "#0D0D1A",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
});

