import { useEffect, useState } from "react";
import { Platform } from "react-native";

export type ContentType = "anime" | "movie" | "series";

export interface Category {
  id: string;
  name: string;
  icon: string; // emoji, e.g. "📁", "🍿", "⭐"
  color: string; // hex accent color
  createdAt: number;
}

export interface SavedItem {
  id: string; // unique association ID: `${contentType}_${contentId}_${categoryId}`
  contentId: string;
  contentType: ContentType;
  title: string;
  posterUrl: string | null;
  categoryId: string;
  dateAdded: number;
  overview?: string;
  rating?: string | number | null;
  year?: string | null;
}

export const DEFAULT_SUGGESTED_CATEGORIES = [
  { name: "Watching", icon: "📺", color: "#AB8BFF" },
  { name: "Plan to Watch", icon: "🍿", color: "#7FE0D4" },
  { name: "Completed", icon: "🏆", color: "#FFA26B" },
  { name: "Favorites", icon: "💖", color: "#E8A9D1" },
];

const CATEGORIES_KEY = "@animex_categories_v2";
const SAVED_ITEMS_KEY = "@animex_saved_items_v2";

// In-Memory Reactive Store
let categoriesStore: Category[] = [];
let savedItemsStore: SavedItem[] = [];
let listeners: (() => void)[] = [];
let initialized = false;

const notifyListeners = () => {
  const currentListeners = [...listeners];
  for (const listener of currentListeners) {
    try {
      listener();
    } catch (err) {
      console.warn("Category listener execution error:", err);
    }
  }
};

// Persistence helper for Web and Native
const loadFromStorage = async <T>(key: string): Promise<T | null> => {
  try {
    if (Platform.OS === "web" && typeof window !== "undefined" && window.localStorage) {
      const data = window.localStorage.getItem(key);
      if (data) {
        return JSON.parse(data) as T;
      }
    }
  } catch (err) {
    console.warn(`Could not read ${key} from storage:`, err);
  }
  return null;
};

const saveToStorage = async <T>(key: string, data: T): Promise<void> => {
  try {
    if (Platform.OS === "web" && typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(key, JSON.stringify(data));
    }
  } catch (err) {
    console.warn(`Could not write ${key} to storage:`, err);
  }
};

export const initCategoryStorage = async (): Promise<void> => {
  if (initialized) return;
  initialized = true;

  const storedCategories = await loadFromStorage<Category[]>(CATEGORIES_KEY);
  if (storedCategories && Array.isArray(storedCategories)) {
    categoriesStore = storedCategories;
  }

  const storedSavedItems = await loadFromStorage<SavedItem[]>(SAVED_ITEMS_KEY);
  if (storedSavedItems && Array.isArray(storedSavedItems)) {
    savedItemsStore = storedSavedItems;
  }

  notifyListeners();
};

// CATEGORY GETTERS
export const getCategories = (): Category[] => {
  return [...categoriesStore];
};

export const getSavedItems = (): SavedItem[] => {
  return [...savedItemsStore];
};

export const getSavedItemsByCategory = (categoryId: string): SavedItem[] => {
  if (!categoryId) return [];
  return savedItemsStore.filter((item) => item.categoryId === categoryId);
};

export const getItemCategoryIds = (
  contentType: ContentType,
  contentId?: string | number | null
): string[] => {
  if (contentId == null || contentId === "") return [];
  const cId = contentId.toString();
  return savedItemsStore
    .filter((item) => item.contentType === contentType && item.contentId === cId)
    .map((item) => item.categoryId);
};

export const isItemSaved = (
  contentType: ContentType,
  contentId?: string | number | null
): boolean => {
  if (contentId == null || contentId === "") return false;
  const cId = contentId.toString();
  return savedItemsStore.some(
    (item) => item.contentType === contentType && item.contentId === cId
  );
};

