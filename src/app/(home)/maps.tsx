import { controllers } from "@lib/api/supabase/controller";
import { supabase } from "@lib/api/supabase/supabase";
import type { Location as LocationRecord } from "@lib/types/supabase";
import type * as TMapbox from "@rnmapbox/maps";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Navigation, Star } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { Image, NativeModules, Platform, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
	const insets = useSafeAreaInsets();
	const [locations, setLocations] = useState<MapLocationCardData[]>([]);
	const [selectedLocation, setSelectedLocation] = useState<string>("");
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

	const mapLocations = useMemo(
		() => locations.filter((location) => location.latitude && location.longitude),
		[locations],
	);

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
			{/* Map Area */}
			<View className="overflow-hidden relative flex-1 bg-[#E8F0FE]">
				<Mapbox.MapView style={{ flex: 1 }} scaleBarEnabled={false} styleURL={Mapbox.StyleURL.Street}>
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
									className={`px-3 py-1.5 rounded-full shadow-sm border ${selectedLocation === loc.id ? "bg-primary border-primary" : "bg-canvas border-primary"}`}
								>
									<Text
										className={`text-xs font-bold ${selectedLocation === loc.id ? "text-white" : "text-primary"}`}
										fontName="PlusJakartaSans_700Bold"
									>
										{loc.name.length > 15 ? `${loc.name.slice(0, 15)}...` : loc.name}
									</Text>
								</View>
							</TouchableOpacity>
						</Mapbox.MarkerView>
					))}
				</Mapbox.MapView>

				<TouchableOpacity
					className="absolute right-4 p-3 bg-canvas border border-hairline rounded-full shadow-lg z-10"
					style={{ bottom: Math.max(insets.bottom, 16) + 310 }}
					activeOpacity={0.7}
					onPress={() => {
						if (mapLocations[0]) {
							setSelectedLocation(mapLocations[0].id);
						}
					}}
				>
					<Navigation size={20} color="#ff385c" />
				</TouchableOpacity>

				<View
					className="absolute bottom-0 left-0 right-0 z-20 px-4"
					style={{ paddingBottom: Math.max(insets.bottom, 16) }}
					pointerEvents="box-none"
				>
					<TouchableOpacity
						className="bg-canvas border border-hairline rounded-[28px] shadow-2xl overflow-hidden"
						activeOpacity={0.95}
						onPress={() => router.push(`/location/${selectedData.id}`)}
					>
						<View className="h-35 w-full bg-surface-soft relative">
							{selectedData.image ? (
								<Image
									source={{ uri: selectedData.image }}
									className="h-full w-full"
									resizeMode="cover"
								/>
							) : null}
						</View>

						<View className="p-4">
							<View className="flex-row items-center mb-2">
								<View className="flex-row items-center bg-[#FBBF24] px-1.5 py-0.5 rounded-md">
									<Star size={10} color="#fff" fill="#fff" />
									<Text
										className="ml-1 text-white font-bold text-xs"
										fontName="PlusJakartaSans_700Bold"
									>
										{selectedData.rating}
									</Text>
									<Text className="ml-1 mb-0.5 text-white text-xs" fontName="PlusJakartaSans_600SemiBold">
										({selectedData.reviews}) reviews
									</Text>
								</View>
							</View>

							<Text
								className="font-bold text-xl text-ink mb-1"
								fontName="PlusJakartaSans_700Bold"
								numberOfLines={1}
							>
								{selectedData.name}
							</Text>

							<Text
								className="text-muted text-sm mb-3"
								fontName="PlusJakartaSans_400Regular"
								numberOfLines={1}
							>
								{selectedData.location}
							</Text>

							<View className="flex-row justify-between items-center mt-1">
								<View className="bg-primary px-4 py-2 rounded-full shadow-sm">
									<Text className="text-white font-bold text-sm" fontName="PlusJakartaSans_700Bold">
										View Details
									</Text>
								</View>
							</View>
						</View>
					</TouchableOpacity>
				</View>
			</View>
		</View>
	);
}
