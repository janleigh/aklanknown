import { useRouter } from "expo-router";
import { Heart, MapPin, Search, Star } from "lucide-react-native";
import { useState } from "react";
import { FlatList, Image, ScrollView, TextInput, TouchableOpacity, View } from "react-native";
import { Text } from "@/components/Text";
import type { Location } from "@/types";

const CATEGORIES = ["All", "Beaches", "Nature", "Dining", "Hotels"];

const LOCATIONS: Location[] = [
	{
		id: "1",
		name: "Boracay White Beach",
		location: "Malay, Aklan",
		distance: "1.2 km",
		rating: 4.9,
		image: "https://picsum.photos/seed/boracay/600/400",
		category: "Beaches",
	},
	{
		id: "2",
		name: "Jawili Falls",
		location: "Tangalan, Aklan",
		distance: "8.5 km",
		rating: 4.7,
		image: "https://picsum.photos/seed/jawili/600/400",
		category: "Nature",
	},
	{
		id: "3",
		name: "Hinugtan Beach",
		location: "Buruanga, Aklan",
		distance: "12.0 km",
		rating: 4.8,
		image: "https://picsum.photos/seed/hinugtan/600/400",
		category: "Beaches",
	},
	{
		id: "4",
		name: "Bakhawan Eco-Park",
		location: "Kalibo, Aklan",
		distance: "3.5 km",
		rating: 4.6,
		image: "https://picsum.photos/seed/bakhawan/600/400",
		category: "Nature",
	},
];

export default function HomeScreen() {
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState("");
	const [activeCategory, setActiveCategory] = useState("All");
	const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

	const filteredLocations = LOCATIONS.filter((loc) => {
		const matchesSearch =
			loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			loc.location.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesCategory = activeCategory === "All" || loc.category === activeCategory;
		return matchesSearch && matchesCategory;
	});

	const toggleBookmark = (id: string) => {
		setBookmarkedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
	};

	return (
		<View className="flex-1 bg-surface-soft">
			{/* Header */}
			<View className="pb-4 pt-12 px-4 bg-canvas border-b border-hairline">
				{/* <Text className="mb-4 text-2xl text-ink" fontName="PlusJakartaSans_700Bold">
					Explore Aklan
				</Text> */}
				{/* Search */}
				<View className="flex-row items-center mb-4 px-4 py-3 bg-canvas border border-hairline rounded-full shadow-sm">
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
				<ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 -mx-4">
					{CATEGORIES.map((cat) => (
						<TouchableOpacity
							key={cat}
							className={`px-5 py-2 rounded-full mr-3 ${activeCategory === cat ? "bg-primary" : "bg-canvas border border-hairline"}`}
							onPress={() => setActiveCategory(cat)}
							activeOpacity={0.7}
						>
							<Text
								className={`font-semibold ${activeCategory === cat ? "text-on-primary" : "text-ink"}`}
								fontName="PlusJakartaSans_600SemiBold"
							>
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
						className="overflow-hidden mb-4 bg-canvas border border-hairline rounded-xl shadow-sm"
						onPress={() => router.push(`/location/${item.id}` as any)}
						activeOpacity={0.9}
					>
						<View className="relative h-48">
							<Image source={{ uri: item.image }} className="h-full w-full" resizeMode="cover" />
							<View className="absolute left-3 top-3 px-3 py-1 bg-scrim/50 rounded-full">
								<Text
									className="font-medium text-on-dark text-xs"
									fontName="PlusJakartaSans_500Medium"
								>
									{item.distance}
								</Text>
							</View>
							<TouchableOpacity
								className="absolute right-3 top-3 items-center justify-center h-8 w-8 bg-canvas/90 rounded-full"
								onPress={(e) => {
									e.stopPropagation();
									toggleBookmark(item.id);
								}}
								activeOpacity={0.7}
							>
								<Heart
									size={16}
									color={bookmarkedIds.includes(item.id) ? "#ff385c" : "#929292"}
									fill={bookmarkedIds.includes(item.id) ? "currentColor" : "none"}
								/>
							</TouchableOpacity>
						</View>
						<View className="p-4">
							<Text className="mb-1 text-ink text-lg" fontName="PlusJakartaSans_700Bold">
								{item.name}
							</Text>
							<View className="flex-row items-center justify-between">
								<View className="flex-row items-center">
									<MapPin size={14} color="#929292" />
									<Text className="ml-1 text-muted text-sm" fontName="PlusJakartaSans_400Regular">
										{item.location}
									</Text>
								</View>
								<View className="flex-row items-center px-2 py-1 bg-primary/10 rounded-full">
									<Star size={12} color="#FBBF24" fill="#FBBF24" />
									<Text
										className="ml-1 font-semibold text-ink text-sm"
										fontName="PlusJakartaSans_600SemiBold"
									>
										{item.rating}
									</Text>
								</View>
							</View>
						</View>
					</TouchableOpacity>
				)}
				ListEmptyComponent={
					<View className="items-center justify-center px-8 py-12">
						<Text className="mb-2 text-center text-ink text-xl" fontName="PlusJakartaSans_700Bold">
							No locations found
						</Text>
						<Text className="text-center text-muted" fontName="PlusJakartaSans_400Regular">
							Try adjusting your search or filters
						</Text>
					</View>
				}
			/>
		</View>
	);
}
