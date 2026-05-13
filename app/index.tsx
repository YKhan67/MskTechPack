import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Plus } from "lucide-react-native";

export default function Home() {
  const techPacks = useQuery(api.techPacks.list);

  return (
    <View className="flex-1 bg-gray-100 p-4">
      <FlatList
        data={techPacks}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <Link href={`/techpack/${item._id}`} asChild>
            <TouchableOpacity className="bg-white p-4 mb-2 rounded-lg shadow-sm">
              <Text className="text-lg font-bold">{item.name}</Text>
              <Text className="text-gray-500">{item.status}</Text>
            </TouchableOpacity>
          </Link>
        )}
        ListEmptyComponent={<Text className="text-center mt-10">No tech packs yet.</Text>}
      />
      <Link href="/create" asChild>
        <TouchableOpacity className="absolute bottom-8 right-8 bg-blue-600 p-4 rounded-full shadow-lg">
          <Plus color="white" size={24} />
        </TouchableOpacity>
      </Link>
    </View>
  );
}
