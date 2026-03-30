import { Link } from "expo-router";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Image } from "expo-image";

type TrendingCardProps = {
  movie: {
    movie_id: number;
    title: string;
    poster_url: string | null;
    release_date: string | null;
  };
};

const TrendingCard = ({
  movie: { movie_id, title, poster_url, release_date },
}: TrendingCardProps) => {
  return (
    <Link
      href={{
        pathname: "/movies/[id]",
        params: { id: movie_id.toString() },
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
        <View className="flex-row items-center justify-between">
          <Text className="text-xs text-slate-500 font-medium mt-1">
            {release_date?.split("-")[0]}
          </Text>
          <Text className="text-xs font-medium text-light-300 uppercase">
            Movie
          </Text>
        </View>
      </TouchableOpacity>
    </Link>
  );
};

export default TrendingCard;

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
});


