import { memo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ImageBackground,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";

import {
  fetchMovieDetails,
  fetchMovieRecommendations,
  fetchTVDetails,
  fetchTVRecommendations,
} from "@/services/api";

import useFetch from "@/services/useFetch";
import { logUserActivity } from "@/services/activityTracker";
import AddToCategoryModal from "@/components/AddToCategoryModal";
import { ContentType, useItemCategories } from "@/services/categoryStorage";

const { height } = Dimensions.get("window");

type MetaBadgeProps = {
  icon: string;
  label: string;
  accent?: boolean;
};

function MetaBadge({ icon, label, accent = false }: MetaBadgeProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: accent ? "#7B6FCD" : "rgba(255,255,255,0.12)",
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 5,
        marginRight: 8,
      }}
    >
      <Text
        style={{
          fontSize: 12,
          marginRight: 4,
        }}
      >
        {icon}
      </Text>

      <Text
        style={{
          color: accent ? "#fff" : "rgba(255,255,255,0.85)",
          fontSize: 12,
          fontWeight: "600",
        }}
      >
        {label}
      </Text>
    </View>
  );
}

type RecommendationCardProps = {
  item: any;
  onPress: (id: number) => void;
};

const RecommendationCard = memo(function RecommendationCard({
  item,
  onPress,
}: RecommendationCardProps) {
  const posterUri = item.poster_path
    ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
    : "https://placehold.co/342x513/1a0533/FFF?text=No+Image";

  const year = item.release_date?.split("-")[0] ?? "";

  return (
    <TouchableOpacity
      onPress={() => onPress(item.id)}
      activeOpacity={0.75}
      style={{
        width: 110,
        marginRight: 12,
      }}
    >
      <View
        style={{
          borderRadius: 10,
          overflow: "hidden",
          backgroundColor: "#1a1a2e",
          elevation: 6,
        }}
      >
        <Image
          source={{
            uri: posterUri,
          }}
          style={{
            width: 110,
            height: 160,
          }}
          resizeMode="cover"
        />
      </View>

      <Text
        style={{
          color: "#fff",
          fontSize: 11,
          fontWeight: "600",
          marginTop: 6,
          lineHeight: 15,
        }}
        numberOfLines={2}
      >
        {item.title || item.name}
      </Text>

      {year ? (
        <Text
          style={{
            color: "rgba(255,255,255,0.45)",
            fontSize: 10,
            marginTop: 2,
          }}
        >
          {year}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
});
RecommendationCard.displayName = "RecommendationCard";

export default function MovieDetails() {
  const { id, type } = useLocalSearchParams<{
    id?: string;
    type?: string;
  }>();

  /*
    type = anime | series | tv | movie
  */

  const isAnime = type === "anime";
  const isSeries = type === "series" || type === "tv";
  const isTV = isAnime || isSeries;
  const isMovie = !isTV;

  const { data: movie, loading: movieLoading } = useFetch(
    () => fetchMovieDetails(id as string),
    !!id && isMovie,
  );

  const { data: tvShow, loading: tvLoading } = useFetch(
    () => fetchTVDetails(id as string),
    !!id && isTV,
  );

  const { data: recommendations, loading: recsLoading } = useFetch(
    () =>
      isTV
        ? fetchTVRecommendations(id as string)
        : fetchMovieRecommendations(id as string),
    !!id,
  );

  const loading = isTV ? tvLoading : movieLoading;

  const content: any = isTV ? tvShow : movie;

  const handleRecommendationPress = (itemId: number) => {
    router.push({
      pathname: "/movies/[id]",
      params: {
        id: itemId.toString(),
        type: isTV ? (isAnime ? "anime" : "tv") : "movie",
      },
    });
  };

  const backdropUri = content?.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${content.backdrop_path}`
    : content?.poster_path
      ? `https://image.tmdb.org/t/p/w780${content.poster_path}`
      : "https://placehold.co/1280x720/1a0533/FFF?text=No+Image";

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0f0720",
        }}
      >
        <ActivityIndicator color="#7B6FCD" size="large" />
      </View>
    );
  }

  if (!content) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0f0720",
        }}
      >
        <Text
          style={{
            color: "#fff",
            fontSize: 16,
          }}
        >
          {isAnime
            ? "Anime not found"
            : isSeries
              ? "Series not found"
              : "Movie not found"}
        </Text>
      </View>
    );
  }

  const year =
    (isAnime ? content.first_air_date : content.release_date)?.split("-")[0] ??
    "";

  const rating = content.vote_average ? content.vote_average.toFixed(1) : null;

  const runtime = content.runtime ? `${content.runtime}m` : null;

  const genre = content.genres?.[0]?.name ?? null;

  const seasons = content.number_of_seasons ?? null;

  const title = content.title || content.name || "Unknown";

  const contentType: ContentType = isAnime ? "anime" : isSeries ? "series" : "movie";
  const { isSaved, savedCategoryIds } = useItemCategories(contentType, (id || "").toString());
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [saveToastMessage, setSaveToastMessage] = useState<string | null>(null);

  const [sessionLogged, setSessionLogged] = useState(false);

  const handleWatchPress = async () => {
    if (!content) return;
    const cat = isAnime ? "anime" : isSeries ? "series" : "movie";
    const duration = content.runtime || 24;
    const genres = content.genres?.map((g: any) => g.name) || [];
    const studio = content.production_companies?.[0]?.name || null;

    await logUserActivity({
      contentId: (id || "").toString(),
      title,
      category: cat,
      specificType: cat,
      posterUrl: content.poster_path
        ? `https://image.tmdb.org/t/p/w500${content.poster_path}`
        : null,
      durationMinutes: duration,
      episodesWatched: 1,
      chaptersRead: 0,
      completed: false,
      genres,
      studio,
    });

    setSessionLogged(true);
    setTimeout(() => {
      setSessionLogged(false);
    }, 3000);
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#0f0720",
      }}
    >
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <ScrollView
        contentContainerStyle={{
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}
        decelerationRate="normal"
        scrollEventThrottle={16}
      >
        <View
          style={{
            height: height * 0.55,
            position: "relative",
          }}
        >
          <ImageBackground
            source={{
              uri: backdropUri,
            }}
            style={{
              width: "100%",
              height: "100%",
            }}
            resizeMode="cover"
          >
            <LinearGradient
              colors={[
                "rgba(15,7,32,0.1)",
                "transparent",
                "rgba(15,7,32,0.7)",
                "#0f0720",
              ]}
              locations={[0, 0.3, 0.75, 1]}
              style={{
                flex: 1,
              }}
            />
          </ImageBackground>

          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              position: "absolute",
              top: 48,
              left: 16,
              backgroundColor: "rgba(0,0,0,0.5)",
              borderRadius: 22,
              width: 40,
              height: 40,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 18,
                fontWeight: "700",
              }}
            >
              ←
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              position: "absolute",
              top: 48,
              right: 16,
              backgroundColor: "rgba(0,0,0,0.5)",
              borderRadius: 22,
              width: 40,
              height: 40,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 16,
                fontWeight: "700",
              }}
            >
              ✕
            </Text>
          </TouchableOpacity>

          <View
            style={{
              position: "absolute",
              bottom: 20,
              left: 0,
              right: 0,
              alignItems: "center",
              paddingHorizontal: 20,
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 24,
                fontWeight: "800",
                textAlign: "center",
                lineHeight: 30,
                letterSpacing: -0.3,
                marginBottom: 12,

                textShadowColor: "rgba(0,0,0,0.8)",
                textShadowOffset: {
                  width: 0,
                  height: 1,
                },
                textShadowRadius: 6,
              }}
              numberOfLines={2}
            >
              {title}
            </Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              {year ? <MetaBadge icon="📅" label={year} /> : null}

              {isAnime && seasons ? (
                <MetaBadge icon="📺" label={`${seasons} Seasons`} />
              ) : runtime ? (
                <MetaBadge icon="🕐" label={runtime} />
              ) : null}

              {genre ? <MetaBadge icon="⚙" label={genre} /> : null}

              {rating ? <MetaBadge icon="★" label={rating} accent /> : null}
            </View>
          </View>
        </View>

        <View
          style={{
            paddingHorizontal: 16,
            marginTop: 8,
          }}
        >
          {content.overview ? (
            <View
              style={{
                marginBottom: 28,
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 17,
                  fontWeight: "800",
                  marginBottom: 10,
                  letterSpacing: 0.2,
                }}
              >
                Synopsis
              </Text>

              <Text
                style={{
                  color: "rgba(255,255,255,0.78)",
                  fontSize: 14,
                  lineHeight: 23,
                }}
              >
                {content.overview}
              </Text>
            </View>
          ) : null}
        </View>

        {true ? (
          <View
            style={{
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 17,
                fontWeight: "800",
                marginBottom: 14,
                paddingHorizontal: 16,
              }}
            >
              Recommendations
            </Text>

            {recsLoading ? (
              <ActivityIndicator
                color="#7B6FCD"
                style={{
                  marginVertical: 16,
                }}
              />
            ) : recommendations && recommendations.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  paddingHorizontal: 16,
                  gap: 12,
                }}
                decelerationRate="fast"
              >
                {recommendations.map((item: any) => (
                  <RecommendationCard
                    key={item.id.toString()}
                    item={item}
                    onPress={handleRecommendationPress}
                  />
                ))}
              </ScrollView>
            ) : (
              <Text
                style={{
                  color: "rgba(255,255,255,0.35)",
                  fontSize: 13,
                  paddingHorizontal: 16,
                }}
              >
                No recommendations available
              </Text>
            )}
          </View>
        ) : null}
      </ScrollView>

      {/* FLOATING SUCCESS TOAST */}
      {saveToastMessage ? (
        <View
          style={{
            position: "absolute",
            bottom: Platform.OS === "android" ? 82 : 94,
            alignSelf: "center",
            backgroundColor: "#292444",
            paddingVertical: 10,
            paddingHorizontal: 18,
            borderRadius: 20,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            borderWidth: 1,
            borderColor: "#AB8BFF",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.35,
            shadowRadius: 8,
            elevation: 10,
            zIndex: 999,
          }}
        >
          <Ionicons name="checkmark-circle" size={18} color="#AB8BFF" />
          <Text style={{ color: "#FFFFFF", fontSize: 13, fontWeight: "700" }}>
            {saveToastMessage}
          </Text>
        </View>
      ) : null}

      {/* BOTTOM ACTION BAR */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: 16,
          paddingBottom: Platform.OS === "android" ? 20 : 32,
          paddingTop: 12,
          backgroundColor: "rgba(15,7,32,0.97)",
          borderTopWidth: 1,
          borderTopColor: "rgba(255,255,255,0.06)",
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        }}
      >
        {/* SAVE TO CATEGORY BUTTON */}
        <TouchableOpacity
          onPress={() => setCategoryModalVisible(true)}
          style={{
            height: 52,
            paddingHorizontal: 16,
            borderRadius: 14,
            backgroundColor: isSaved ? "rgba(171, 139, 255, 0.18)" : "#221C38",
            borderWidth: 1.5,
            borderColor: isSaved ? "#AB8BFF" : "rgba(255, 255, 255, 0.08)",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
          activeOpacity={0.8}
        >
          {isSaved ? (
            <Ionicons name="bookmark" size={17} color="#AB8BFF" />
          ) : (
            <Feather name="plus" size={17} color="#A8B5DB" />
          )}
          <Text
            style={{
              color: isSaved ? "#AB8BFF" : "#FFFFFF",
              fontWeight: "700",
              fontSize: 14,
            }}
          >
            {isSaved
              ? savedCategoryIds.length > 1
                ? `Saved (${savedCategoryIds.length})`
                : "Saved"
              : "Save"}
          </Text>
        </TouchableOpacity>

        {/* WATCH NOW BUTTON */}
        <TouchableOpacity
          onPress={handleWatchPress}
          style={{
            flex: 1,
            height: 52,
            backgroundColor: sessionLogged ? "#10B981" : "#7B6FCD",
            borderRadius: 14,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            shadowColor: sessionLogged ? "#10B981" : "#7B6FCD",
            shadowOffset: {
              width: 0,
              height: 4,
            },
            shadowOpacity: 0.5,
            shadowRadius: 12,
            elevation: 8,
          }}
          activeOpacity={0.82}
        >
          <Text
            style={{
              fontSize: 18,
              marginRight: 6,
              color: "#fff",
            }}
          >
            {sessionLogged ? "✓" : "▶"}
          </Text>

          <Text
            style={{
              color: "#fff",
              fontWeight: "800",
              fontSize: 16,
              letterSpacing: 0.4,
            }}
          >
            {sessionLogged
              ? "Logged to Stats (+20 XP)"
              : isAnime
              ? "Watch Anime"
              : isSeries
              ? "Watch Series"
              : "Watch Movie"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ADD TO CATEGORY MODAL */}
      <AddToCategoryModal
        visible={categoryModalVisible}
        onClose={() => setCategoryModalVisible(false)}
        content={{
          id: (id || "").toString(),
          type: contentType,
          title,
          posterUrl: content.poster_path
            ? `https://image.tmdb.org/t/p/w500${content.poster_path}`
            : null,
          overview: content.overview,
          rating,
          year,
        }}
        onSuccess={(count) => {
          setSaveToastMessage(
            count > 0
              ? `Saved to ${count} ${count === 1 ? "category" : "categories"}!`
              : "Removed from categories"
          );
          setTimeout(() => setSaveToastMessage(null), 3000);
        }}
      />
    </View>
  );
}
