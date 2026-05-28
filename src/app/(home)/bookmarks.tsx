import { LoadingSpinner } from "@components/index";
import { controllers } from "@lib/api/supabase/controller";
import { getBookmarkedIds, removeBookmark, subscribeBookmarks } from "@lib/storage/bookmarks";
import type { Location as LocationRecord } from "@lib/types/supabase";
import { useFocusEffect, useRouter } from "expo-router";
import { Heart, MapPin } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { FlatList, Image, TouchableOpacity, View } from "react-native";
import { Text } from "@/components/ui/Text";

type SavedLocationCard = {
	id: string;
	name: string;
	location: string;
	image: string;
};

function buildSavedLocation(location: LocationRecord): SavedLocationCard {
	const locationLabel = [location.street, location.barangay, location.town]
		.filter(Boolean)
		.join(", ");

	return {
		id: location.id,
		name: location.name,
		location: locationLabel || location.town || location.barangay || "Unknown location",
		image:
			location.banner_image_url ||
			location.panorama_image_url ||
			"https://picsum.photos/seed/location/800/400",
	};
}

export default function BookmarksScreen() {
	const router = useRouter();
	const [savedLocations, setSavedLocations] = useState<SavedLocationCard[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	const loadSavedLocations = useCallback(async (isMountedGetter?: () => boolean) => {
		setIsLoading(true);

		try {
			const [locations, bookmarkedIds] = await Promise.all([
				controllers.location.list({ orderBy: "created_at" }),
				getBookmarkedIds(),
			]);

			const bookmarkedSet = new Set(bookmarkedIds);
			const nextSavedLocations = locations
				.filter((location) => bookmarkedSet.has(location.id))
				.map(buildSavedLocation);

			if (!isMountedGetter || isMountedGetter()) {
				setSavedLocations(nextSavedLocations);
			}
		} catch (error) {
			console.error("[Bookmarks] Failed to load saved locations:", error);
			if (!isMountedGetter || isMountedGetter()) {
				setSavedLocations([]);
			}
		} finally {
			if (!isMountedGetter || isMountedGetter()) {
				setIsLoading(false);
			}
		}
	}, []);

	useFocusEffect(
		useCallback(() => {
			let isMounted = true;

			void loadSavedLocations(() => isMounted);

			return () => {
				isMounted = false;
			};
		}, [loadSavedLocations]),
	);

	useEffect(() => {
		const unsubscribe = subscribeBookmarks(() => {
			void loadSavedLocations();
		});

		return unsubscribe;
	}, [loadSavedLocations]);

	const handleRemoveBookmark = async (id: string) => {
		setSavedLocations((prev) => prev.filter((location) => location.id !== id));
		try {
			await removeBookmark(id);
		} catch (error) {
			console.error("[Bookmarks] Failed to remove bookmark:", error);
		}
	};

	if (isLoading) {
		return (
			<View className="flex-1 items-center justify-center px-8 bg-surface-soft">
				<LoadingSpinner size="large" />
			</View>
		);
	}

	return (
		<View className="flex-1 bg-surface-soft">
			<View className="pt-12 px-5 bg-surface-soft pb-4">
				<View className="flex-row gap-3 items-center mb-6">
					{/* <View className="items-center justify-center h-12 w-12 bg-primary/10 rounded-full">
						<Heart size={24} color="#ff385c" fill="#ff385c" />
					</View> */}
					<View className="flex-1">
						<Text className="text-3xl text-ink mb-1" fontName="PlusJakartaSans_700Bold">
							My Bookmarks
						</Text>
						<Text className="text-muted text-base" fontName="PlusJakartaSans_400Regular">
							Save your favorite Aklan locations to visit later.
						</Text>
					</View>
				</View>
			</View>

			{savedLocations.length === 0 ? (
				<View className="flex-1 items-center justify-center px-8">
					<View className="items-center justify-center mb-6 h-20 w-20 bg-primary/10 rounded-full">
						<Heart size={40} color="#ff385c" />
					</View>
					<Text className="mb-2 text-2xl text-center text-ink" fontName="PlusJakartaSans_700Bold">
						No bookmarks yet
					</Text>
					<Text className="mb-8 text-body text-center" fontName="PlusJakartaSans_400Regular">
						Tap the heart on a location to save it here.
					</Text>
					<TouchableOpacity
						className="px-8 py-3 bg-primary rounded-lg"
						onPress={() => router.push("/(home)")}
						activeOpacity={0.8}
					>
						<Text className="font-semibold text-on-primary" fontName="PlusJakartaSans_600SemiBold">
							Explore Locations
						</Text>
					</TouchableOpacity>
				</View>
			) : (
				<FlatList
					data={savedLocations}
					keyExtractor={(item) => item.id}
					showsVerticalScrollIndicator={false}
					contentContainerStyle={{ padding: 20, paddingBottom: 24 }}
					renderItem={({ item }) => (
						<TouchableOpacity
							className="overflow-hidden mb-6 bg-canvas rounded-4xl shadow-sm relative h-96"
							onPress={() => router.push(`/location/${item.id}`)}
							activeOpacity={0.9}
						>
							<Image
								source={{ uri: item.image }}
								className="absolute inset-0 h-full w-full"
								resizeMode="cover"
							/>
							<View className="absolute inset-0 bg-black/20" />

							{/* Top Right - Remove Button */}
							<View className="absolute top-4 right-4">
								<TouchableOpacity
									className="items-center justify-center h-10 w-10 bg-canvas/80 rounded-full backdrop-blur-md"
									onPress={(e) => {
										e.stopPropagation();
										void handleRemoveBookmark(item.id);
									}}
									activeOpacity={0.7}
								>
									<Heart size={20} color="#ff385c" fill="#ff385c" />
								</TouchableOpacity>
							</View>

							{/* Bottom Elements */}
							<View className="absolute bottom-4 left-5 right-5 flex-row items-end justify-between">
								<View className="flex-1 mr-4">
									<View className="flex-row items-center mb-1">
										<MapPin size={16} color="#ffffff" />
										<Text
											className="ml-1 text-white text-sm"
											fontName="PlusJakartaSans_600SemiBold"
										>
											{item.location}
										</Text>
									</View>
									<Text
										className="text-white text-3xl drop-shadow-md"
										fontName="PlusJakartaSans_700Bold"
									>
										{item.name}
									</Text>
								</View>
							</View>
						</TouchableOpacity>
					)}
				/>
			)}
		</View>
	);
}
