import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { Link, useRouter } from "expo-router";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Plus, Camera } from "lucide-react-native";

export default function Home() {
  const techPacks = useQuery(api.techPacks.list);
  const router = useRouter();

  return (
    <View className="flex-1 bg-gray-100 p-4">
      <Text className="text-2xl font-bold mb-4">My Tech Packs</Text>
      
      <FlatList
        data={techPacks}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <Link href={`/techpack/${item._id}`} asChild>
            <TouchableOpacity className="bg-white p-4 mb-2 rounded-lg shadow-sm border border-gray-200">
              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="text-lg font-bold text-gray-800">{item.name}</Text>
                  <Text className="text-gray-500 text-sm">{new Date(item.createdAt).toLocaleDateString()}</Text>
                </View>
                <View className={`px-2 py-1 rounded ${
                  item.status === 'completed' ? 'bg-green-100' : 'bg-blue-100'
                }`}>
                  <Text className={`text-xs font-bold ${
                    item.status === 'completed' ? 'text-green-700' : 'text-blue-700'
                  }`}>{item.status.toUpperCase()}</Text>
                </View>
              </View>
            </TouchableOpacity>
          </Link>
        )}
        ListEmptyComponent={
          <View className="items-center mt-20">
            <Text className="text-gray-400 italic">No tech packs yet.</Text>
            <TouchableOpacity 
              onPress={() => router.push("/create")}
              className="mt-4 bg-blue-600 px-6 py-2 rounded-full"
            >
              <Text className="text-white font-bold">Create First Tech Pack</Text>
            </TouchableOpacity>
          </View>
        }
      />
      
      <View className="absolute bottom-8 right-8 flex-row">
        <Link href="/create" asChild>
          <TouchableOpacity className="bg-blue-600 p-4 rounded-full shadow-lg">
            <Plus color="white" size={24} />
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}
