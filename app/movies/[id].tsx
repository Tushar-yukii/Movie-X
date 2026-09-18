import { memo } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ImageBackground,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";

import {
  fetchMovieDetails,
  fetchMovieRecommendations,
  fetchTVDetails,
} from "@/services/api";

import useFetch from "@/services/useFetch";

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

/* -------------------------------------------------------
   RECOMMENDATION CARD
------------------------------------------------------- */

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

/* -------------------------------------------------------
   DETAIL SCREEN
------------------------------------------------------- */

const MovieDetails = () => {
  const { id, type } = useLocalSearchParams<{
    id?: string;
    type?: string;
  }>();

  /*
    type = anime
    type = movie
  */

  const isAnime = type === "anime";
  const isMovie = !type || type === "movie";

  /* -------------------------------------------------------
     MOVIE DETAILS
  ------------------------------------------------------- */

  const { data: movie, loading: movieLoading } = useFetch(
    () => fetchMovieDetails(id as string),
    !!id && isMovie,
  );

  /* -------------------------------------------------------
     ANIME / TV DETAILS

     Anime on TMDB is stored as TV content.
  ------------------------------------------------------- */

  const { data: anime, loading: animeLoading } = useFetch(
    () => fetchTVDetails(id as string),
    !!id && isAnime,
  );

  /* -------------------------------------------------------
     MOVIE RECOMMENDATIONS

     Only movies should use movie recommendations.
  ------------------------------------------------------- */

  const { data: recommendations, loading: recsLoading } = useFetch(
    () => fetchMovieRecommendations(id as string),
    !!id && isMovie,
  );

  /* -------------------------------------------------------
     FINAL LOADING STATE
  ------------------------------------------------------- */

  const loading = movieLoading || animeLoading;

  /* -------------------------------------------------------
     SELECT CONTENT
  ------------------------------------------------------- */

  const content: any = isAnime ? anime : movie;

  /* -------------------------------------------------------
     RECOMMENDATION PRESS
  ------------------------------------------------------- */

  const handleRecommendationPress = (movieId: number) => {
    router.push({
      pathname: "/movies/[id]",
      params: {
        id: movieId.toString(),
        type: "movie",
      },
    });
  };

  /* -------------------------------------------------------
     BACKDROP
  ------------------------------------------------------- */

  const backdropUri = content?.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${content.backdrop_path}`
    : content?.poster_path
      ? `https://image.tmdb.org/t/p/w780${content.poster_path}`
      : "https://placehold.co/1280x720/1a0533/FFF?text=No+Image";

  /* -------------------------------------------------------
     LOADING
  ------------------------------------------------------- */

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

  /* -------------------------------------------------------
     NOT FOUND
  ------------------------------------------------------- */

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
          {isAnime ? "Anime not found" : "Movie not found"}
        </Text>
      </View>
    );
  }

  /* -------------------------------------------------------
     DATA

     Movie:
       release_date

     Anime / TV:
       first_air_date
  ------------------------------------------------------- */

  const year =
    (isAnime ? content.first_air_date : content.release_date)?.split("-")[0] ??
    "";

  const rating = content.vote_average ? content.vote_average.toFixed(1) : null;

  const runtime = content.runtime ? `${content.runtime}m` : null;

  const genre = content.genres?.[0]?.name ?? null;

  const seasons = content.number_of_seasons ?? null;

  /* -------------------------------------------------------
     TITLE
  ------------------------------------------------------- */

  const title = content.title || content.name || "Unknown";

  /* -------------------------------------------------------
     SCREEN
  ------------------------------------------------------- */

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
        {/* HERO */}

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

          {/* BACK */}

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

          {/* CLOSE */}

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

          {/* TITLE + META */}

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

        {/* CONTENT */}

        <View
          style={{
            paddingHorizontal: 16,
            marginTop: 8,
          }}
        >
          {/* SYNOPSIS */}

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

        {/* MOVIE RECOMMENDATIONS */}

        {isMovie ? (
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

      {/* WATCH BUTTON */}

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
            }}
          >
            ▶
          </Text>

          <Text
            style={{
              color: "#fff",
              fontWeight: "800",
              fontSize: 17,
              letterSpacing: 0.4,
            }}
          >
            {isAnime ? "Watch Anime" : "Watch Movie"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MovieDetails;
