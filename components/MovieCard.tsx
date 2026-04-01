import { Link } from "expo-router";
import { Text, Image, TouchableOpacity, View } from "react-native";
import { memo } from "react"; 

const MovieCard = ({
  id,
  poster_path,
  title,
  release_date,
}: Movie) => {
  return (
    <Link
      href={{
        pathname: "/movies/[id]",
        params: { id: id.toString() },
      }}
      asChild
    >
      <TouchableOpacity className="w-[23%]">
        <Image
          source={{
            uri: poster_path
              ? `https://image.tmdb.org/t/p/w342${poster_path}` 
              : "https://placehold.co/600x400/1a1a1a/FFFFFF.png",
          }}
          className="w-full h-32 rounded-lg"
          resizeMode="cover"
        />
        <Text className="text-xs font-bold text-white mt-1" numberOfLines={1}>
          {title}
        </Text>
        <Text className="text-xs text-slate-500 font-medium mt-1">
          {release_date?.split("-")[0]}
        </Text>
      </TouchableOpacity>
    </Link>
  );
};

// memo means — only re-render this card if its props actually changed
// Without memo: scroll → all 80 cards re-render → lag
// With memo: scroll → only visible cards re-render → smooth
export default memo(MovieCard);