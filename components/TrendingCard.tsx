// import { View, Text, TouchableOpacity, Image } from "react-native";
// import React from "react";
// import { Link } from "expo-router";
// import { images } from "@/constants/images";
// import MaskedView from "@react-native-masked-view/masked-view";

// const TrendingCard = ({
//   movie: { movie_id, title, poster_url },
//   index,
// }: TrendingCardProps) => {
//   return (
//     <Link href={`/movies/${movie_id}`} asChild>
//       <TouchableOpacity className="w-32 relative pl-5">
//         <Image
//           source={{ uri: poster_url }}
//           className="w-32 h-48 rounded-3xl"
//           resizeMode="cover"
//         />
//         <View className="absolute bottom-9 -left-3.5 px-2 py-1 rounded-full">
//           <MaskedView
//             maskElement={
//               <Text className="font-bold text-white text-6xl">{index + 1}</Text>
//             }
//           >
//             <Image
//               source={images.rankingGradient}
//               className="size-14"
//               resizeMode="cover"
//             />
//           </MaskedView>
//         </View>
//         <Text
//           className="text-sm font-bold mt-2 text-light-300"
//           numberOfLines={2}
//         >
//           {title}
//         </Text>
//       </TouchableOpacity>
//     </Link>
//   );
// };

// export default TrendingCard;

import React from "react";
import { TouchableOpacity, View, Text, Image, StyleSheet } from "react-native";
import { Link } from "expo-router";
import { icons } from "@/constants/icons";

// ✅ Define proper types
type TrendingMovie = {
  movie_id: number;
  title: string;
  poster_url: string;
  vote_average?: number; // optional, because API may not always include it
};

type TrendingCardProps = {
  movie: TrendingMovie;
  index: number;
};

// ✅ TrendingCard Component
const TrendingCard: React.FC<TrendingCardProps> = ({ movie, index }) => {
  const { movie_id, title, poster_url, vote_average } = movie;

  return (
    <View style={styles.card}>
      <Link href={`/movies/${movie_id}`} asChild>
        <TouchableOpacity activeOpacity={0.8}>
          {/* Poster */}
          <Image source={{ uri: poster_url }} style={styles.image} />

          {/* Title + Rating */}
          <View style={styles.row}>
            <Text style={styles.title} numberOfLines={1}>
              {title || "Untitled"}
            </Text>

            <View style={styles.ratingBox}>
              <Image
                source={icons.star}
                style={styles.starIcon}
                resizeMode="contain"
              />

              {/* error */}
              <Text style={styles.rating}>
                {vote_average !== null &&
                vote_average !== undefined &&
                !isNaN(Number(vote_average))
                  ? Number(vote_average).toFixed(1)
                  : "N/A"}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Link>
    </View>
  );
};

// ✅ Styles
const styles = StyleSheet.create({
  card: {
    padding: 1,
    width: 370,
    marginRight: 16,
    paddingRight: 11,
  },
  image: {
    resizeMode: "cover",
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 14,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 17,
    flex: 1,
  },
  ratingBox: {
    backgroundColor: "#6C4EE6",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginLeft: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  starIcon: {
    width: 14,
    height: 14,
    marginRight: 4,
  },
  rating: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
});

export default TrendingCard;
