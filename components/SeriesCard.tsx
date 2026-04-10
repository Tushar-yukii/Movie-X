// components/SeriesCard.tsx
// Same style as AnimeCard/TrendingCard — horizontal scroll card
// Shows poster + title + year

import { Link } from "expo-router";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Image } from "expo-image";

type SeriesCardProps = {
  series: {
    series_id: number;
    title: string;
    poster_url: string | null;
    release_date: string | null;
  };
};

const SeriesCard = ({ series }: SeriesCardProps) => {
  const { series_id, title, poster_url, release_date } = series;
// error
  return (
    <Link
      href={{
        pathname: "/movies/[id]",
        params: { id: series_id.toString() },
      }}
      asChild
    >
      <TouchableOpacity style={styles.card} activeOpacity={0.75}>
        <Image
          source={
            poster_url
              ? { uri: poster_url }
              : { uri: "https://placehold.co/300x450/1a1a1a/FFFFFF.png" }
          }
          style={styles.poster}
          contentFit="cover"
        />
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.year}>
          {release_date?.split("-")[0] ?? ""}
        </Text>
      </TouchableOpacity>
    </Link>
  );
};

export default SeriesCard;

const styles = StyleSheet.create({
  card: {
    width: 120,
    marginRight: 12,
  },
  poster: {
    width: 120,
    height: 180,
    borderRadius: 12,
    backgroundColor: "#1A1A2E",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 6,
  },
  year: {
    color: "#A0A0B0",
    fontSize: 11,
    marginTop: 2,
  },
});