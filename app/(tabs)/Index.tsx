import SearchBar from "@/components/SearchBar";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { fetchMovies } from "@/services/api";
import useFetch from "@/services/useFetch";
import MovieCard from "@/components/MovieCard";
import { getTrendingMovies } from "@/services/appwrite";
import TrendingCard from "@/components/TrendingCard";
// import { Ionicons } from "@expo/vector-icons";
// import { TouchableOpacity } from "react-native";
export default function index() {
  const router = useRouter();

  const {
    data: trendingMovies,
    loading: trendingLoading,
    error: trendingError,
  } = useFetch(getTrendingMovies);

  const {
    data: movies,
    loading: moviesLoading,
    error: moviesError,
  } = useFetch(() => fetchMovies({ query: "" }));

  return (
    <View style={styles.homestyle}>
     

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ minHeight: "100%", paddingBottom: 10 }}
      >
       {/* REQURID CHANGES */}
        <Image source={icons.logo} style={styles.logo}/>



        {moviesLoading || trendingLoading ? (
          <ActivityIndicator
            size="large"
            color="#0000ff"
            className="mt-10 self-center"
          />
        ) : moviesError || trendingError ? (
          <Text>Error: {moviesError?.message || trendingError?.message}</Text>
        ) : (
          <View className="flex-1 mt-5">
            <SearchBar
              onPress={() => {
                router.push("/search");
              }}
              placeholder="Search across 2000+ Movies..."
            />
            <View className=""></View>

            {trendingMovies && (
              <View className="mt-10">
                <Text className="text-lg text-white font-bold mb-3 ml-3">
                  Treading Movies
                </Text>

                {/* change */}
                <FlatList
                  horizontal
                  // pagingEnabled //  makes it snap like a carousel
                  showsHorizontalScrollIndicator={false}
                  data={trendingMovies}
                  renderItem={({ item, index }) => (
                    <TrendingCard movie={item} index={index} />
                  )}
                  keyExtractor={(item, index) => `${item.id}-${index}`}
                  contentContainerStyle={{ paddingHorizontal: 16 }}
                />
              </View>
            )}

            <>
              <Text className="text-lg text-white font-bold mt-5 mb-3 ml-1">
                Latest Movies
              </Text>

              <FlatList
                data={movies}
                renderItem={({ item }) => <MovieCard {...item} />}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                numColumns={3}
                columnWrapperStyle={{
                  justifyContent: "flex-start",
                  gap: 20,
                  paddingRight: 5,
                  marginBottom: 10,
                }}
                className="mt-2 pb-32"
                scrollEnabled={false}
              />
            </>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  homestyle: {
    flex: 1,
    backgroundColor: "#2e144f",
  },
 logo:{
  width: 55,
  height: 65,
  marginTop: 10,
  // marginLeft: 1,
  marginRight: 100,


 }

});
