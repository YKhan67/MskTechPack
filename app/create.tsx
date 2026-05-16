import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { useMutation, useAction } from "convex/react";
import { api } from "../convex/_generated/api";

export default function CreateTechPack() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const router = useRouter();
  const createTechPack = useMutation(api.techPacks.create);
  const analyze = useAction(api.analysis.analyzeAndVectorize);

  const handleCreate = async () => {
    if (!name) return;
    const techPackId = await createTechPack({ name, description });
    // Trigger analysis in background
    analyze({ 
      techPackId, 
      imagePath: "/home/team/shared/MskTechPack/pic-6.jpeg" 
    }).catch(console.error);
    
    router.replace(`/techpack/${techPackId}`);
  };

  return (
    <View className="flex-1 p-4 bg-white">
      <Text className="text-sm font-bold mb-2">Tech Pack Name</Text>
      <TextInput
        className="border border-gray-300 p-2 rounded mb-4"
        value={name}
        onChangeText={setName}
        placeholder="e.g. Summer T-Shirt"
      />
      <Text className="text-sm font-bold mb-2">Description</Text>
      <TextInput
        className="border border-gray-300 p-2 rounded mb-4 h-24"
        value={description}
        onChangeText={setDescription}
        placeholder="Add details..."
        multiline
      />
      <TouchableOpacity
        className="bg-blue-600 p-4 rounded-lg items-center"
        onPress={handleCreate}
      >
        <Text className="text-white font-bold">Create Tech Pack</Text>
      </TouchableOpacity>
    </View>
  );
}
