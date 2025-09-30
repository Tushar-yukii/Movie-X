import { View, Text, Image } from "react-native";
import React from "react";
import { icons } from "@/constants/icons";

const Profile = () => {
  return (
    <View className="flex-1 px-10" style={{ backgroundColor: "#2e144f" }}>
      <View className="flex justify-start items-start flex-1 gap-6 flex-col">
        <Image source={icons.person} className="size-10" tintColor="#fff" />
        <Text className="text-gray-500 text-base">Profile</Text>
      </View>
    </View>
  );
};

export default Profile;
