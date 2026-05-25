import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import React, { memo } from "react";
import useFetch from "@/services/useFetch";
import { fetchMovieDetails, fetchMovieRecommendations } from "@/services/api";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

const { id, type } = useLocalSearchParams();

const isMovie = !type || type === "movie";
// Meta badge — matches Image 3 style
// icon + label in a pill shape
const MetaBadge = ({
  icon,
  label,
  accent = false,
}: {
  icon: string;
  label: string;
  accent?: boolean;
}) => (
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
    <Text style={{ fontSize: 12, marginRight: 4 }}>{icon}</Text>
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

// Recommendation card — defined outside to prevent re-renders
const RecommendationCard = memo(
  ({ item, onPress }: { item: any; onPress: (id: number) => void }) => {
    const posterUri = item.poster_path
      ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
      : "https://placehold.co/342x513/1a0533/FFF?text=No+Image";

    const year = item.release_date?.split("-")[0] ?? "";
    const rating = item.vote_average ? item.vote_average.toFixed(1) : null;

    return (
      <TouchableOpacity
        onPress={() => onPress(item.id)}
        activeOpacity={0.75}
        style={{ width: 110, marginRight: 12 }}
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
            source={{ uri: posterUri }}
            style={{ width: 110, height: 160 }}
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
          {item.title}
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
  },
);

const MovieDetails = () => {
  const { id } = useLocalSearchParams();

  const { data: movie, loading } = useFetch(() =>
    fetchMovieDetails(id as string),
  );

  const { data: recommendations, loading: recsLoading } = useFetch(
    () => fetchMovieRecommendations(id as string),
    !!id && isMovie,
  );

  const handleRecommendationPress = (movieId: number) => {
    router.push({
      pathname: "/movies/[id]",
      params: { id: movieId.toString() },
    });
  };

  //  Single backdrop image
  const backdropUri = movie?.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
    : movie?.poster_path
      ? `https://image.tmdb.org/t/p/w780${movie.poster_path}`
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

  if (!movie) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0f0720",
        }}
      >
        <Text style={{ color: "#fff" }}>Not found</Text>
      </View>
    );
  }

  const year = movie.release_date?.split("-")[0] ?? "";
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : null;
  const runtime = movie.runtime ? `${movie.runtime}m` : null;
  const genre = movie.genres?.[0]?.name ?? null;
  const seasons = movie.number_of_seasons ?? null;

  return (
    <View style={{ flex: 1, backgroundColor: "#0f0720" }}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        // Smooth scroll feel
        decelerationRate="normal"
        scrollEventThrottle={16}
      >
        {/* ── Hero Image — full width, single image
             No small poster below — just one clean backdrop
            LinearGradient fades image into dark background    */}
        <View style={{ height: height * 0.55, position: "relative" }}>
          <ImageBackground
            source={{ uri: backdropUri }}
            style={{ width: "100%", height: "100%" }}
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
              style={{ flex: 1 }}
            />
          </ImageBackground>

          {/* ← Back button — top left */}
          <TouchableOpacity
            onPress={router.back}
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
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>
              ←
            </Text>
          </TouchableOpacity>

          {/*  X Close button — top right like Image 1 */}
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
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
              ✕
            </Text>
          </TouchableOpacity>

          {/* Title + meta overlaid at bottom of hero image */}
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
            {/* Movie Title */}
            <Text
              style={{
                color: "#fff",
                fontSize: 24,
                fontWeight: "800",
                textAlign: "center",
                lineHeight: 30,
                letterSpacing: -0.3,
                marginBottom: 12,
                // Text shadow so title is readable on any image
                textShadowColor: "rgba(0,0,0,0.8)",
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 6,
              }}
              numberOfLines={2}
            >
              {movie.title || movie.name}
            </Text>

            {/*  Meta badges row — matches Image 3 style
                 year  □ seasons/episodes  ⚙ genre  ★ rating */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              {year ? <MetaBadge icon="📅" label={year} /> : null}
              {seasons ? (
                <MetaBadge icon="□" label={`${seasons}`} />
              ) : runtime ? (
                <MetaBadge icon="🕐" label={runtime} />
              ) : null}
              {genre ? <MetaBadge icon="⚙" label={genre} /> : null}
              {rating ? <MetaBadge icon="★" label={rating} accent /> : null}
            </View>
          </View>
        </View>

        {/*  Content Section */}
        <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
          {/* Synopsis */}
          {movie.overview ? (
            <View style={{ marginBottom: 28 }}>
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
                {movie.overview}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Recommendations  */}
        {isMovie && (
          <View style={{ marginBottom: 16 }}>
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
                style={{ marginVertical: 16 }}
              />
            ) : recommendations && recommendations.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
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
        )}
      </ScrollView>

      {/* ── Watch Movie Button — fixed at bottom ── */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: 16,
          paddingBottom: 28,
          paddingTop: 12,
          backgroundColor: "rgba(15,7,32,0.97)",
          // Subtle top border
          borderTopWidth: 1,
          borderTopColor: "rgba(255,255,255,0.06)",
        }}
      >
        <TouchableOpacity
          style={{
            backgroundColor: "#7B6FCD",
            borderRadius: 14,
            paddingVertical: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#7B6FCD",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.5,
            shadowRadius: 12,
            elevation: 8,
          }}
          activeOpacity={0.82}
        >
          <Text style={{ fontSize: 18, marginRight: 6 }}>▶</Text>
          <Text
            style={{
              color: "#fff",
              fontWeight: "800",
              fontSize: 17,
              letterSpacing: 0.4,
            }}
          >
            Watch Movie
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MovieDetails;
