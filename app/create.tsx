import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, Alert } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { useMutation, useAction } from "convex/react";
import { api } from "../convex/_generated/api";
import * as ImagePicker from 'expo-image-picker';

export default function CreateTechPack() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();
  const createTechPack = useMutation(api.techPacks.create);
  const analyze = useAction(api.analysis.analyzeAndVectorize);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("You've refused to allow this app to access your camera!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const generateUploadUrl = useMutation(api.techPacks.generateUploadUrl);

  const handleCreate = async () => {
    if (!name) {
      Alert.alert("Required", "Please enter a name for your Tech Pack.");
      return;
    }
    if (isCreating) return;

    setIsCreating(true);
    
    try {
      let storageId = null;
      if (image) {
        try {
          // 1. Get upload URL
          const postUrl = await generateUploadUrl();

          // 2. Fetch the image and upload it
          const response = await fetch(image);
          const blob = await response.blob();

          const result = await fetch(postUrl, {
            method: "POST",
            headers: { "Content-Type": blob.type || "image/jpeg" },
            body: blob,
          });

          if (!result.ok) throw new Error("Upload failed");

          const json = await result.json();
          storageId = json.storageId;
        } catch (e) {
          console.error("Upload failed:", e);
          // We allow proceeding without image if upload fails, but alert the user
          Alert.alert("Upload Error", "Failed to upload image. Proceeding with name and description only.");
        }
      }

      const techPackId = await createTechPack({
        name,
        description,
        imageUrl: storageId || undefined
      });

      // Trigger analysis - fire and forget
      analyze({
        techPackId,
        storageId: storageId || undefined,
        imagePath: !storageId ? "/home/team/shared/MskTechPack/pic-6.jpeg" : undefined
      }).catch(err => console.error("Analysis trigger error:", err));

      router.replace(`/techpack/${techPackId}`);
    } catch (e) {
      console.error("Creation failed:", e);
      Alert.alert("Error", "Could not create Tech Pack. Please check your connection to Convex.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <ScrollView className="flex-1 p-4 bg-white">
      <Text className="text-xl font-bold mb-6">New Tech Pack</Text>
      
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

      <Text className="text-sm font-bold mb-2">Garment Photo</Text>
      {image && (
        <Image source={{ uri: image }} className="w-full h-48 rounded-lg mb-4" />
      )}
      
      <View className="flex-row justify-between mb-6">
        <TouchableOpacity
          className="bg-gray-200 p-4 rounded-lg flex-1 mr-2 items-center"
          onPress={pickImage}
        >
          <Text className="text-gray-800 font-bold">Gallery</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          className="bg-gray-200 p-4 rounded-lg flex-1 ml-2 items-center"
          onPress={takePhoto}
        >
          <Text className="text-gray-800 font-bold">Camera</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity
        className={`bg-blue-600 p-4 rounded-lg items-center mb-10 ${isCreating ? 'opacity-50' : ''}`}
        onPress={handleCreate}
        disabled={isCreating}
      >
        <Text className="text-white font-bold">
          {isCreating ? "Creating..." : "Create & Analyze"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
