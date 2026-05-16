import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export default function BrandAssets() {
  const brands = useQuery(api.brands.list);

  return (
    <View className="flex-1 bg-white p-4">
      <FlatList
        data={brands}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View className="bg-gray-50 p-4 mb-2 rounded-lg">
            <Text className="text-lg font-bold">{item.name}</Text>
            <View className="flex-row mt-2">
              {item.colors.map((color, index) => (
                <View key={index} style={{ backgroundColor: color }} className="w-8 h-8 rounded-full mr-2 border border-gray-200" />
              ))}
            </View>
          </View>
        )}
        ListEmptyComponent={<Text className="text-center mt-10">No brand assets yet.</Text>}
      />
    </View>
  );
}
