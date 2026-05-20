import { View, Text, Image, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { SvgXml } from "react-native-svg";
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Download } from "lucide-react-native";

export default function TechPackDetails() {
  const { id } = useLocalSearchParams();
  const techPack = useQuery(api.techPacks.get, { id: id as Id<"techPacks"> });
  const analyze = useAction(api.analysis.analyzeAndVectorize);

  const handleRetry = () => {
    analyze({ 
      techPackId: id as Id<"techPacks">, 
      imagePath: "/home/team/shared/MskTechPack/pic-6.jpeg" 
    }).catch(console.error);
  };

  const handleDownload = async () => {
    if (!techPack?.svgContent) return;
    
    try {
      const filename = `techpack-${id}.svg`;
      const fileUri = `${FileSystem.documentDirectory}${filename}`;
      
      await FileSystem.writeAsStringAsync(fileUri, techPack.svgContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert("Sharing not available", "The SVG has been saved but sharing is not supported on this device.");
      }
    } catch (error) {
      console.error("Download error:", error);
      Alert.alert("Error", "Failed to download the SVG file.");
    }
  };

  if (!techPack) return <Text className="p-4 italic text-center mt-10">Loading Tech Pack...</Text>;

  const isProcessing = techPack.status === 'pending' || techPack.status === 'processing';

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-6">
        <View className="flex-row justify-between items-start mb-6">
          <View className="flex-1 mr-4">
            <Text className="text-3xl font-extrabold text-gray-900">{techPack.name}</Text>
            <Text className="text-lg text-gray-600 mt-1">{techPack.description || "No description provided."}</Text>
            <View className={`mt-2 px-3 py-1 rounded-full self-start ${
              techPack.status === 'completed' ? 'bg-green-100' : 
              techPack.status === 'failed' ? 'bg-red-100' : 'bg-blue-100'
            }`}>
              <Text className={`text-xs font-bold uppercase ${
                techPack.status === 'completed' ? 'text-green-700' : 
                techPack.status === 'failed' ? 'text-red-700' : 'text-blue-700'
              }`}>
                {techPack.status}
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            onPress={handleRetry}
            disabled={isProcessing}
            className={`bg-white border border-gray-200 px-4 py-2 rounded-lg shadow-sm ${isProcessing ? 'opacity-50' : ''}`}
          >
            <Text className="text-blue-600 font-bold">{isProcessing ? 'Processing...' : 'Re-analyze'}</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row flex-wrap -mx-2">
          <View className="w-full md:w-1/2 p-2">
            <Text className="text-sm font-bold text-gray-400 uppercase mb-2">Source Image</Text>
            {techPack.imageUrl || techPack.status === 'completed' ? (
              <Image 
                source={{ uri: techPack.imageUrl || "https://placehold.co/600x400/EEE/31343C?text=Source+Photo" }} 
                className="w-full h-80 rounded-2xl bg-white border border-gray-200" 
                resizeMode="contain" 
              />
            ) : (
              <View className="w-full h-80 bg-gray-200 rounded-2xl items-center justify-center border-2 border-dashed border-gray-300">
                <Text className="text-gray-400 font-medium">Image processing...</Text>
              </View>
            )}
          </View>

          <View className="w-full md:w-1/2 p-2">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-sm font-bold text-gray-400 uppercase">Technical Sketch (Vector)</Text>
              {techPack.svgContent && (
                <TouchableOpacity 
                  onPress={handleDownload}
                  className="flex-row items-center bg-blue-50 px-3 py-1 rounded-full"
                >
                  <Download size={14} color="#2563eb" />
                  <Text className="text-xs font-bold text-blue-600 ml-1">Download SVG</Text>
                </TouchableOpacity>
              )}
            </View>
            {techPack.svgContent ? (
              <View className="w-full h-80 rounded-2xl bg-white border border-gray-200 items-center justify-center p-4">
                <SvgXml xml={techPack.svgContent} width="100%" height="100%" />
              </View>
            ) : (
              <View className="w-full h-80 bg-gray-100 rounded-2xl items-center justify-center border-2 border-dashed border-gray-200">
                <Text className="text-gray-400 italic">Generating sketch...</Text>
              </View>
            )}
          </View>
        </View>

        {techPack.specs && (
          <View className="mt-8">
            <Text className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">Technical Specifications</Text>
            
            <View className="mb-6">
              <Text className="text-sm font-bold text-blue-600 uppercase mb-3">Measurements & Fit</Text>
              <View className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {techPack.specs.measurements?.map((m: any, i: number) => (
                  <View key={i} className={`flex-row justify-between p-4 ${i !== 0 ? 'border-t border-gray-50' : ''}`}>
                    <Text className="font-medium text-gray-700">{m.label}</Text>
                    <Text className="text-gray-900 font-bold">{m.value}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-sm font-bold text-blue-600 uppercase mb-3">Construction Points</Text>
              <View className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                {techPack.specs.constructionPoints?.map((cp: any, i: number) => (
                  <View key={i} className="mb-4 last:mb-0">
                    <Text className="font-bold text-gray-800">{cp.point}</Text>
                    <Text className="text-gray-600 leading-5 mt-1">{cp.description}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-sm font-bold text-blue-600 uppercase mb-3">Fabric & Materials</Text>
              <View className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                {techPack.specs.fabrics?.map((f: any, i: number) => (
                  <View key={i} className="mb-2 last:mb-0">
                    <Text className="text-gray-800 font-medium">
                      <Text className="font-bold">{f.type}:</Text> {f.description}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
