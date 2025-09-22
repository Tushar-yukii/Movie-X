// // TrendingMoviesCarousel.tsx
// import React from "react";
// import { Dimensions, View } from "react-native";
// import Carousel from "react-native-reanimated-carousel";
// import TrendingCard, { Movie } from "./TrendingCard";

// const { width } = Dimensions.get("window");

// type Props = {
//   movies: Movie[];
// };

// const TrendingMoviesCarousel = ({ movies }: Props) => {
//   return (
//     <View style={{ flex: 1, alignItems: "center" }}>
//       <Carousel
//         loop
//         width={width}
//         height={340}
//         autoPlay
//         autoPlayInterval={1000}
//         data={movies}
//         scrollAnimationDuration={800}
//         renderItem={({ item }) => <TrendingCard movie={item} />}
//       />
//     </View>
//   );
// };

// export default TrendingMoviesCarousel;
 error