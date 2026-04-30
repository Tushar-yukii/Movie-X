import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
  Dimensions,
} from "react-native";
import React from "react";
import useFetch from "@/services/useFetch";
import { fetchMovieDetails } from "@/services/api";
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

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) => (
  <View style={{ marginBottom: 16 }}>
    <Text
      style={{
        color: "rgba(255,255,255,0.5)",
        fontSize: 11,
        fontWeight: "700",
        letterSpacing: 1.2,
        textTransform: "uppercase",
        marginBottom: 4,
      }}
    >
      {label}
    </Text>
    <Text
      style={{
        color: "rgba(255,255,255,0.9)",
        fontSize: 14,
        lineHeight: 22,
        fontWeight: "400",
      }}
    >
      {value || "N/A"}
    </Text>
  </View>
);

const StatBox = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <View
    style={{
      flex: 1,
      alignItems: "center",
      backgroundColor: "rgba(255,255,255,0.07)",
      borderRadius: 12,
      paddingVertical: 14,
      marginHorizontal: 4,
    }}
  >
    <Text style={{ color: "#F47521", fontSize: 18, fontWeight: "800" }}>
      {value}
    </Text>
    <Text
      style={{
        color: "rgba(255,255,255,0.5)",
        fontSize: 11,
        marginTop: 2,
        letterSpacing: 0.8,
      }}
    >
      {label}
    </Text>
  </View>
);

const MovieDetails = () => {
  const { id } = useLocalSearchParams();
  const { data: movie, loading } = useFetch(() =>
    fetchMovieDetails(id as string),
  );

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
  const companies =
    movie.production_companies?.map((c: any) => c.name).join("  ·  ") || "—";

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

        {/* Genre Chips */}
        {/* {movie.genres?.length ? (
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              paddingHorizontal: 16,
              marginTop: 14,
            }}
          >
            {movie.genres.map((g: any) => (
              <View
                key={g.id}
                style={{
                  backgroundColor: "rgba(244,117,33,0.15)",
                  borderColor: "#7B6FCD",
                  borderWidth: 1,
                  borderRadius: 20,
                  paddingHorizontal: 12,
                  paddingVertical: 5,
                  marginRight: 8,
                  marginBottom: 8,
                }}
              >
                <Text
                  style={{ color: "#7B6FCD", fontSize: 12, fontWeight: "600" }}
                >
                  {g.name}
                </Text>
              </View>
            ))}
          </View>
        ) : null} */}

        {/* Stats Row */}
        {/* <View
          style={{
            flexDirection: "row",
            marginHorizontal: 16,
            marginTop: 16,
          }}
        >
          {movie.vote_average ? (
            <StatBox label="Rating" value={`${rating}/10`} />
          ) : null}
          {movie.vote_count ? (
            <StatBox
              label="Votes"
              value={
                movie.vote_count > 999
                  ? `${(movie.vote_count / 1000).toFixed(1)}k`
                  : movie.vote_count
              }
            />
          ) : null}
          {movie.runtime ? (
            <StatBox label="Runtime" value={`${movie.runtime}m`} />
          ) : null}
          {movie.number_of_seasons ? (
            <StatBox label="Seasons" value={movie.number_of_seasons} />
          ) : null}
        </View> */}

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
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  color: "rgba(255,255,255,0.5)",
                  fontSize: 11,
                  fontWeight: "700",
                  letterSpacing: 1.2,
                  textTransform: "uppercase",
                  marginBottom: 8,
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

          {/* Budget / Revenue */}
          {/* {movie.budget || movie.revenue ? (
            <View style={{ flexDirection: "row", marginBottom: 8 }}>
              {movie.budget ? (
                <View style={{ flex: 1, marginRight: 8 }}>
                  <InfoRow
                    label="Budget"
                    value={`$${(movie.budget / 1_000_000).toFixed(1)}M`}
                  />
                </View>
              ) : null}
              {movie.revenue ? (
                <View style={{ flex: 1 }}>
                  <InfoRow
                    label="Revenue"
                    value={`$${Math.round(movie.revenue / 1_000_000)}M`}
                  />
                </View>
              ) : null}
            </View>
          ) : null} */}

          {/* Production Companies */}
          {/* {movie.production_companies?.length ? (
            <InfoRow label="Production Companies" value={companies} />
          ) : null} */}

          {/* Languages
          {movie.spoken_languages?.length ? (
            <InfoRow
              label="Languages"
              value={movie.spoken_languages
                .map((l: any) => l.english_name)
                .join("  ·  ")}
            />
          ) : null} */}
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
