import { useState } from "react";
import { View, ScrollView, TouchableOpacity, TextInput, Image } from "react-native";
import { Search, SlidersHorizontal, Star, MapPin, Navigation } from "lucide-react-native";
import { Text } from "@/components/Text";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";

const CATEGORIES = ["Beaches", "Parks", "Churches", "Historical", "Hotels"];

const LOCATIONS = [
	{ id: "1", name: "Boracay White Beach", location: "Malay, Aklan", rating: 4.9, reviews: 1245, image: "https://picsum.photos/seed/boracay/400/300", x: 20, y: 30 },
	{ id: "2", name: "Jawili Falls", location: "Tangalan, Aklan", rating: 4.7, reviews: 328, image: "https://picsum.photos/seed/jawili/400/300", x: 45, y: 25 },
	{ id: "3", name: "Hinugtan Beach", location: "Buruanga, Aklan", rating: 4.8, reviews: 156, image: "https://picsum.photos/seed/hinugtan/400/300", x: 70, y: 40 },
	{ id: "4", name: "Bakhawan Eco-Park", location: "Kalibo, Aklan", rating: 4.6, reviews: 89, image: "https://picsum.photos/seed/bakhawan/400/300", x: 30, y: 60 },
];

export default function MapsScreen() {
	const router = useRouter();
	const params = useLocalSearchParams();
	const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

	useEffect(() => {
		if (params.locationId) {
			setSelectedLocation(params.locationId as string);
		}
	}, [params]);

	const selectedData = LOCATIONS.find((l) => l.id === selectedLocation);

	return (
		<View className="flex-1 bg-canvas">
			{/* Header */}
			<View className="pt-12 pb-3 px-4 bg-canvas border-b border-hairline z-20">
				<Text className="text-2xl text-ink mb-3" fontName="PlusJakartaSans_700Bold">Maps</Text>

				{/* Search & Filter */}
				<View className="flex-row items-center gap-2 mb-3">
					<View className="flex-1 flex-row items-center bg-surface-soft rounded-full px-4 py-2.5 border border-hairline">
						<Search size={18} color="#929292" />
						<TextInput className="flex-1 ml-2 text-ink text-sm" placeholder="Where to in Aklan?" placeholderTextColor="#929292" />
					</View>
					<TouchableOpacity className="bg-primary/10 p-2.5 rounded-full" activeOpacity={0.7}>
						<SlidersHorizontal size={18} color="#ff385c" />
					</TouchableOpacity>
				</View>

				{/* Categories */}
				<ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-1 px-1">
					{CATEGORIES.map((cat) => (
						<TouchableOpacity key={cat} className="bg-surface-soft border border-hairline px-4 py-1.5 rounded-full mr-2" activeOpacity={0.7}>
							<Text className="text-ink text-xs font-semibold" fontName="PlusJakartaSans_600SemiBold">{cat}</Text>
						</TouchableOpacity>
					))}
				</ScrollView>
			</View>

			{/* Map Area */}
			<View className="flex-1 bg-[#E8F0FE] relative overflow-hidden">
				{/* Subtle Map Grid Pattern */}
				<View className="absolute inset-0 opacity-15">
					{[...Array(8)].map((_, i) => (
						<View key={`h-${i}`} className="absolute left-0 right-0 border-t border-blue-400" style={{ top: `${i * 12.5}%` }} />
					))}
					{[...Array(8)].map((_, i) => (
						<View key={`v-${i}`} className="absolute top-0 bottom-0 border-l border-blue-400" style={{ left: `${i * 12.5}%` }} />
					))}
				</View>

				{/* Location Pins */}
				{LOCATIONS.map((loc) => (
					<TouchableOpacity
						key={loc.id}
						className="absolute"
						style={{ left: `${loc.x}%`, top: `${loc.y}%`, transform: [{ translateX: -14 }, { translateY: -28 }] }}
						onPress={() => setSelectedLocation(loc.id)}
						activeOpacity={0.8}
					>
						<View className={`w-7 h-7 rounded-full items-center justify-center shadow-md border-2 ${selectedLocation === loc.id ? "bg-primary border-white" : "bg-canvas border-primary/30"}`}>
							<MapPin size={14} color={selectedLocation === loc.id ? "#fff" : "#ff385c"} />
						</View>
					</TouchableOpacity>
				))}

				{/* My Location Button */}
				<TouchableOpacity className="absolute bottom-4 right-4 bg-canvas p-3 rounded-full shadow-lg border border-hairline" activeOpacity={0.7}>
					<Navigation size={20} color="#ff385c" />
				</TouchableOpacity>
			</View>

			{/* Bottom Details Card (Static) - Uses pb-safe to not overlap with tabs */}
			<View className="bg-canvas border-t border-hairline px-4 py-3 pb-safe shadow-lg z-20">
				{selectedData ? (
					<View className="flex-row items-center gap-3">
						<View className="w-14 h-14 bg-surface-soft rounded-xl overflow-hidden border border-hairline">
							<Image source={{ uri: selectedData.image }} className="w-full h-full" resizeMode="cover" />
						</View>
						<View className="flex-1">
							<Text className="text-base text-ink font-bold mb-0.5" fontName="PlusJakartaSans_700Bold">{selectedData.name}</Text>
							<View className="flex-row items-center gap-1 mb-0.5">
								<Star size={12} color="#FBBF24" fill="#FBBF24" />
								<Text className="text-xs text-ink font-semibold" fontName="PlusJakartaSans_600SemiBold">{selectedData.rating}</Text>
								<Text className="text-xs text-muted" fontName="PlusJakartaSans_400Regular">({selectedData.reviews})</Text>
							</View>
							<Text className="text-xs text-muted" fontName="PlusJakartaSans_400Regular">{selectedData.location}</Text>
						</View>
						<TouchableOpacity className="bg-primary px-4 py-2 rounded-lg" onPress={() => router.push(`/location/${selectedData.id}` as any)} activeOpacity={0.8}>
							<Text className="text-white text-xs font-semibold" fontName="PlusJakartaSans_600SemiBold">View</Text>
						</TouchableOpacity>
					</View>
				) : (
					<View className="items-center justify-center py-2">
						<Text className="text-muted text-sm" fontName="PlusJakartaSans_400Regular">Tap a location pin to view details</Text>
					</View>
				)}
			</View>
		</View>
	);
}