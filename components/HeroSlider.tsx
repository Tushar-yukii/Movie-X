import { HeroSlide } from "@/services/useHeroAnime";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ListRenderItem,
} from "react-native";

const { width, height } = Dimensions.get("window");

const SLIDE_INTERVAL = 5000;
const HERO_HEIGHT = height * 0.62;

type Props = {
  slides: HeroSlide[];
  label?: string;
  type?: "movie" | "tv";
};

const HeroSlider = ({ slides, label = "Series", type = "tv" }: Props) => {
  const router = useRouter();

  const flatListRef = useRef<FlatList<HeroSlide>>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const nextIndexRef = useRef(0);

  const [activeIndex, setActiveIndex] = useState(0);

  // Keep the slide count in a separate variable
  const slideCount = slides.length;

  // Stop automatic sliding
  const stopAutoSlide = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Start automatic sliding
  const startAutoSlide = useCallback(() => {
    // Stop any existing interval first
    stopAutoSlide();

    // Do not start if there are zero or one slides
    if (slideCount <= 1) {
      return;
    }

    intervalRef.current = setInterval(() => {
      const previousIndex = nextIndexRef.current;

      const nextIndex = (previousIndex + 1) % slideCount;

      nextIndexRef.current = nextIndex;

      // Last slide to first slide
      if (previousIndex === slideCount - 1) {
        flatListRef.current?.scrollToOffset({
          offset: 0,
          animated: false,
        });

        setActiveIndex(0);

        return;
      }

      // Move to the next slide
      flatListRef.current?.scrollToOffset({
        offset: width * nextIndex,
        animated: true,
      });
    }, SLIDE_INTERVAL);
  }, [slideCount, stopAutoSlide]);

  // Manage automatic sliding lifecycle
  useEffect(() => {
    // Reset the slider when slides change
    nextIndexRef.current = 0;
    setActiveIndex(0);

    // No slides
    if (slideCount === 0) {
      stopAutoSlide();
      return;
    }

    // Start automatic sliding
    startAutoSlide();

    // Clean up when the component changes or unmounts
    return () => {
      stopAutoSlide();
    };
  }, [slideCount, startAutoSlide, stopAutoSlide]);

  // Update active slide after scrolling finishes
  const onMomentumScrollEnd = useCallback((event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;

    const index = Math.round(offsetX / width);

    nextIndexRef.current = index;

    setActiveIndex(index);
  }, []);

  // Render each slide
  const renderSlide: ListRenderItem<HeroSlide> = useCallback(({ item }) => {
    return (
      <View style={styles.slide}>
        <Image
          source={{
            uri: item.backdrop_url ?? item.poster_url ?? "",
          }}
          style={styles.backdropImage}
          contentFit="cover"
        />

        <LinearGradient
          colors={["transparent", "rgba(13,13,26,0.7)", "#0D0D1A"]}
          style={styles.gradient}
        />
      </View>
    );
  }, []);

  // Handle Watch Now button
  const handleWatchNow = useCallback(
    (id: number) => {
      router.push({
        pathname: "/movies/[id]",
        params: {
          id: id.toString(),
          type,
        },
      });
    },
    [router, type],
  );

  // Handle Info button
  const handleInfo = useCallback(
    (id: number) => {
      router.push({
        pathname: "/movies/[id]",
        params: {
          id: id.toString(),
          type,
        },
      });
    },
    [router, type],
  );

  // Return nothing when there are no slides
  if (slideCount === 0) {
    return null;
  }

  // Protect against an invalid active index
  const safeActiveIndex = Math.min(activeIndex, slideCount - 1);

  const currentSlide = slides[safeActiveIndex];

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
        showsVerticalScrollIndicator={false}
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
        initialNumToRender={1}
        maxToRenderPerBatch={2}
        windowSize={3}
        removeClippedSubviews={true}
      />

      <View style={styles.infoOverlay}>
        <Text style={styles.title} numberOfLines={2}>
          {currentSlide.title}
        </Text>

        <Text style={styles.meta}>
          {currentSlide.year}
          {currentSlide.year ? "  |  " : ""}
          {label}
        </Text>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.sideAction} activeOpacity={0.7}>
            <Text style={styles.sideIcon}>＋</Text>

            <Text style={styles.sideLabel}>Save</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.watchBtn}
            activeOpacity={0.85}
            onPress={() => handleWatchNow(currentSlide.id)}
          >
            <Text style={styles.watchText}>▶ Watch Now</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sideAction}
            activeOpacity={0.7}
            onPress={() => handleInfo(currentSlide.id)}
          >
            <Text style={styles.sideIcon}>ⓘ</Text>

            <Text style={styles.sideLabel}>Info</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default React.memo(HeroSlider);

const styles = StyleSheet.create({
  container: {
    width: width,
    height: HERO_HEIGHT,
    marginTop: 0,
  },

  slide: {
    width: width,
    height: HERO_HEIGHT,
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
    textShadowOffset: {
      width: 0,
      height: 1,
    },
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
    backgroundColor: "#989ED4",
    paddingVertical: 13,
    paddingHorizontal: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  watchText: {
    color: "#000000",
    fontWeight: "700",
    fontSize: 15,
  },

  sideAction: {
    alignItems: "center",
    justifyContent: "center",
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
