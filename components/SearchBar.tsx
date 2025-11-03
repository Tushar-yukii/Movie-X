import { View, Text, Image, TextInput } from "react-native";
import React from "react";
import { icons } from "@/constants/icons";
import { TouchableOpacity } from "react-native";
interface props {
  placeholder: string;
  onPress?: () => void;
  value?: string;
  onChangeText?: (text: string) => void; // a fucntion doesn't retrun anything
}

const SearchBar = ({ placeholder, onPress, value, onChangeText }: props) => {
  return (
    <View className="flex-row items-center bg-blue-950 rounded-3xl px-5 py-0.5">
      <Image
        source={icons.search}
        className="size-5"
        resizeMode="contain"
        tintColor="#AB8BFF"
      />
      <TextInput
        onPress={onPress}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor="#A8B5DB"
        className="flex-1 ml-2 text-white"
      />

      <View className="flex-row items-center py-2 mt-1">
        {/* Right-side category  */}
        <TouchableOpacity className="bg-purple-400 px-3 py-3 rounded-2xl">
          <Text className="text-sm font-extrabold text-purple-950">MOVIES</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SearchBar;
