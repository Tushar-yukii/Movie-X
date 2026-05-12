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
import { icons } from "@/constants/icons";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

const Badge = ({
  icon,
  label,
  accent = false,
}: {
  icon?: string;
  label: string;
  accent?: boolean;
}) => (
  <View
    style={{
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: accent ? "#7B6FCD" : "rgba(255,255,255,0.12)",
      borderRadius: 6,
      paddingHorizontal: 10,
      paddingVertical: 4,
      marginRight: 8,
      marginBottom: 8,
    }}
  >
    {icon ? (
      <Text style={{ color: "#FFD700", fontSize: 12, marginRight: 4 }}>
        {icon}
      </Text>
    ) : null}
    <Text
      style={{
        color: "#fff",
        fontSize: 12,
        fontWeight: "600",
        letterSpacing: 0.3,
      }}
    >
      {label}
    </Text>
  </View>
);

// ✅ RecommendationCard — defined outside component
// memo ensures it only re-renders when its own props change
// Tapping navigates to that movie's detail page
const RecommendationCard = memo(({
  item,
  onPress,
}: {
  item: any;
  onPress: (id: number) => void;
}) => {
  const posterUri = item.poster_path
    ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
    : "https://placehold.co/342x513/1a0533/FFF?text=No+Image";

  const year = item.release_date?.split("-")[0] ?? "";
  const rating = item.vote_average ? item.vote_average.toFixed(1) : null;

  return (
    <TouchableOpacity
      onPress={() => onPress(item.id)}
      activeOpacity={0.75}
      style={{
        width: 110,
        marginRight: 12,
      }}
    >
      {/* Poster image */}
      <View
        style={{
          borderRadius: 10,
          overflow: "hidden",
          backgroundColor: "#1a1a2e",
          // Shadow
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 8,
          elevation: 6,
        }}
      >
        <Image
          source={{ uri: posterUri }}
          style={{ width: 110, height: 160 }}
          resizeMode="cover"
        />
        {/* Rating badge overlay on poster */}
        {/* {rating && (
          <View
            style={{
              position: "absolute",
              top: 6,
              right: 6,
              backgroundColor: "rgba(0,0,0,0.75)",
              borderRadius: 6,
              paddingHorizontal: 6,
              paddingVertical: 2,
              flexDirection: "row",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Text style={{ color: "#FFD700", fontSize: 9 }}>★</Text>
            <Text style={{ color: "#fff", fontSize: 10, fontWeight: "700" }}>
              {rating}
            </Text>
          </View>
        )} */}
      </View>

      {/* Title */}
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

      {/* Year */}
      {year ? (
        <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, marginTop: 2 }}>
          {year}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
});

const MovieDetails = () => {
  const { id } = useLocalSearchParams();

  // Fetch movie details — existing
  const { data: movie, loading } = useFetch(() =>
    fetchMovieDetails(id as string)
  );

  //  Fetch recommendations using the same movie id
  //  fetchMovieRecommendations is the new function in api.ts
  // It calls /movie/{id}/recommendations → returns 10 similar movies
  // We pass false as second arg so it only runs when id exists
  const { data: recommendations, loading: recsLoading } = useFetch(
    () => fetchMovieRecommendations(id as string),
    !!id // only fetch when id is available
  );

  // When user taps a recommendation card
  // router.push navigates to that movie's detail page
  // This creates a navigation stack so back button works correctly
  const handleRecommendationPress = (movieId: number) => {
    router.push({
      pathname: "/movies/[id]",
      params: { id: movieId.toString() },
    });
  };

  const posterUri = movie?.poster_path
    ? `https://image.tmdb.org/t/p/w780${movie.poster_path}`
    : "https://placehold.co/780x1170/1a0533/FFF?text=No+Image";

  const backdropUri = movie?.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
    : posterUri;

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
        <Text style={{ color: "#F47521", fontSize: 16, fontWeight: "700" }}>
          Loading…
        </Text>
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

  const year = movie.release_date?.split("-")[0] ?? "—";
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "—";

  return (
    <View style={{ flex: 1, backgroundColor: "#0f0720" }}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Banner */}
        <View style={{ height: height * 0.52, position: "relative" }}>
          <ImageBackground
            source={{ uri: backdropUri }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          >
            <LinearGradient
              colors={[
                "transparent",
                "rgba(15,7,32,0.55)",
                "rgba(15,7,32,0.9)",
                "#0f0720",
              ]}
              locations={[0.3, 0.6, 0.82, 1]}
              style={{ flex: 1 }}
            />
          </ImageBackground>

          {/* Back Button */}
          <TouchableOpacity
            onPress={router.back}
            style={{
              position: "absolute",
              top: 48,
              left: 16,
              backgroundColor: "rgba(0,0,0,0.45)",
              borderRadius: 22,
              padding: 8,
            }}
          >
            <Image
              source={icons.arrow}
              style={{
                width: 20,
                height: 20,
                transform: [{ rotate: "180deg" }],
              }}
              tintColor="#fff"
            />
          </TouchableOpacity>
        </View>

        {/* Poster + Title */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-end",
            marginTop: -80,
            paddingHorizontal: 16,
            zIndex: 10,
          }}
        >
          <View
            style={{
              borderRadius: 14,
              overflow: "hidden",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.6,
              shadowRadius: 16,
              elevation: 14,
              borderWidth: 2,
              borderColor: "rgba(255,255,255,0.08)",
            }}
          >
            <Image
              source={{ uri: posterUri }}
              style={{ width: 110, height: 160 }}
              resizeMode="cover"
            />
          </View>

          <View style={{ flex: 1, marginLeft: 14, paddingBottom: 4 }}>
            <Text
              style={{
                color: "#fff",
                fontSize: 20,
                fontWeight: "800",
                lineHeight: 26,
                letterSpacing: -0.3,
              }}
              numberOfLines={3}
            >
              {movie.title || movie.name}
            </Text>

            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                marginTop: 10,
              }}
            >
              <Badge label={year} />
              {movie.runtime ? <Badge label={`${movie.runtime}m`} /> : null}
              {movie.number_of_episodes ? (
                <Badge label={`${movie.number_of_episodes} eps`} />
              ) : null}
              {movie.vote_average ? (
                <Badge icon="★" label={rating} accent />
              ) : null}
            </View>
          </View>
        </View>

        {/* Divider */}
        <View
          style={{
            height: 1,
            marginHorizontal: 16,
            marginTop: 2,
            marginBottom: 15,
          }}
        />

        {/* Details */}
        <View style={{ paddingHorizontal: 16 }}>
          {/* Synopsis */}
          {movie.overview ? (
            <View style={{ marginBottom: 24 }}>
              <Text
                style={{
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: "800",
                  letterSpacing: 0.3,
                  marginBottom: 10,
                }}
              >
                Synopsis
              </Text>
              <Text
                style={{
                  color: "rgba(255,255,255,0.82)",
                  fontSize: 14,
                  lineHeight: 23,
                }}
              >
                {movie.overview}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Recommendations Section
            Shows 10 similar movies in horizontal scroll
            Loading state shows spinner while fetching
            Only shows when recommendations exist          */}
        <View style={{ marginTop: 4, marginBottom: 16 }}>
          <Text
            style={{
              color: "#fff",
              fontSize: 16,
              fontWeight: "800",
              letterSpacing: 0.3,
              marginBottom: 14,
              paddingHorizontal: 16,
            }}
          >
            Recommendations
          </Text>

          {recsLoading ? (
            // Show spinner while recommendations load
            <ActivityIndicator
              color="#7B6FCD"
              style={{ marginTop: 10, marginBottom: 10 }}
            />
          ) : recommendations && recommendations.length > 0 ? (
            // Horizontal ScrollView for recommendation cards
            // ScrollView used instead of FlatList to avoid
            // VirtualizedList nesting warning inside ScrollView
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
            // No recommendations found
            <Text
              style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: 13,
                paddingHorizontal: 16,
              }}
            >
              No recommendations available
            </Text>
          )}
        </View>
      </ScrollView>

      {/* CTA Button */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: 16,
          paddingBottom: 24,
          paddingTop: 12,
          backgroundColor: "rgba(15,7,32,0.95)",
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
          <Text style={{ fontSize: 18, marginRight: 4 }}>▶</Text>
          <Text
            style={{
              color: "black",
              fontWeight: "800",
              fontSize: 18,
              letterSpacing: 0.4,
            }}
          >
            Start Watching
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MovieDetails;