
import { useState } from "react";
import { View, ScrollView, FlatList, Image, TouchableOpacity, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { Search, Heart, MapPin, Star } from "lucide-react-native";
import { Text } from "@/components/Text";
import type { Location } from "@/types";

const CATEGORIES = ["All", "Beaches", "Nature", "Dining", "Hotels"];

const LOCATIONS: Location[] = [
	{ id: "1", name: "Boracay White Beach", location: "Malay, Aklan", distance: "1.2 km", rating: 4.9, image: "https://picsum.photos/seed/boracay/600/400", category: "Beaches" },
	{ id: "2", name: "Jawili Falls", location: "Tangalan, Aklan", distance: "8.5 km", rating: 4.7, image: "https://picsum.photos/seed/jawili/600/400", category: "Nature" },
	{ id: "3", name: "Hinugtan Beach", location: "Buruanga, Aklan", distance: "12.0 km", rating: 4.8, image: "https://picsum.photos/seed/hinugtan/600/400", category: "Beaches" },
	{ id: "4", name: "Bakhawan Eco-Park", location: "Kalibo, Aklan", distance: "3.5 km", rating: 4.6, image: "https://picsum.photos/seed/bakhawan/600/400", category: "Nature" },
];

export default function HomeScreen() {
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState("");
	const [activeCategory, setActiveCategory] = useState("All");
	const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

	const filteredLocations = LOCATIONS.filter((loc) => {
		const matchesSearch = loc.name.toLowerCase().includes(searchQuery.toLowerCase()) || loc.location.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesCategory = activeCategory === "All" || loc.category === activeCategory;
		return matchesSearch && matchesCategory;
	});

	const toggleBookmark = (id: string) => {
		setBookmarkedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
	};

	return (
		<View className="flex-1 bg-surface-soft">
			{/* Header */}
			<View className="px-4 pt-12 pb-4 bg-canvas border-b border-hairline">
				<Text className="text-2xl text-ink mb-4" fontName="PlusJakartaSans_700Bold">Explore Aklan</Text>
				
				{/* Search */}
				<View className="flex-row items-center bg-canvas rounded-full px-4 py-3 shadow-sm border border-hairline mb-4">
					<Search size={20} color="#929292" />
					<TextInput
						className="flex-1 ml-3 text-ink"
						placeholder="Where to in Aklan?"
						placeholderTextColor="#929292"
						value={searchQuery}
						onChangeText={setSearchQuery}
					/>
				</View>

				{/* Categories */}
				<ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-4 px-4">
					{CATEGORIES.map((cat) => (
						<TouchableOpacity
							key={cat}
							className={`px-5 py-2 rounded-full mr-3 ${activeCategory === cat ? "bg-primary" : "bg-canvas border border-hairline"}`}
							onPress={() => setActiveCategory(cat)}
							activeOpacity={0.7}
						>
							<Text className={`font-semibold ${activeCategory === cat ? "text-on-primary" : "text-ink"}`} fontName="PlusJakartaSans_600SemiBold">
								{cat}
							</Text>
						</TouchableOpacity>
					))}
				</ScrollView>
			</View>

			{/* List */}
			<FlatList
				data={filteredLocations}
				keyExtractor={(item) => item.id}
				contentContainerStyle={{ padding: 16 }}
				showsVerticalScrollIndicator={false}
				renderItem={({ item }) => (
					<TouchableOpacity
						className="bg-canvas rounded-xl overflow-hidden mb-4 shadow-sm border border-hairline"
						onPress={() => router.push(`/location/${item.id}` as any)}
						activeOpacity={0.9}
					>
						<View className="relative h-48">
							<Image source={{ uri: item.image }} className="w-full h-full" resizeMode="cover" />
							<View className="absolute top-3 left-3 bg-scrim/50 px-3 py-1 rounded-full">
								<Text className="text-on-dark text-xs font-medium" fontName="PlusJakartaSans_500Medium">{item.distance}</Text>
							</View>
							<TouchableOpacity
								className="absolute top-3 right-3 w-8 h-8 bg-canvas/90 rounded-full items-center justify-center"
								onPress={(e) => { e.stopPropagation(); toggleBookmark(item.id); }}
								activeOpacity={0.7}
							>
								<Heart size={16} color={bookmarkedIds.includes(item.id) ? "#ff385c" : "#929292"} fill={bookmarkedIds.includes(item.id) ? "currentColor" : "none"} />
							</TouchableOpacity>
						</View>
						<View className="p-4">
							<Text className="text-lg text-ink mb-1" fontName="PlusJakartaSans_700Bold">{item.name}</Text>
							<View className="flex-row items-center justify-between">
								<View className="flex-row items-center">
									<MapPin size={14} color="#929292" />
									<Text className="text-muted ml-1 text-sm" fontName="PlusJakartaSans_400Regular">{item.location}</Text>
								</View>
								<View className="flex-row items-center bg-primary/10 px-2 py-1 rounded-full">
									<Star size={12} color="#FBBF24" fill="#FBBF24" />
									<Text className="text-ink font-semibold text-sm ml-1" fontName="PlusJakartaSans_600SemiBold">{item.rating}</Text>
								</View>
							</View>
						</View>
					</TouchableOpacity>
				)}
				ListEmptyComponent={
					<View className="items-center justify-center py-12 px-8">
						<Text className="text-xl text-ink mb-2 text-center" fontName="PlusJakartaSans_700Bold">No locations found</Text>
						<Text className="text-muted text-center" fontName="PlusJakartaSans_400Regular">Try adjusting your search or filters</Text>
					</View>
				}
			/>
		</View>
	);
}