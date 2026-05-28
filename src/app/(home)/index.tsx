import { useUser } from "@clerk/expo";
import { LoadingSpinner } from "@components/index";
import { controllers } from "@lib/api/supabase/controller";
import {
	addBookmark,
	getBookmarkedIds,
	removeBookmark,
	subscribeBookmarks,
} from "@lib/storage/bookmarks";
import type { Location as LocationRecord } from "@lib/types/supabase";
import { useFocusEffect, useRouter } from "expo-router";
import { ArrowUpRight, Heart, MapPin, Search, Star } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { FlatList, Image, TextInput, TouchableOpacity, View } from "react-native";
import { Text } from "@/components/ui/Text";

export default function HomeScreen() {
	const { user } = useUser();
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState("");
	const [locations, setLocations] = useState<LocationRecord[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

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
						setLocations(data);
						setBookmarkedIds(bookmarked);
					}
				} catch (error) {
					console.error("[Home] Error loading locations:", error);
				} finally {
					if (isMounted) {
						setIsLoading(false);
					}
				}
			};
			loadLocations();

			return () => {
				isMounted = false;
			};
		}, []),
	);

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

	return (
		<View className="flex-1 bg-surface-soft">
			{/* Header */}
			<View className="pt-12 px-5 bg-surface-soft pb-4">
				<View className="flex-row items-center bg-canvas rounded-full px-5 py-3.5 shadow-sm mb-6 border border-hairline">
					<Search size={20} color="#999999" />
					<TextInput
						placeholder="Search locations..."
						value={searchQuery}
						onChangeText={setSearchQuery}
						className="flex-1 ml-3 text-ink text-base p-0"
						placeholderTextColor="#999999"
					/>
				</View>
				<Text className="text-3xl text-ink mb-1" fontName="PlusJakartaSans_700Bold">
					Hi, {user?.firstName} 👋
				</Text>
				<Text className="text-muted text-base mb-6" fontName="PlusJakartaSans_400Regular">
					Where do you want to explore today?
				</Text>

				{/* <ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					className="overflow-visible"
					contentContainerStyle={{ paddingRight: 20 }}
				>
					{["Beach", "Parks", "Churches", "Historical"].map((category) => (
						<TouchableOpacity
							key={category}
							className="flex-row items-center bg-canvas rounded-full pl-2 pr-5 py-2 mr-3 shadow-sm"
						>
							<Image
								source={{ uri: `https://picsum.photos/seed/${category}/100/100` }}
								className="w-8 h-8 rounded-full mr-2"
							/>
							<Text className="text-ink" fontName="PlusJakartaSans_600SemiBold">
								{category}
							</Text>
						</TouchableOpacity>
					))}
				</ScrollView> */}
			</View>

			{/* List */}
			{isLoading ? (
				<View className="flex-1 items-center justify-center">
					<LoadingSpinner size="large" />
				</View>
			) : (
				<FlatList
					data={filteredLocations}
					keyExtractor={(item) => item.id}
					contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
					showsVerticalScrollIndicator={false}
					renderItem={({ item }) => (
						<TouchableOpacity
							className="overflow-hidden mb-6 bg-canvas rounded-4xl shadow-sm relative h-96"
							onPress={() => router.push(`/location/${item.id}`)}
							activeOpacity={0.9}
						>
							{item.banner_image_url ? (
								<Image
									source={{ uri: item.banner_image_url }}
									className="absolute inset-0 h-full w-full"
									resizeMode="cover"
								/>
							) : (
								<View className="absolute inset-0 h-full w-full bg-surface-strong" />
							)}

							<View className="absolute inset-0 bg-black/20" />

							<View className="absolute top-4 left-4 right-4 flex-row justify-between">
								<View className="flex-row items-center bg-canvas/80 px-3 py-1.5 rounded-full backdrop-blur-md">
									<Star size={14} color="#FBBF24" fill="#FBBF24" />
									<Text className="ml-1 text-ink text-sm" fontName="PlusJakartaSans_700Bold">
										5.0
									</Text>
								</View>
								<TouchableOpacity
									className="items-center justify-center h-10 w-10 bg-canvas/80 rounded-full backdrop-blur-md"
									onPress={(e) => {
										e.stopPropagation();
										void toggleBookmark(item.id);
									}}
									activeOpacity={0.7}
								>
									<Heart
										size={20}
										color={bookmarkedIds.includes(item.id) ? "#ff385c" : "#ffffff"}
										fill={bookmarkedIds.includes(item.id) ? "currentColor" : "none"}
									/>
								</TouchableOpacity>
							</View>

							<View className="absolute bottom-4 left-5 right-5 flex-row items-end justify-between">
								<View className="flex-1 mr-4">
									<View className="flex-row items-center mb-1">
										<MapPin size={16} color="#ffffff" />
										<Text
											className="ml-1 text-white text-sm"
											fontName="PlusJakartaSans_600SemiBold"
										>
											{item.town || item.street || "Aklan"}
										</Text>
									</View>
									<Text
										className="text-white text-3xl drop-shadow-md"
										fontName="PlusJakartaSans_700Bold"
									>
										{item.name}
									</Text>
								</View>
								<View className="h-12 w-12 bg-canvas rounded-full items-center justify-center shadow-md">
									<ArrowUpRight size={24} color="#222222" />
								</View>
							</View>
						</TouchableOpacity>
					)}
					ListEmptyComponent={
						<View className="items-center justify-center px-8 py-12">
							<Text
								className="mb-2 text-center text-ink text-xl"
								fontName="PlusJakartaSans_700Bold"
							>
								No locations found
							</Text>
							<Text className="text-center text-muted" fontName="PlusJakartaSans_400Regular">
								Try adjusting your search or filters
							</Text>
						</View>
					}
				/>
			)}
		</View>
	);
}