// CATEGORY CREATION & MANAGEMENT
export const createCategory = async (
  name: string,
  icon = "📁",
  color = "#AB8BFF"
): Promise<{ success: boolean; category?: Category; error?: string }> => {
  const trimmed = name.trim();
  if (!trimmed) {
    return { success: false, error: "Category name cannot be empty." };
  }

  // Case-insensitive duplicate check
  const duplicate = categoriesStore.some(
    (c) => c.name.trim().toLowerCase() === trimmed.toLowerCase()
  );
  if (duplicate) {
    return {
      success: false,
      error: `A category named "${trimmed}" already exists.`,
    };
  }

  const newCategory: Category = {
    id: `cat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: trimmed,
    icon: icon.trim() || "📁",
    color: color || "#AB8BFF",
    createdAt: Date.now(),
  };

  categoriesStore.push(newCategory);
  await saveToStorage(CATEGORIES_KEY, categoriesStore);
  notifyListeners();

  return { success: true, category: newCategory };
};

export const renameCategory = async (
  id: string,
  newName: string
): Promise<{ success: boolean; error?: string }> => {
  const trimmed = newName.trim();
  if (!trimmed) {
    return { success: false, error: "Category name cannot be empty." };
  }

  const existingIndex = categoriesStore.findIndex((c) => c.id === id);
  if (existingIndex === -1) {
    return { success: false, error: "Category not found." };
  }

  const duplicate = categoriesStore.some(
    (c) => c.id !== id && c.name.trim().toLowerCase() === trimmed.toLowerCase()
  );
  if (duplicate) {
    return {
      success: false,
      error: `Another category named "${trimmed}" already exists.`,
    };
  }

  categoriesStore[existingIndex] = {
    ...categoriesStore[existingIndex],
    name: trimmed,
  };

  await saveToStorage(CATEGORIES_KEY, categoriesStore);
  notifyListeners();

  return { success: true };
};

export const deleteCategory = async (id: string): Promise<void> => {
  if (!id) return;
  categoriesStore = categoriesStore.filter((c) => c.id !== id);
  // Remove all title associations with this deleted category
  savedItemsStore = savedItemsStore.filter((item) => item.categoryId !== id);

  await saveToStorage(CATEGORIES_KEY, categoriesStore);
  await saveToStorage(SAVED_ITEMS_KEY, savedItemsStore);
  notifyListeners();
};

// SAVE / UPDATE TITLE CATEGORY ASSOCIATIONS
export const setItemCategories = async (
  itemData: {
    contentId: string | number;
    contentType: ContentType;
    title: string;
    posterUrl: string | null;
    overview?: string;
    rating?: string | number | null;
    year?: string | null;
  },
  selectedCategoryIds: string[]
): Promise<void> => {
  if (!itemData || itemData.contentId == null) return;
  const cId = itemData.contentId.toString();
  const cType = itemData.contentType;

  // Remove existing associations for this specific content item
  const otherItems = savedItemsStore.filter(
    (item) => !(item.contentType === cType && item.contentId === cId)
  );

  // Add new associations for each selected category
  const newAssociations: SavedItem[] = selectedCategoryIds.map((catId) => ({
    id: `${cType}_${cId}_${catId}`,
    contentId: cId,
    contentType: cType,
    title: itemData.title,
    posterUrl: itemData.posterUrl,
    categoryId: catId,
    dateAdded: Date.now(),
    overview: itemData.overview,
    rating: itemData.rating,
    year: itemData.year,
  }));

  savedItemsStore = [...otherItems, ...newAssociations];

  await saveToStorage(SAVED_ITEMS_KEY, savedItemsStore);
  notifyListeners();
};

export const removeItemFromCategory = async (
  categoryId: string,
  contentType: ContentType,
  contentId?: string | number | null
): Promise<void> => {
  if (contentId == null) return;
  const cId = contentId.toString();
  savedItemsStore = savedItemsStore.filter(
    (item) =>
      !(
        item.categoryId === categoryId &&
        item.contentType === contentType &&
        item.contentId === cId
      )
  );

  await saveToStorage(SAVED_ITEMS_KEY, savedItemsStore);
  notifyListeners();
};

// REACT HOOKS FOR REAL-TIME UI
export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>(() => getCategories());
  const [loading, setLoading] = useState<boolean>(!initialized);

  useEffect(() => {
    let isMounted = true;

    if (initialized) {
      setCategories(getCategories());
      setLoading(false);
    } else {
      initCategoryStorage().then(() => {
        if (isMounted) {
          setCategories(getCategories());
          setLoading(false);
        }
      });
    }

    const handleChange = () => {
      if (isMounted) {
        setCategories(getCategories());
      }
    };

    listeners.push(handleChange);

    return () => {
      isMounted = false;
      const idx = listeners.indexOf(handleChange);
      if (idx !== -1) listeners.splice(idx, 1);
    };
  }, []);

  return {
    categories,
    loading,
    refresh: () => setCategories(getCategories()),
  };
};

export const useItemCategories = (
  contentType: ContentType,
  contentId?: string | number | null
) => {
  const cId = contentId != null ? contentId.toString() : "";
  const [savedCategoryIds, setSavedCategoryIds] = useState<string[]>(() =>
    cId ? getItemCategoryIds(contentType, cId) : []
  );
  const [isSaved, setIsSaved] = useState<boolean>(() =>
    cId ? isItemSaved(contentType, cId) : false
  );

  useEffect(() => {
    let isMounted = true;

    if (!cId) {
      setSavedCategoryIds([]);
      setIsSaved(false);
      return;
    }

    if (initialized) {
      setSavedCategoryIds(getItemCategoryIds(contentType, cId));
      setIsSaved(isItemSaved(contentType, cId));
    } else {
      initCategoryStorage().then(() => {
        if (isMounted) {
          setSavedCategoryIds(getItemCategoryIds(contentType, cId));
          setIsSaved(isItemSaved(contentType, cId));
        }
      });
    }

    const handleChange = () => {
      if (isMounted) {
        setSavedCategoryIds(getItemCategoryIds(contentType, cId));
        setIsSaved(isItemSaved(contentType, cId));
      }
    };

    listeners.push(handleChange);

    return () => {
      isMounted = false;
      const idx = listeners.indexOf(handleChange);
      if (idx !== -1) listeners.splice(idx, 1);
    };
  }, [contentType, cId]);

  return {
    isSaved,
    savedCategoryIds,
  };
};
