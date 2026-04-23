import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { Tabs } from "expo-router";
import React from "react";
import { Image, ImageBackground, Text, View } from "react-native";

const TabIcon = ({ focused, icon, title }: any) => {
  if (focused) {
    return (
      <ImageBackground
        source={images.highlight}
        style={{
          flexDirection: "row",
          minWidth: 90,
          minHeight: 40,
          marginTop: 16,
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 50,
          overflow: "hidden",
          paddingHorizontal: 12,
        }}
      >
        <Image
          source={icon}
          style={{ width: 18, height: 18 }}
          tintColor="#151312"
        />
        <Text
          style={{
            color: "#151312",
            fontSize: 12,
            fontWeight: "600",
            marginLeft: 6,
          }}
        >
          {title}
        </Text>
      </ImageBackground>
    );
  }

  return (
    <View
      style={{
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 16,
      }}
    >
      <Image
        source={icon}
        style={{ width: 20, height: 20 }}
        tintColor="#A8B5DB"
      />
    </View>
  );
};

const _layout = () => {
  return (
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
          height: 54,
          position: "absolute",
          borderWidth: 1,
          borderColor: "#1a1a3a",
          elevation: 10,
          gap: 4,
          paddingHorizontal: 8,
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
          title: "Movies",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.tabMovies} title="Movie" />
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
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.search} title="Search" />
          ),
        }}
      />
    </Tabs>
  );
};

export default _layout;