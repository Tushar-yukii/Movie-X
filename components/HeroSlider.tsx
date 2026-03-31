// components/HeroSlider.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  ViewToken,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { HeroSlide } from "@/services/useHeroAnime";

const { width, height } = Dimensions.get("window");
const SLIDE_INTERVAL = 4000; // 4 seconds

type Props = {
  slides: HeroSlide[];
};

const GENRE_MAP: Record<number, string> = {
  16: "Animation",
  28: "Action",
  12: "Adventure",
  35: "Comedy",
  18: "Drama",
  14: "Fantasy",
  27: "Horror",
  10765: "Sci-Fi",
};

const HeroSlider = ({ slides }: Props) => {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-slide every 4 seconds
  useEffect(() => {
    if (slides.length === 0) return;

    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % slides.length;
        flatListRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, SLIDE_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [slides.length]);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setActiveIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  if (slides.length === 0) return null;

  const currentSlide = slides[activeIndex];

  const renderSlide = ({ item }: { item: HeroSlide }) => (
    <View style={styles.slide}>
      <Image
        source={{ uri: item.backdrop_url ?? item.poster_url ?? "" }}
        style={styles.backdropImage}
        contentFit="cover"
      />
      <LinearGradient
        colors={["transparent", "rgba(13,13,26,0.7)", "#0D0D1A"]}
        style={styles.gradient}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Sliding images */}
      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderSlide}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        scrollEventThrottle={16}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />

      {/* Title + Meta overlaid on top of slider */}
      <View style={styles.infoOverlay}>
        <Text style={styles.title} numberOfLines={2}>
          {currentSlide.title}
        </Text>
        <Text style={styles.meta}>
          {currentSlide.year}
          {currentSlide.year ? "  |  " : ""}
          Anime
        </Text>

        {/* Dot indicators */}
        <View style={styles.dotsRow}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === activeIndex && styles.dotActive]}
            />
          ))}
        </View>

        {/* Action buttons */}
        <View style={styles.actionsRow}>
          {/* Save */}
          <TouchableOpacity style={styles.sideAction}>
            <Text style={styles.sideIcon}>＋</Text>
            <Text style={styles.sideLabel}>Save</Text>
          </TouchableOpacity>

          {/* Watch Now */}
          <TouchableOpacity
            style={styles.watchBtn}
            activeOpacity={0.85}
            onPress={() =>
              router.push({
                pathname: "/movies/[id]",
                params: { id: currentSlide.id.toString() },
              })
            }
          >
            <Text style={styles.watchText}>▶  Watch Now</Text>
          </TouchableOpacity>

          {/* Info */}
          <TouchableOpacity
            style={styles.sideAction}
            onPress={() =>
              router.push({
                pathname: "/movies/[id]",
                params: { id: currentSlide.id.toString() },
              })
            }
          >
            <Text style={styles.sideIcon}>ⓘ</Text>
            <Text style={styles.sideLabel}>Info</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default HeroSlider;

const styles = StyleSheet.create({
  container: {
    width: width,
    height: height * 0.58,
  },
  slide: {
    width: width,
    height: height * 0.58,
  },
  backdropImage: {
    width: "100%",
    height: "100%",
  },
  gradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "60%",
  },
  infoOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 16,
    alignItems: "center",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 6,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  meta: {
    color: "#B0B0C0",
    fontSize: 13,
    textAlign: "center",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  dotsRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 14,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#5A5A7A",
  },
  dotActive: {
    width: 20,
    backgroundColor: "#6C63FF",
    borderRadius: 3,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    width: "100%",
  },
  watchBtn: {
    backgroundColor: "#6C63FF",
    paddingVertical: 13,
    paddingHorizontal: 36,
    borderRadius: 30,
    flex: 1,
    alignItems: "center",
  },
  watchText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
  sideAction: {
    alignItems: "center",
    width: 50,
  },
  sideIcon: {
    color: "#FFFFFF",
    fontSize: 22,
  },
  sideLabel: {
    color: "#A0A0B0",
    fontSize: 11,
    marginTop: 2,
  },
});