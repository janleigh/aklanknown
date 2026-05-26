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
import { Text } from "@/components/Text";
import { API_KEYS } from "@/config";
import { DEFAULT_MAP_LOCATION, LOCATION_LIST } from "@/shared/data/locations";

const CATEGORIES = ["Beaches", "Parks", "Churches", "Historical", "Hotels"];

export default function MapsScreen() {
	const router = useRouter();
	const params = useLocalSearchParams();
	const initialLocationId =
		typeof params.locationId === "string" ? params.locationId : DEFAULT_MAP_LOCATION.id;
	const [selectedLocation, setSelectedLocation] = useState<string>(initialLocationId);
	const [Mapbox, setMapbox] = useState<typeof TMapbox | null>(null);
	const hasMapboxNative = Platform.OS === "android" && Boolean(NativeModules.RNMBXModule);

	useEffect(() => {
		if (typeof params.locationId === "string") {
			setSelectedLocation(params.locationId);
		}
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
		return (
			LOCATION_LIST.find((location) => location.id === selectedLocation) ?? DEFAULT_MAP_LOCATION
		);
	}, [selectedLocation]);

	if (Platform.OS !== "android") {
		return (
			<View className="flex-1 items-center justify-center bg-canvas px-6">
				<Text className="text-center text-ink text-lg" fontName="PlusJakartaSans_700Bold">
					Mapbox map preview is available on Android only.
				</Text>
			</View>
		);
	}

	if (!hasMapboxNative || !Mapbox) {
		return (
			<View className="flex-1 items-center justify-center bg-canvas px-6">
				<Text className="text-center text-ink text-lg" fontName="PlusJakartaSans_700Bold">
					Mapbox native code is not available in this build. Rebuild with a dev client.
				</Text>
			</View>
		);
	}

	return (
		<View className="flex-1 bg-canvas">
			{/* Header */}
			<View className="z-20 pb-3 pt-12 px-4 bg-canvas border-b border-hairline">
				<Text className="mb-3 text-2xl text-ink" fontName="PlusJakartaSans_700Bold">
					Maps
				</Text>

				{/* Search & Filter */}
				<View className="flex-row gap-2 items-center mb-3">
					<View className="flex-1 flex-row items-center px-4 py-2.5 bg-surface-soft border border-hairline rounded-full">
						<Search size={18} color="#929292" />
						<TextInput
							className="flex-1 ml-2 text-ink text-sm"
							placeholder="Where to in Aklan?"
							placeholderTextColor="#929292"
						/>
					</View>
					<TouchableOpacity className="p-2.5 bg-primary/10 rounded-full" activeOpacity={0.7}>
						<SlidersHorizontal size={18} color="#ff385c" />
					</TouchableOpacity>
				</View>

				{/* Categories */}
				<ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-1 -mx-1">
					{CATEGORIES.map((cat) => (
						<TouchableOpacity
							key={cat}
							className="mr-2 px-4 py-1.5 bg-surface-soft border border-hairline rounded-full"
							activeOpacity={0.7}
						>
							<Text
								className="font-semibold text-ink text-xs"
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

					{LOCATION_LIST.map((loc) => (
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
					onPress={() => setSelectedLocation(DEFAULT_MAP_LOCATION.id)}
				>
					<Navigation size={20} color="#ff385c" />
				</TouchableOpacity>
			</View>

			{/* Bottom Details Card (Static) - Uses pb-safe to not overlap with tabs */}
			<View className="z-20 pb-safe px-4 py-3 bg-canvas border-hairline border-t shadow-lg">
				{selectedData ? (
					<View className="flex-row gap-3 items-center">
						<View className="overflow-hidden h-14 w-14 bg-surface-soft border border-hairline rounded-xl">
							<Image
								source={{ uri: selectedData.image }}
								className="h-full w-full"
								resizeMode="cover"
							/>
						</View>
						<View className="flex-1">
							<Text
								className="mb-0.5 font-bold text-base text-ink"
								fontName="PlusJakartaSans_700Bold"
							>
								{selectedData.name}
							</Text>
							<View className="flex-row gap-1 items-center mb-0.5">
								<Star size={12} color="#FBBF24" fill="#FBBF24" />
								<Text
									className="font-semibold text-ink text-xs"
									fontName="PlusJakartaSans_600SemiBold"
								>
									{selectedData.rating}
								</Text>
								<Text className="text-muted text-xs" fontName="PlusJakartaSans_400Regular">
									({selectedData.reviews})
								</Text>
							</View>
							<Text className="text-muted text-xs" fontName="PlusJakartaSans_400Regular">
								{selectedData.location}
							</Text>
						</View>
						<TouchableOpacity
							className="px-4 py-2 bg-primary rounded-lg"
							onPress={() => router.push(`/location/${selectedData.id}`)}
							activeOpacity={0.8}
						>
							<Text
								className="font-semibold text-white text-xs"
								fontName="PlusJakartaSans_600SemiBold"
							>
								View
							</Text>
						</TouchableOpacity>
					</View>
				) : (
					<View className="items-center justify-center py-2">
						<Text className="text-muted text-sm" fontName="PlusJakartaSans_400Regular">
							Tap a location pin to view details
						</Text>
					</View>
				)}
			</View>
		</View>
	);
}
