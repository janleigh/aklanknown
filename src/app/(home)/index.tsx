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
import { Heart, MapPin, Search } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { FlatList, Image, TextInput, TouchableOpacity, View } from "react-native";

export default function HomeScreen() {
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
			<View className="pb-4 pt-12 px-4 bg-canvas border-b border-hairline">
				{/* <Text className="mb-4 text-2xl text-ink" fontName="PlusJakartaSans_700Bold">
					Explore Aklan
				</Text> */}
				{/* Search */}
				<View className="flex-row items-center px-4 py-3 bg-canvas border border-hairline rounded-full shadow-sm">
					<Search size={20} color="#929292" />
					<TextInput
						className="flex-1 ml-3 text-ink"
						placeholder="Where to in Aklan?"
						placeholderTextColor="#929292"
						value={searchQuery}
						onChangeText={setSearchQuery}
					/>
				</View>
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
