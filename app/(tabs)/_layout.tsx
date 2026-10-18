import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Image, ImageBackground, Text, View } from "react-native";

const TabIcon = ({ focused, icon, title }: any) => {
  const renderIcon = (size: number, color: string) => {
    if (typeof icon === "function") {
      return icon({ size, color });
    }
    return (
      <Image
        source={icon}
        style={{ width: size, height: size }}
        tintColor={color}
      />
    );
  };

  if (focused) {
    return (
      <ImageBackground
        source={images.highlight}
        style={{
          flexDirection: "row",
          minWidth: 84,
          minHeight: 40,
          marginTop: 16,
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 50,
          overflow: "hidden",
          paddingHorizontal: 10,
        }}
      >
        {renderIcon(18, "#151312")}
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
      {renderIcon(20, "#A8B5DB")}
    </View>
  );
};

export default function TabLayout() {
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
          marginHorizontal: 16,
          marginBottom: 36,
          height: 54,
          position: "absolute",
          borderWidth: 1,
          borderColor: "#1a1a3a",
          elevation: 10,
          gap: 2,
          paddingHorizontal: 6,
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
        name="stats"
        options={{
          title: "Stats",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              icon={({ size, color }: { size: number; color: string }) => (
                <MaterialCommunityIcons
                  name="chart-box"
                  size={size}
                  color={color}
                />
              )}
              title="Stats"
            />
          ),
        }}
      />
    </Tabs>
  );
}
