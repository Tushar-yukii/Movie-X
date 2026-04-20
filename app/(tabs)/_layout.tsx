import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { Tabs } from "expo-router";
import React from "react";
import { Image, ImageBackground, Text, View, Platform } from "react-native";
import { BlurView } from "expo-blur";

// const TabIcon = ({ focused, icon, title }: any) => {
//   if (focused) {
//     return (
//       <ImageBackground
//         source={images.highlight}
//         imageStyle={{ resizeMode: "stretch" }}
//         className="flex flex-row px-4 py-2 justify-center items-center rounded-full overflow-hidden"
//       >
//         <Image source={icon} tintColor="#151312" className="size-5" />
//         <Text className="text-secondary text-base font-semibold ml-2">
//           {title}
//         </Text>
//       </ImageBackground>
//     );
//   }

//   return (
//     <View className="justify-center items-center">
//       <Image source={icon} tintColor="#A8B5DB" className="size-5" />
//     </View>
//   );
// };
const TabIcon = ({ focused, icon, title }: any) => {
  if (focused) {
    return (
      <ImageBackground
        source={images.highlight}
        className="flex flex-row w-full flex-1 min-[112px] min-h-16 mt-4 justify-center items-center rounded-full overflow-hidden"
      >
        <Image source={icon} tintColor="#151312" className="size-5" />
        <Text className="text-secondary text-base font-semibold ml-2">
          {title}
        </Text>
      </ImageBackground>
    );
  }
  return (
    <View className="size-full justify-center items-center mt-4 rounded-full">
      <Image source={icon} tintColor="#A8B5DB" className="size-5" />
    </View>
  );
};
const _layout = () => {
  return (
    // <Tabs
    //   screenOptions={{
    //     tabBarShowLabel: false,
    //     headerShown: false,
    //     tabBarStyle: {
    //       position: "absolute",
    //       bottom: Platform.OS === "ios" ? 28 : 30,
    //       left: 20,
    //       right: 20,
    //       height: 60,
    //       borderRadius: 35,
    //       overflow: "hidden",
    //       borderWidth: 1,
    //       borderColor: "rgba(255,255,255,0.1)",
    //       backgroundColor: "transparent",
    //       elevation: 0, // no harsh shadows on Android
    //     },
    //     tabBarBackground: () => (
    //       <BlurView
    //         intensity={70}
    //         tint="dark"
    //         style={{
    //           flex: 1,
    //           borderRadius: 35,
    //           backgroundColor: "rgba(20,20,35,0.5)",
    //         }}
    //       />
    //     ),
    //   }}
    // >
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarItemStyle: {
          width: "100%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        },
        tabBarStyle: {
          backgroundColor: "#0f0D23",
          borderRadius: 50,
          marginHorizontal: 20,
          marginBottom: 36,
          height: 52,
          position: "absolute",
          borderWidth: 1,
          borderColor: "#0f0d23",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.tabHome} title="Home" />
          ),
        }}
      />

      <Tabs.Screen
        name="movieHome"
        options={{
          title: "Series",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.tabSeries} title="Series" />
          ),
        }}
      />

      <Tabs.Screen
        name="movies"
        options={{
          title: "movies",
           headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.tabMovies} title="Movies" />
          ),
        }}
      />
      <Tabs.Screen
        name="anime"
        options={{
          title: "Anime",
           headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.tabAnime} title="Anime" />
          ),
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.search} title="Search" />
          ),
        }}
      />
    </Tabs>
  );
};

export default _layout;
