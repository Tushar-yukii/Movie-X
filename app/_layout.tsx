import { Stack } from "expo-router";
import "./global.css";
import { StatusBar } from "react-native";

export default function RootLayout() {
  return (
    <>
    {/* hide the StatusBar */}
    <StatusBar hidden={true} /> 
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="movies/[id]" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
