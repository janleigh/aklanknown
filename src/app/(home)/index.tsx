import { LoadingSpinner } from "@components/index";
import { Text } from "@components/Text";
import { controllers } from "@lib/api/supabase/controller";
import {
	addBookmark,
	getBookmarkedIds,
	removeBookmark,
	subscribeBookmarks,
} from "@lib/storage/bookmarks";
import type { Location as LocationRecord } from "@lib/types/supabase";
import { useFocusEffect, useRouter } from "expo-router";
<<<<<<< Updated upstream
import { Heart, MapPin, Search } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { FlatList, Image, TextInput, TouchableOpacity, View } from "react-native";
=======
import { Heart, MapPin, Search, Star, ArrowRight, Flame } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Image, RefreshControl, ScrollView, TextInput, TouchableOpacity, View } from "react-native";

type LocationItem = LocationRecord & {
	rating?: number | null;
	review_count?: number | null;
};

const CATEGORIES = [
	{ id: "1", name: "Beaches" },
	{ id: "2", name: "Parks" },
	{ id: "3", name: "Churches" },
	{ id: "4", name: "Historical" },
	{ id: "5", name: "All" },
];
>>>>>>> Stashed changes

export default function HomeScreen() {
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState("");
	const [locations, setLocations] = useState<LocationItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
	const [selectedCategory, setSelectedCategory] = useState<string>("5");
	const [carouselIndex, setCarouselIndex] = useState(0);

	const carouselInterval = useRef<NodeJS.Timeout | null>(null);
	
	// Featured locations for the top carousel
	const featuredLocations = useMemo(() => {
		let filtered = locations;
		if (selectedCategory !== "5") {
			const catMap: Record<string, string[]> = {
				"1": ["beach", "coast", "shore", "boracay", "island"],
				"2": ["park", "garden", "eco", "nature", "reserve"],
				"3": ["church", "chapel", "cathedral", "basilica"],
				"4": ["museum", "historic", "heritage", "old", "monument"],
			};
			const keywords = catMap[selectedCategory] || [];
			filtered = locations.filter((loc) => 
				keywords.some((k) => 
					loc.name.toLowerCase().includes(k) || 
					loc.description_en?.toLowerCase().includes(k) ||
					loc.town.toLowerCase().includes(k)
				)
			);
		}
		return filtered.slice(0, 5);
	}, [locations, selectedCategory]);

	const getGreeting = () => {
		const hour = new Date().getHours();
		if (hour < 12) return "Good morning";
		if (hour < 18) return "Good afternoon";
		return "Good evening";
	};

	// Auto-rotate Carousel
	useEffect(() => {
		if (featuredLocations.length > 1) {
			carouselInterval.current = setInterval(() => {
				setCarouselIndex((prev) => (prev + 1) % featuredLocations.length);
			}, 4000);
		}
		return () => {
			if (carouselInterval.current) clearInterval(carouselInterval.current);
		};
	}, [featuredLocations.length]);

	useFocusEffect(
		useCallback(() => {
			let isMounted = true;
			const loadLocations = async () => {
				setIsLoading(true);
				try {
					const [data, bookmarked] = await Promise.all([
						controllers.location.list({ orderBy: "created_at" }),
						getBookmarkedIds(),
					]);
					if (isMounted) {
<<<<<<< Updated upstream
						setLocations(data);
						setBookmarkedIds(bookmarked);
=======
						setLocations(data as LocationItem[]);
>>>>>>> Stashed changes
					}
				} catch (error) {
					console.error("[Home] Error loading locations:", error);
				} finally {
					if (isMounted) {
						setIsLoading(false);
						setRefreshing(false);
					}
				}
			};
			loadLocations();

			return () => {
				isMounted = false;
			};
		}, []),
	);

<<<<<<< Updated upstream
	useEffect(() => {
		const unsubscribe = subscribeBookmarks(() => {
			void getBookmarkedIds().then((ids) => setBookmarkedIds(ids));
		});

		return unsubscribe;
	}, []);

	const filteredLocations = locations.filter((loc) => {
		const matchesSearch =
			loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			loc.town.toLowerCase().includes(searchQuery.toLowerCase());
		return matchesSearch;
	});
=======
	const onRefresh = () => {
		setRefreshing(true);
		let isMounted = true;
		controllers.location.list({ orderBy: "created_at" })
			.then((data) => { if (isMounted) setLocations(data as LocationItem[]); })
			.finally(() => { if (isMounted) setRefreshing(false); });
		return () => { isMounted = false; };
	};

	const filteredLocations = useMemo(() => {
		return locations.filter((loc) => {
			const matchesSearch =
				loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				loc.town.toLowerCase().includes(searchQuery.toLowerCase());
			
			if (selectedCategory !== "5") {
				const catMap: Record<string, string[]> = {
					"1": ["beach", "coast", "shore", "boracay", "island"],
					"2": ["park", "garden", "eco", "nature", "reserve"],
					"3": ["church", "chapel", "cathedral", "basilica"],
					"4": ["museum", "historic", "heritage", "old", "monument"],
				};
				const keywords = catMap[selectedCategory] || [];
				const matchesCat = keywords.some((k) => 
					loc.name.toLowerCase().includes(k) || 
					loc.description_en?.toLowerCase().includes(k) ||
					loc.town.toLowerCase().includes(k)
				);
				return matchesSearch && matchesCat;
			}
			return matchesSearch;
		});
	}, [locations, searchQuery, selectedCategory]);
>>>>>>> Stashed changes

	const toggleBookmark = async (id: string) => {
		const previous = bookmarkedIds;
		const next = previous.includes(id) ? previous.filter((x) => x !== id) : [...previous, id];
		setBookmarkedIds(next);

		try {
			if (previous.includes(id)) {
				await removeBookmark(id);
			} else {
				await addBookmark(id);
			}
		} catch (error) {
			console.error("[Home] Failed to toggle bookmark:", error);
			setBookmarkedIds(previous);
		}
	};

	// ✅ NEW: Reference Style Card Component
	const renderReferenceCard = ({ item, isFeatured = false }: { item: LocationItem; isFeatured?: boolean }) => {
		const isBookmarked = bookmarkedIds.includes(item.id);
		
		return (
			<TouchableOpacity
				className={`relative overflow-hidden shadow-lg ${isFeatured ? 'mx-5 rounded-3xl h-72' : 'mx-5 rounded-3xl h-64 mb-4'}`}
				onPress={() => router.push(`/location/${item.id}`)}
				activeOpacity={0.9}
			>
				{/* Background Image */}
				{item.banner_image_url ? (
					<Image source={{ uri: item.banner_image_url }} className="absolute inset-0 h-full w-full" resizeMode="cover" />
				) : (
					<View className="absolute inset-0 h-full w-full items-center justify-center bg-gray-100">
						<MapPin size={40} color="#929292" />
					</View>
				)}
				
				{/* Dark Gradient Overlay */}
				<View className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

<<<<<<< Updated upstream
			{/* List */}
			{isLoading ? (
				<View className="flex-1 items-center justify-center">
					<LoadingSpinner size="large" />
				</View>
			) : (
				<FlatList
					data={filteredLocations}
					keyExtractor={(item) => item.id}
					contentContainerStyle={{ padding: 16 }}
					showsVerticalScrollIndicator={false}
					renderItem={({ item }) => (
						<TouchableOpacity
							className="overflow-hidden mb-4 bg-canvas border border-hairline rounded-xl shadow-sm"
							onPress={() => router.push(`/location/${item.id}`)}
							activeOpacity={0.9}
						>
							<View className="relative h-48 bg-surface-soft">
								{item.banner_image_url ? (
									<Image
										source={{ uri: item.banner_image_url }}
										className="h-full w-full"
										resizeMode="cover"
									/>
								) : null}
								<TouchableOpacity
									className="absolute right-3 top-3 items-center justify-center h-8 w-8 bg-canvas/90 rounded-full"
									onPress={(e) => {
										e.stopPropagation();
										void toggleBookmark(item.id);
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
											{item.street}, {item.town}
										</Text>
									</View>
=======
				{/* Content Layer */}
				<View className="absolute bottom-0 left-0 right-0 p-5 flex-row justify-between items-end">
					<View className="flex-1 pr-3">
						{/* Title & Location */}
						<Text className="text-white text-2xl font-bold mb-1" fontName="PlusJakartaSans_700Bold">
							{item.name}
						</Text>
						<View className="flex-row items-center mb-3">
							<MapPin size={14} color="#fff" />
							<Text className="ml-1 text-white/90 text-sm">{item.town}, Aklan</Text>
						</View>

						{/* Badges Row (Glassmorphism) */}
						<View className="flex-row gap-2">
							{item.rating !== null && item.rating !== undefined && (
								<View className="flex-row items-center bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full">
									<Star size={14} color="#FBBF24" fill="#FBBF24" />
									<Text className="ml-1.5 text-white text-xs font-semibold">
										{item.rating.toFixed(1)} ({item.review_count || 0})
									</Text>
>>>>>>> Stashed changes
								</View>
							)}
							
							{/* Secondary Badge (e.g. Trending) */}
							<View className="flex-row items-center bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full">
								<Flame size={14} color="#FF6B35" />
								<Text className="ml-1.5 text-white text-xs font-semibold">Trending</Text>
							</View>
						</View>
					</View>

					{/* Bookmark Button (Top Right) */}
					<TouchableOpacity
						className="absolute top-4 right-4 h-9 w-9 items-center justify-center bg-white/20 backdrop-blur-sm rounded-full"
						onPress={(e) => { e.stopPropagation(); toggleBookmark(item.id); }}
						activeOpacity={0.7}
					>
						<Heart size={18} color={isBookmarked ? "#FF6B35" : "#fff"} fill={isBookmarked ? "#FF6B35" : "none"} />
					</TouchableOpacity>

					{/* Arrow Button (Bottom Right) */}
					<View className="h-10 w-10 items-center justify-center bg-white/20 backdrop-blur-md rounded-full mb-1">
						<ArrowRight size={20} color="#fff" />
					</View>
				</View>
			</TouchableOpacity>
		);
	};

	return (
		<View className="flex-1 bg-gray-50">
			<ScrollView
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF6B35" />
				}
			>
				{/* Clean Header (No Profile/Settings) */}
				<View className="pt-14 pb-2 px-5 bg-white">
					<View className="flex-row items-center justify-between mb-4">
						<View>
							<Text className="text-gray-500 text-base" fontName="PlusJakartaSans_400Regular">{getGreeting()},</Text>
							<Text className="text-[#1a1a1a] text-3xl font-bold mt-1" fontName="PlusJakartaSans_700Bold">
								Discover Aklan
							</Text>
						</View>
					</View>

					{/* Search Bar */}
					<View className="flex-row items-center px-4 py-3 bg-gray-100 rounded-2xl">
						<Search size={20} color="#9CA3AF" />
						<TextInput
							className="flex-1 ml-3 text-gray-800 text-base"
							placeholder="Search destinations..."
							placeholderTextColor="#9CA3AF"
							value={searchQuery}
							onChangeText={setSearchQuery}
						/>
					</View>
				</View>

				{/* Category Pills */}
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					className="py-4"
					contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
				>
					{CATEGORIES.map((cat) => {
						const isActive = selectedCategory === cat.id;
						return (
							<TouchableOpacity
								key={cat.id}
								className={`px-5 py-2.5 rounded-full ${isActive ? "bg-primary" : "bg-white"}`}
								style={{ shadowColor: isActive ? "#FF6B35" : "#000", shadowOpacity: isActive ? 0.3 : 0.1, shadowRadius: isActive ? 8 : 4, elevation: isActive ? 4 : 1 }}
								onPress={() => setSelectedCategory(cat.id)}
								activeOpacity={0.7}
							>
								<Text className={`text-sm font-semibold ${isActive ? "text-white" : "text-gray-600"}`} fontName="PlusJakartaSans_600SemiBold">
									{cat.name}
								</Text>
							</TouchableOpacity>
						);
					})}
				</ScrollView>

				{/* Featured Carousel (Working Auto-Rotate) */}
				<View className="mb-6">
					{featuredLocations.length > 0 && renderReferenceCard({ item: featuredLocations[carouselIndex], isFeatured: true })}
					
					{/* Pagination Dots */}
					{featuredLocations.length > 1 && (
						<View className="flex-row justify-center items-center gap-2 mt-4 mb-2">
							{featuredLocations.map((_, idx) => (
								<TouchableOpacity key={idx} onPress={() => setCarouselIndex(idx)} activeOpacity={0.7} className="px-1">
									<View className={`rounded-full transition-all duration-300 ${carouselIndex === idx ? "w-8 h-2 bg-primary" : "w-2 h-2 bg-gray-300"}`} />
								</TouchableOpacity>
							))}
						</View>
					)}
				</View>

				{/* Section Header */}
				<View className="flex-row items-center justify-between px-5 mb-4">
					<Text className="text-xl text-gray-800 font-bold" fontName="PlusJakartaSans_700Bold">
						{selectedCategory === "5" ? "Popular Destinations" : CATEGORIES.find(c => c.id === selectedCategory)?.name}
					</Text>
					<TouchableOpacity activeOpacity={0.7}>
						<Text className="text-primary text-sm font-semibold">See all</Text>
					</TouchableOpacity>
				</View>

				{/* Locations List */}
				{isLoading ? (
					<View className="flex-1 items-center justify-center py-16">
						<LoadingSpinner size="large" />
					</View>
				) : (
					<FlatList
						data={filteredLocations}
						renderItem={({ item }) => renderReferenceCard({ item })}
						keyExtractor={(item) => item.id}
						scrollEnabled={false}
						contentContainerStyle={{ paddingBottom: 100 }}
						ListEmptyComponent={
							<View className="items-center justify-center px-8 py-16">
								<Text className="mb-2 text-center text-gray-800 text-xl" fontName="PlusJakartaSans_700Bold">
									No locations found
								</Text>
								<Text className="text-center text-gray-500" fontName="PlusJakartaSans_400Regular">
									Try adjusting your search or filters
								</Text>
							</View>
						}
					/>
				)}
			</ScrollView>
		</View>
	);
}