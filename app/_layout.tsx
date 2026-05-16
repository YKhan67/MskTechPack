import "../global.css";
import { Stack } from "expo-router";
import { ConvexProvider, ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL || "https://placeholder.convex.cloud");

export default function RootLayout() {
  return (
    <ConvexProvider client={convex}>
      <Stack>
        <Stack.Screen name="index" options={{ title: "My Tech Packs" }} />
        <Stack.Screen name="create" options={{ title: "New Tech Pack" }} />
        <Stack.Screen name="brand" options={{ title: "Brand Assets" }} />
        <Stack.Screen name="techpack/[id]" options={{ title: "Tech Pack Details" }} />
      </Stack>
    </ConvexProvider>
  );
}
