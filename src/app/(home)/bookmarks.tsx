import { Text } from "@components/Text";
import { LoadingSpinner } from "@components/index";
import { controllers } from "@lib/api/supabase/controller";
import type { Location as LocationRecord } from "@lib/types/supabase";
import { getBookmarkedIds, removeBookmark, subscribeBookmarks } from "@lib/storage/bookmarks";
import { useFocusEffect, useRouter } from "expo-router";
import { Heart, MapPin } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { FlatList, Image, TouchableOpacity, View } from "react-native";

type SavedLocationCard = {
	id: string;
	name: string;
	location: string;
	image: string;
};

function buildSavedLocation(location: LocationRecord): SavedLocationCard {
	const locationLabel = [location.street, location.barangay, location.town].filter(Boolean).join(", ");

	return {
		id: location.id,
		name: location.name,
		location: locationLabel || location.town || location.barangay || "Unknown location",
		image: location.banner_image_url || location.panorama_image_url || "https://picsum.photos/seed/location/800/400",
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
		}, []),
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
			<View className="flex-1 items-center justify-center bg-surface-soft px-8">
				<LoadingSpinner size="large" />
			</View>
		);
	}

	return (
		<View className="flex-1 bg-surface-soft px-4 pt-12">
			<View className="mb-4 flex-row items-center gap-3">
				<View className="items-center justify-center h-12 w-12 bg-primary/10 rounded-full">
					<Heart size={24} color="#ff385c" fill="#ff385c" />
				</View>
				<View className="flex-1">
					<Text className="text-2xl text-ink" fontName="PlusJakartaSans_700Bold">
						My Bookmarks
					</Text>
					<Text className="text-body" fontName="PlusJakartaSans_400Regular">
						Save your favorite Aklan locations to visit later.
					</Text>
				</View>
			</View>

			{savedLocations.length === 0 ? (
				<View className="flex-1 items-center justify-center px-8">
					<View className="items-center justify-center mb-6 h-20 w-20 bg-primary/10 rounded-full">
						<Heart size={40} color="#ff385c" />
					</View>
					<Text className="mb-2 text-center text-2xl text-ink" fontName="PlusJakartaSans_700Bold">
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
					contentContainerStyle={{ paddingBottom: 24 }}
					renderItem={({ item }) => (
						<TouchableOpacity
							className="overflow-hidden mb-4 bg-canvas border border-hairline rounded-xl shadow-sm"
							onPress={() => router.push(`/location/${item.id}`)}
							activeOpacity={0.9}
						>
							<View className="relative h-48 bg-surface-soft">
								<Image source={{ uri: item.image }} className="h-full w-full" resizeMode="cover" />
								<TouchableOpacity
									className="absolute right-3 top-3 items-center justify-center h-8 w-8 bg-canvas/90 rounded-full"
									onPress={(e) => {
										e.stopPropagation();
										void handleRemoveBookmark(item.id);
									}}
									activeOpacity={0.7}
								>
									<Heart size={16} color="#ff385c" fill="#ff385c" />
								</TouchableOpacity>
							</View>
							<View className="p-4">
								<Text className="mb-1 text-ink text-lg" fontName="PlusJakartaSans_700Bold">
									{item.name}
								</Text>
								<View className="flex-row items-center">
									<MapPin size={14} color="#929292" />
									<Text className="ml-1 text-muted text-sm" fontName="PlusJakartaSans_400Regular">
										{item.location}
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
