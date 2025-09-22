import { icons } from "@/constants/icons";
import { Link } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Movie = {
  movie_id: number;
  title: string;
  poster_url: string;
  vote_average?: number;
  overview?: string;
};

type TrendingCardProps = {
  movie: Movie;
  index: number;
};

const TrendingCard = ({ movie, index }: TrendingCardProps) => {
  const { movie_id, poster_url, vote_average, title, overview } = movie;

  // console.log("TrendingCard movie:", movie);

  return (
    <View style={styles.card}>
      <Link href={`/movies/${movie_id}`} asChild>
        <TouchableOpacity activeOpacity={0.8}>
          {/* Poster */}
          <Image
            source={{
              uri: poster_url?.startsWith("http")
                ? poster_url
                : `https://image.tmdb.org/t/p/w500${poster_url}`, // fallback for TMDB paths
            }}
            style={styles.image}
          />

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
              <Text style={styles.rating}>
                {vote_average !== null && Number(vote_average) > 0
                  ? Number(vote_average).toFixed(1)
                  : "N/A"}
              </Text>
            </View>
          </View>
          {/* overview */}
          {/* error */}
          <Text style={styles.desc} numberOfLines={3}>
            {overview || "No overview available"}
          </Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  card: {
    padding: 0.5,
    width: 370,
    marginRight: 20,
    paddingRight: 11,
  },
  image: {
    resizeMode: "cover",
    width: "100%",
    height: 197,
    borderRadius: 15,
    marginBottom: 9,
    backgroundColor: "#222", // fallback background if poster is missing
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 14,
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
  desc: {
    color: "white",
    fontSize: 12,
    marginTop: 6,
  },
});

export default TrendingCard;

// sample code
// TrendingCard.tsx
// import { icons } from "@/constants/icons";
// import { Link } from "expo-router";
// import React from "react";
// import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// export type Movie = {
//   id: number; // match TMDB API (usually it's "id", not "movie_id")
//   title: string;
//   poster_path: string | null;
//   vote_average?: number | null;
//   overview?: string | null;
// };

// type TrendingCardProps = {
//   movie: Movie;
//   index?: number;
// };

// const TrendingCard = ({ movie }: TrendingCardProps) => {
//   const { id, poster_path, vote_average, title, overview } = movie;

//   return (
//     <View style={styles.card}>
//       <Link href={`/movies/${id}`} asChild>
//         <TouchableOpacity activeOpacity={0.8}>
//           {/* Poster */}
//           <Image
//             source={{
//               uri: poster_path?.startsWith("http")
//                 ? poster_path
//                 : `https://image.tmdb.org/t/p/w500${poster_path}`,
//             }}
//             style={styles.image}
//           />

//           {/* Title + Rating */}
//           <View style={styles.row}>
//             <Text style={styles.title} numberOfLines={1}>
//               {title || "Untitled"}
//             </Text>

//             <View style={styles.ratingBox}>
//               <Image source={icons.star} style={styles.starIcon} resizeMode="contain" />
//               <Text style={styles.rating}>
//                 {vote_average && Number(vote_average) > 0
//                   ? Number(vote_average).toFixed(1)
//                   : "N/A"}
//               </Text>
//             </View>
//           </View>

//           {/* Overview */}
//           <Text style={styles.desc} numberOfLines={3}>
//             {overview || "No overview available"}
//           </Text>
//         </TouchableOpacity>
//       </Link>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   card: {
//     padding: 0.5,
//     width: 370,
//     marginRight: 20,
//     paddingRight: 11,
//   },
//   image: {
//     resizeMode: "cover",
//     width: "100%",
//     height: 197,
//     borderRadius: 15,
//     marginBottom: 9,
//     backgroundColor: "#222",
//   },
//   row: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   title: {
//     color: "#fff",
//     fontWeight: "900",
//     fontSize: 14,
//     flex: 1,
//   },
//   ratingBox: {
//     backgroundColor: "#6C4EE6",
//     paddingHorizontal: 8,
//     paddingVertical: 3,
//     borderRadius: 8,
//     marginLeft: 8,
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   starIcon: {
//     width: 14,
//     height: 14,
//     marginRight: 4,
//   },
//   rating: {
//     color: "white",
//     fontSize: 12,
//     fontWeight: "bold",
//   },
//   desc: {
//     color: "white",
//     fontSize: 12,
//     marginTop: 6,
//   },
// });

// export default TrendingCard;
