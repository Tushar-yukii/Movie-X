import React, { memo } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Link } from "expo-router";

type Movie = {
  movie_id: number;
  title: string;
  poster_url: string;
  release_date?: string;
};

type Props = {
  movie: Movie;
  index: number;
};

const TrendingCard = ({ movie }: Props) => {
  const { movie_id, poster_url, title, release_date } = movie;

  return (
    <View style={styles.card}>
      <Link href={`/movies/${movie_id}`} asChild>
        <TouchableOpacity activeOpacity={0.85}>
          <Image
            source={{
              uri: poster_url.startsWith("http")
                ? poster_url
                : `https://image.tmdb.org/t/p/w500${poster_url}`,
            }}
            style={styles.image}
          />

          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>

          <Text style={styles.year}>
            {release_date ? release_date.split("-")[0] : "—"}
          </Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
};

export default memo(TrendingCard); // performance boost

const styles = StyleSheet.create({
  card: {
    width: 150,
    marginRight: 16,
  },
  image: {
    height: 220,
    borderRadius: 14,
    backgroundColor: "#222",
  },
  title: {
    color: "white",
    fontWeight: "700",
    marginTop: 6,
    fontSize: 13,
  },
  year: {
    color: "#aaa",
    fontSize: 11,
    marginTop: 2,
  },
});

// // sample code
// import { Link } from "expo-router";
// import MaskedView from "@react-native-masked-view/masked-view";
// import { View, Text, TouchableOpacity, Image } from "react-native";

// import { images } from "@/constants/images";

// const TrendingCard = ({
//   movie: { movie_id, title, poster_url },
//   index,
// }: TrendingCardProps) => {
//   return (
//     <Link href={`/movie/${movie_id}`} asChild>
//       <TouchableOpacity className="w-32 relative pl-5">
//         <Image
//           source={{ uri: poster_url }}
//           className="w-32 h-48 rounded-lg"
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
//           className="text-sm font-bold mt-2 text-light-200"
//           numberOfLines={2}
//         >
//           {title}
//         </Text>
//       </TouchableOpacity>
//     </Link>
//   );
// };

// export default TrendingCard;
