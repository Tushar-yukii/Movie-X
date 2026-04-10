import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { HeroSlide } from "@/services/useHeroAnime";

const { width, height } = Dimensions.get("window");
const SLIDE_INTERVAL = 5000;

type Props = {
  slides: HeroSlide[];
};

const HeroSlider = ({ slides }: Props) => {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // No directionRef needed anymore — simple loop always forward
  // nextIndexRef tracks position without causing re-render
  const nextIndexRef = useRef<number>(0);

  const stopAutoSlide = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const startAutoSlide = useCallback(() => {
    stopAutoSlide();

    intervalRef.current = setInterval(() => {
      const prev = nextIndexRef.current;

      // Simple modulo loop — always goes forward
      // When prev = 14 (last), (14+1) % 15 = 0 → jumps to first
      // When prev = 0, (0+1) % 15 = 1 → goes to second
      // Always left to right, loops back to start when done
      const next = (prev + 1) % slides.length;

      nextIndexRef.current = next;

      // When jumping from last → first, scroll without animation
      // This makes it feel like a seamless loop not a sudden jump
      if (prev === slides.length - 1) {
        // Last slide → first slide: instant jump, no animation
        flatListRef.current?.scrollToOffset({
          offset: 0,
          animated: false, // no animation on loop back — feels seamless
        });
      } else {
        // Normal forward scroll — smooth animation
        flatListRef.current?.scrollToOffset({
          offset: width * next,
          animated: true,
        });
      }
    }, SLIDE_INTERVAL);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length === 0) return;
    startAutoSlide();
    return () => stopAutoSlide();
  }, [startAutoSlide, stopAutoSlide]);

  // Only updates dot/title after scroll fully stops
  const onMomentumScrollEnd = useCallback((event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    nextIndexRef.current = index;
    setActiveIndex(index);
  }, []);

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
      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        decelerationRate="fast"
        snapToInterval={width}
        snapToAlignment="start"
        disableIntervalMomentum={true}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderSlide}
        onMomentumScrollEnd={onMomentumScrollEnd}
        scrollEventThrottle={16}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        onScrollBeginDrag={stopAutoSlide}
        onScrollEndDrag={startAutoSlide}
      />
      {/* error */}
      <View style={styles.infoOverlay}>
        <Text style={styles.title} numberOfLines={2}>
          {currentSlide.title}
        </Text>
        <Text style={styles.meta}>
          {currentSlide.year}
          {currentSlide.year ? "  |  " : ""}
          Anime
        </Text>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.sideAction}>
            <Text style={styles.sideIcon}>＋</Text>
            <Text style={styles.sideLabel}>Save</Text>
          </TouchableOpacity>

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
            <Text style={styles.watchText}>▶ Watch Now</Text>
          </TouchableOpacity>

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
    marginBottom: 16,
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
