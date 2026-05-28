import { LoadingSpinner } from "@components/index";
import { Text } from "@components/Text";
import { controllers } from "@lib/api/supabase/controller";
import { supabase } from "@lib/api/supabase/supabase"; // ✅ Fixed import
import type { Location as LocationRecord } from "@lib/types/supabase";
import { useFocusEffect, useRouter } from "expo-router";
import { Flame, Heart, MapPin, Search, Star } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { Dimensions, FlatList, Image, RefreshControl, ScrollView, TextInput, TouchableOpacity, View } from "react-native";

type LocationItem = LocationRecord & {
	rating?: number | null;
	review_count?: number | null;
	category?: string;
};

const { width: screenWidth } = Dimensions.get("window");
const CARD_WIDTH = screenWidth - 40;

export default function HomeScreen() {
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState("");
	const [locations, setLocations] = useState<LocationItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
	const [selectedCategory, setSelectedCategory] = useState<string>("all");
	const [carouselIndex, setCarouselIndex] = useState(0);
	const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([
		{ id: "all", name: "All" },
		{ id: "beaches", name: "Beaches" },
		{ id: "parks", name: "Parks" },
		{ id: "churches", name: "Churches" },
		{ id: "historical", name: "Historical" },
	]);

	const carouselTimer = useRef<NodeJS.Timeout | null>(null);

	const getGreeting = () => {
		const hour = new Date().getHours();
		if (hour < 12) return "Good morning ☀️";
		if (hour < 18) return "Good afternoon ️";
		return "Good evening 🌙";
	};

	// ✅ Fixed: Direct supabase import used instead of controllers.supabase
	useEffect(() => {
		const fetchCategories = async () => {
			try {
				const { data, error } = await supabase
					.from("categories")
					.select("id, name")
					.order("name", { ascending: true });
				
				if (!error && data && data.length > 0) {
					setCategories([{ id: "all", name: "All" }, ...data]);
				}
			} catch (err) {
				console.warn("[Home] Categories fetch failed, using fallback:", err);
			}
		};
		fetchCategories();
	}, []);

	useEffect(() => {
		if (locations.length > 1) {
			carouselTimer.current = setInterval(() => {
				setCarouselIndex((prev) => (prev + 1) % Math.min(3, locations.length));
			}, 3500);
		}
		return () => {
			if (carouselTimer.current) clearInterval(carouselTimer.current);
		};
	}, [locations.length]);

	useFocusEffect(
		useCallback(() => {
			let isMounted = true;
			const loadLocations = async () => {
				setIsLoading(true);
				try {
					const data = await controllers.location.list({ orderBy: "created_at" });
					if (isMounted) setLocations(data as LocationItem[]);
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

	const onRefresh = useCallback(() => {
		setRefreshing(true);
		controllers.location.list({ orderBy: "created_at" })
			.then((data) => setLocations(data as LocationItem[]))
			.finally(() => setRefreshing(false));
	}, []);

	const toggleBookmark = (id: string) => {
		setBookmarkedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
	};

	const filteredLocations = locations.filter((loc) => {
		if (selectedCategory === "all") return true;
		const locCategory = (loc.category || loc.town || "").toLowerCase();
		return locCategory.includes(selectedCategory.toLowerCase());
	});

	const renderLocationCard = ({ item, isFeatured = false }: { item: LocationItem; isFeatured?: boolean }) => {
		const isBookmarked = bookmarkedIds.includes(item.id);
		const height = isFeatured ? "h-72" : "h-60";
		
		return (
			<TouchableOpacity
				className={`relative rounded-3xl overflow-hidden shadow-lg mx-1 mb-4 ${height}`}
				style={{ width: CARD_WIDTH }}
				onPress={() => router.push(`/location/${item.id}`)}
				activeOpacity={0.85}
			>
				{item.banner_image_url ? (
					<Image source={{ uri: item.banner_image_url }} className="absolute inset-0 h-full w-full" resizeMode="cover" />
				) : (
					<View className="absolute inset-0 h-full w-full items-center justify-center bg-surface-soft">
						<MapPin size={48} color="#929292" />
					</View>
				)}
				<View className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" />
				
				<TouchableOpacity
					className="absolute top-3 right-3 h-9 w-9 items-center justify-center bg-white/90 rounded-full"
					onPress={(e) => { e.stopPropagation(); toggleBookmark(item.id); }}
					activeOpacity={0.7}
				>
					<Heart size={18} color={isBookmarked ? "#ff385c" : "#929292"} fill={isBookmarked ? "#ff385c" : "none"} />
				</TouchableOpacity>
				
				<View className="absolute bottom-0 left-0 right-0 p-4">
					<Text className="text-white text-2xl font-bold mb-1" fontName="PlusJakartaSans_700Bold">{item.name}</Text>
					<View className="flex-row items-center mb-2">
						<MapPin size={14} color="#fff" />
						<Text className="ml-1.5 text-white/90 text-sm">{item.town}, Aklan</Text>
					</View>
					<View className="flex-row items-center gap-2">
						<View className="flex-row items-center bg-[#FF6B35]/90 px-2.5 py-1 rounded-full">
							<Flame size={14} color="#fff" />
							<Text className="ml-1 text-white text-xs font-semibold">Trending</Text>
						</View>
						{item.rating !== null && item.rating !== undefined && (
							<View className="flex-row items-center bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full">
								<Star size={12} color="#FBBF24" fill="#FBBF24" />
								<Text className="ml-1 text-white text-xs font-semibold">{item.rating.toFixed(1)}</Text>
							</View>
						)}
					</View>
				</View>
			</TouchableOpacity>
		);
	};

	return (
		<View className="flex-1 bg-surface-soft">
			<ScrollView
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ff385c" />
				}
			>
				<View className="pt-12 px-5 pb-5 bg-primary rounded-b-3xl shadow-lg shadow-primary/30">
					<Text className="text-white/90 text-base mb-1" fontName="PlusJakartaSans_400Regular">{getGreeting()},</Text>
					<Text className="text-white text-2xl font-bold mb-4" fontName="PlusJakartaSans_700Bold">Discover Aklan</Text>
					
					<View className="flex-row items-center px-4 py-3.5 bg-canvas rounded-2xl shadow-sm">
						<Search size={20} color="#929292" />
						<TextInput
							className="flex-1 ml-3 text-body text-base"
							placeholder="Search destinations..."
							placeholderTextColor="#929292"
							value={searchQuery}
							onChangeText={setSearchQuery}
						/>
					</View>
				</View>

				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					className="py-2 mb-4"
					contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
				>
					{categories.map((cat) => {
						const isSelected = selectedCategory === cat.id;
						return (
							<TouchableOpacity
								key={cat.id}
								className={`px-4 py-2 rounded-md ${isSelected ? "bg-primary" : "bg-canvas"}`}
								onPress={() => setSelectedCategory(cat.id)}
								activeOpacity={0.7}
							>
								<Text className={`text-sm font-medium ${isSelected ? "text-on-primary" : "text-muted"}`} fontName="PlusJakartaSans_600SemiBold">
									{cat.name}
								</Text>
							</TouchableOpacity>
						);
					})}
				</ScrollView>

				{filteredLocations.length > 0 && (
					<View className="mb-6 mt-4">
						<ScrollView
							horizontal
							pagingEnabled
							showsHorizontalScrollIndicator={false}
							scrollEnabled={false}
							contentContainerStyle={{ paddingHorizontal: 20 }}
						>
							{filteredLocations.slice(0, 3).map((item) => (
								<View key={item.id} style={{ width: CARD_WIDTH }}>
									{renderLocationCard({ item, isFeatured: true })}
								</View>
							))}
						</ScrollView>

						<View className="flex-row justify-center items-center gap-2 mt-4">
							{filteredLocations.slice(0, Math.min(3, filteredLocations.length)).map((_, idx) => (
								<TouchableOpacity
									key={idx}
									onPress={() => setCarouselIndex(idx)}
									activeOpacity={0.7}
								>
									<View className={`rounded-full ${carouselIndex === idx ? "w-8 h-2 bg-primary" : "w-2 h-2 bg-hairline"}`} />
								</TouchableOpacity>
							))}
						</View>
					</View>
				)}

				<View className="flex-row items-center justify-between px-5 mb-3">
					<Text className="text-xl text-ink font-bold" fontName="PlusJakartaSans_700Bold">Popular Destinations</Text>
					<TouchableOpacity activeOpacity={0.7}>
						<Text className="text-primary text-sm font-semibold">See all</Text>
					</TouchableOpacity>
				</View>

				{isLoading ? (
					<View className="flex-1 items-center justify-center py-12">
						<LoadingSpinner size="large" />
					</View>
				) : (
					<FlatList
						data={filteredLocations.slice(1)}
						renderItem={({ item }) => renderLocationCard({ item })}
						keyExtractor={(item) => item?.id ?? Math.random().toString()}
						scrollEnabled={false}
						contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 20 }}
						ListEmptyComponent={
							<View className="items-center justify-center px-8 py-12">
								<Text className="mb-2 text-center text-ink text-xl" fontName="PlusJakartaSans_700Bold">No locations found</Text>
								<Text className="text-center text-muted" fontName="PlusJakartaSans_400Regular">Try adjusting your search or filters</Text>
							</View>
						}
					/>
				)}
			</ScrollView>
		</View>
	);
}