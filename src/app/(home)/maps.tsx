import { controllers } from "@lib/api/supabase/controller";
import { supabase } from "@lib/api/supabase/supabase";
import type { Location as LocationRecord } from "@lib/types/supabase";
import type * as TMapbox from "@rnmapbox/maps";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MapPin, Navigation, Search, SlidersHorizontal, Star } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import {
	Image,
	NativeModules,
	Platform,
	ScrollView,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/components/ui/Text";
import { API_KEYS } from "@/config";

type MapLocationCardData = {
	id: string;
	name: string;
	latitude: number;
	longitude: number;
	location: string;
	distance: string;
	rating: number;
	reviews: number;
	image: string;
};

type ReviewStat = {
	locationId: string;
	rating: number;
	reviews: number;
};

function buildReviewStats(reviews: Array<{ location_id: string | null; rating: number | null }>) {
	const statsByLocationId = new Map<string, ReviewStat>();

	for (const review of reviews) {
		if (!review.location_id) {
			continue;
		}

		const existing = statsByLocationId.get(review.location_id);
		const nextReviews = (existing?.reviews ?? 0) + 1;
		const nextRating =
			typeof review.rating === "number"
				? Number(
						(
							((existing?.rating ?? 0) * (existing?.reviews ?? 0) + review.rating) /
							nextReviews
						).toFixed(1),
					)
				: (existing?.rating ?? 0);

		statsByLocationId.set(review.location_id, {
			locationId: review.location_id,
			rating: nextRating,
			reviews: nextReviews,
		});
	}

	return statsByLocationId;
}

function buildMapLocation(
	location: LocationRecord,
	reviewStat: ReviewStat | undefined,
): MapLocationCardData | null {
	if (location.latitude === null || location.longitude === null) {
		return null;
	}

	const locationLabel = [location.street, location.barangay, location.town]
		.filter(Boolean)
		.join(", ");

	return {
		id: location.id,
		name: location.name,
		latitude: location.latitude,
		longitude: location.longitude,
		location: locationLabel || location.town || location.barangay || "Unknown location",
		distance: "Custom location",
		rating: reviewStat?.rating ?? 0,
		reviews: reviewStat?.reviews ?? 0,
		image: location.banner_image_url || location.panorama_image_url || "",
	};
}

export default function MapsScreen() {
	const router = useRouter();
	const params = useLocalSearchParams();
	const [locations, setLocations] = useState<MapLocationCardData[]>([]);
	const [selectedLocation, setSelectedLocation] = useState<string>("");
	const [searchQuery, setSearchQuery] = useState("");
	const [isSearchFocused, setIsSearchFocused] = useState(false);
	const [isLoadingLocations, setIsLoadingLocations] = useState(true);
	const [Mapbox, setMapbox] = useState<typeof TMapbox | null>(null);
	const hasMapboxNative = Platform.OS === "android" && Boolean(NativeModules.RNMBXModule);

	useEffect(() => {
		let isMounted = true;

		const loadLocations = async () => {
			setIsLoadingLocations(true);

			try {
				const [data, reviews] = await Promise.all([
					controllers.location.list({ orderBy: "created_at" }),
					supabase.from("reviews").select("location_id, rating"),
				]);

				const reviewStatsByLocationId = buildReviewStats(reviews.data ?? []);
				const mapLocations = data
					.map((location) => buildMapLocation(location, reviewStatsByLocationId.get(location.id)))
					.filter((location): location is MapLocationCardData => location !== null);

				if (isMounted) {
					setLocations(mapLocations);

					if (
						typeof params.locationId === "string" &&
						mapLocations.some((location) => location.id === params.locationId)
					) {
						setSelectedLocation(params.locationId);
					} else if (mapLocations[0]) {
						setSelectedLocation(mapLocations[0].id);
					} else {
						setSelectedLocation("");
					}
				}
			} catch (error) {
				console.error("[Maps] Error loading locations:", error);
				if (isMounted) {
					setLocations([]);
					setSelectedLocation("");
				}
			} finally {
				if (isMounted) {
					setIsLoadingLocations(false);
				}
			}
		};

		loadLocations();

		return () => {
			isMounted = false;
		};
	}, [params.locationId]);

	useEffect(() => {
		if (!hasMapboxNative) {
			return;
		}

		let isMounted = true;

		try {
			const loadedMapbox = require("@rnmapbox/maps");
			const resolvedMapbox = loadedMapbox.default ?? loadedMapbox;

			if (API_KEYS.mapbox) {
				resolvedMapbox.setAccessToken(API_KEYS.mapbox);
			}

			if (isMounted) {
				setMapbox(resolvedMapbox);
			}
		} catch (error) {
			console.warn("Mapbox native module is unavailable in this build:", error);
		}

		return () => {
			isMounted = false;
		};
	}, [hasMapboxNative]);

	const selectedData = useMemo(() => {
		return locations.find((location) => location.id === selectedLocation) ?? locations[0] ?? null;
	}, [locations, selectedLocation]);

	const searchSuggestions = useMemo(() => {
		const query = searchQuery.trim().toLowerCase();

		if (!query) {
			return locations.slice(0, 5);
		}

		return locations
			.filter((location) => {
				const haystack = [location.name, location.location, location.distance]
					.join(" ")
					.toLowerCase();
				return haystack.includes(query);
			})
			.slice(0, 5);
	}, [locations, searchQuery]);

	const shouldShowSearchDropdown = isSearchFocused && searchSuggestions.length > 0;

	const mapLocations = useMemo(
		() => locations.filter((location) => location.latitude && location.longitude),
		[locations],
	);

	const handleSearchSelection = (locationId: string) => {
		const location = locations.find((item) => item.id === locationId);
		if (!location) {
			return;
		}

		setSelectedLocation(location.id);
		setSearchQuery(location.name);
	};

	if (Platform.OS !== "android") {
		return (
			<View className="flex-1 items-center justify-center px-6 bg-canvas">
				<Text className="text-center text-ink text-lg" fontName="PlusJakartaSans_700Bold">
					Mapbox map preview is available on Android only.
				</Text>
			</View>
		);
	}

	if (isLoadingLocations) {
		return (
			<View className="flex-1 items-center justify-center px-6 bg-canvas">
				<Text className="text-center text-ink text-lg" fontName="PlusJakartaSans_700Bold">
					Loading locations...
				</Text>
			</View>
		);
	}

	if (!hasMapboxNative || !Mapbox) {
		return (
			<View className="flex-1 items-center justify-center px-6 bg-canvas">
				<Text className="text-center text-ink text-lg" fontName="PlusJakartaSans_700Bold">
					Mapbox native code is not available in this build. Rebuild with a dev client.
				</Text>
			</View>
		);
	}

	if (!selectedData || locations.length === 0) {
		return (
			<View className="flex-1 items-center justify-center px-6 bg-canvas">
				<Text className="text-center text-ink text-lg" fontName="PlusJakartaSans_700Bold">
					No locations available yet.
				</Text>
			</View>
		);
	}

	return (
		<View className="flex-1 bg-canvas">
			{/* Header */}
		<View className="z-20 pb-4 pt-12 px-5 bg-canvas border-b border-hairline">
			<Text className="mb-4 text-3xl text-ink" fontName="PlusJakartaSans_700Bold">
				Explore Map
			</Text>

			{/* Search & Filter */}
			<View className="relative flex-row gap-3 items-center">
				<View className="flex-1">
					<View className="flex-row items-center px-4 py-3 bg-surface-soft border border-hairline rounded-full shadow-sm">
							<Search size={18} color="#929292" />
							<TextInput
								className="flex-1 ml-2 text-ink text-sm"
								placeholder="Where to in Aklan?"
								placeholderTextColor="#929292"
								value={searchQuery}
								onChangeText={setSearchQuery}
								onFocus={() => setIsSearchFocused(true)}
								blurOnSubmit={false}
								onBlur={() => {
									setTimeout(() => {
										setIsSearchFocused(false);
									}, 150);
								}}
							/>
						</View>

						{shouldShowSearchDropdown ? (
							<View className="overflow-hidden absolute left-0 right-0 top-13.5 z-30 bg-canvas border border-hairline rounded-2xl shadow-lg">
								{searchSuggestions.map((location, index) => (
									<TouchableOpacity
										key={location.id}
										className={`px-4 py-3 ${index !== searchSuggestions.length - 1 ? "border-b border-hairline" : ""}`}
										onPress={() => handleSearchSelection(location.id)}
										activeOpacity={0.75}
									>
										<Text
											className="font-semibold text-ink text-sm"
											fontName="PlusJakartaSans_600SemiBold"
										>
											{location.name}
										</Text>
										<Text className="text-muted text-xs" fontName="PlusJakartaSans_400Regular">
											{location.location}
										</Text>
									</TouchableOpacity>
								))}
							</View>
						) : null}
					</View>
					<TouchableOpacity className="p-3 bg-surface-soft border border-hairline rounded-full shadow-sm" activeOpacity={0.7}>
						<SlidersHorizontal size={18} color="#ff385c" />
					</TouchableOpacity>
				</View>

				{/* Categories */}
				<ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-1 -mx-1 mt-4">
					{["Beaches", "Parks", "Churches", "Historical", "Hotels"].map((cat) => (
						<TouchableOpacity
							key={cat}
							className="mr-3 px-4 py-2 bg-surface-soft border border-hairline rounded-full shadow-sm"
							activeOpacity={0.7}
						>
							<Text
								className="font-semibold text-ink text-sm"
								fontName="PlusJakartaSans_600SemiBold"
							>
								{cat}
							</Text>
						</TouchableOpacity>
					))}
				</ScrollView>
			</View>

			{/* Map Area */}
			<View className="overflow-hidden relative flex-1 bg-[#E8F0FE]">
				<Mapbox.MapView style={{ flex: 1 }} styleURL={Mapbox.StyleURL.Street}>
					<Mapbox.Camera
						defaultSettings={{
							centerCoordinate: [selectedData.longitude, selectedData.latitude],
							zoomLevel: 10,
						}}
						centerCoordinate={[selectedData.longitude, selectedData.latitude]}
						zoomLevel={10.5}
						animationMode="flyTo"
						animationDuration={800}
					/>

					{mapLocations.map((loc) => (
						<Mapbox.MarkerView key={loc.id} coordinate={[loc.longitude, loc.latitude]} allowOverlap>
							<TouchableOpacity
								className="items-center justify-center"
								onPress={() => setSelectedLocation(loc.id)}
								activeOpacity={0.85}
							>
								<View
									className={`w-8 h-8 rounded-full items-center justify-center shadow-md border-2 ${selectedLocation === loc.id ? "bg-primary border-white" : "bg-canvas border-primary/30"}`}
								>
									<MapPin size={14} color={selectedLocation === loc.id ? "#fff" : "#ff385c"} />
								</View>
							</TouchableOpacity>
						</Mapbox.MarkerView>
					))}
				</Mapbox.MapView>

				<TouchableOpacity
					className="absolute bottom-4 right-4 p-3 bg-canvas border border-hairline rounded-full shadow-lg"
					activeOpacity={0.7}
					onPress={() => {
						if (mapLocations[0]) {
							setSelectedLocation(mapLocations[0].id);
						}
					}}
				>
					<Navigation size={20} color="#ff385c" />
				</TouchableOpacity>
			</View>

			{/* ✅ BOTTOM NAVBAR FIX: Wrapped in SafeAreaView, removed pb-safe */}
			<SafeAreaView edges={["bottom"]} className="bg-canvas border-hairline border-t shadow-lg">
			<View className="px-5 py-4">
				<View className="flex-row gap-4 items-center">
					<View className="overflow-hidden h-16 w-16 bg-surface-soft border border-hairline rounded-2xl shadow-sm">
							{selectedData.image ? (
								<Image
									source={{ uri: selectedData.image }}
									className="h-full w-full"
									resizeMode="cover"
								/>
							) : null}
						</View>
						<View className="flex-1">
							<Text
								className="mb-1 font-bold text-lg text-ink"
								fontName="PlusJakartaSans_700Bold"
							>
								{selectedData.name}
							</Text>
							<View className="flex-row gap-2 items-center mb-1">
								<Star size={14} color="#FBBF24" fill="#FBBF24" />
								<Text
									className="font-semibold text-ink text-sm"
									fontName="PlusJakartaSans_600SemiBold"
								>
									{selectedData.rating}
								</Text>
								<Text className="text-muted text-sm" fontName="PlusJakartaSans_400Regular">
									({selectedData.reviews})
								</Text>
							</View>
							<Text className="text-muted text-sm" fontName="PlusJakartaSans_400Regular">
								{selectedData.location}
							</Text>
						</View>
						<TouchableOpacity
							className="px-5 py-3 bg-primary rounded-xl shadow-sm"
							onPress={() => router.push(`/location/${selectedData.id}`)}
							activeOpacity={0.8}
						>
							<Text
								className="font-semibold text-white text-sm"
								fontName="PlusJakartaSans_600SemiBold"
							>
								View
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</SafeAreaView>
		</View>
	);
}
