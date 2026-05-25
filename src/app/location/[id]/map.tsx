import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, MapPin, Star } from "lucide-react-native";
import { useEffect, useState } from "react";
import { NativeModules, Platform, TouchableOpacity, View } from "react-native";
import { Text } from "@/components/Text";
import { API_KEYS } from "@/config";
import { LOCATION_DETAILS_BY_ID } from "@/shared/data/locations";

export default function LocationMapScreen() {
	const router = useRouter();
	const { id } = useLocalSearchParams();
	const locationId = typeof id === "string" ? id : "1";
	const location = LOCATION_DETAILS_BY_ID[locationId] ?? LOCATION_DETAILS_BY_ID["1"];
	const [Mapbox, setMapbox] = useState<any>(null);
	const hasMapboxNative = Platform.OS === "android" && Boolean(NativeModules.RNMBXModule);

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

	if (Platform.OS !== "android") {
		return (
			<View className="flex-1 items-center justify-center bg-canvas px-6">
				<Text className="text-center text-ink text-lg" fontName="PlusJakartaSans_700Bold">
					This map view is available on Android only.
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
			<View className="absolute left-4 right-4 top-12 z-20 flex-row items-center justify-between">
				<TouchableOpacity
					className="items-center justify-center h-11 w-11 bg-canvas/90 rounded-full shadow-sm"
					onPress={() => router.back()}
					activeOpacity={0.7}
				>
					<ArrowLeft size={20} color="#222222" />
				</TouchableOpacity>
				<View className="px-4 py-2 bg-canvas/90 rounded-full shadow-sm">
					<Text className="font-semibold text-ink text-sm" fontName="PlusJakartaSans_600SemiBold">
						{location.name}
					</Text>
				</View>
			</View>

			<View className="flex-1">
				<Mapbox.MapView style={{ flex: 1 }} styleURL={Mapbox.StyleURL.Street}>
					<Mapbox.Camera
						defaultSettings={{
							centerCoordinate: [location.longitude, location.latitude],
							zoomLevel: 13.5,
							animationDuration: 800,
						}}
						centerCoordinate={[location.longitude, location.latitude]}
						zoomLevel={13.5}
						animationMode="flyTo"
						animationDuration={800}
					/>

					<Mapbox.MarkerView coordinate={[location.longitude, location.latitude]} allowOverlap>
						<View className="items-center justify-center">
							<View className="w-10 h-10 items-center justify-center rounded-full bg-primary border-2 border-white shadow-md">
								<MapPin size={16} color="#fff" />
							</View>
							<View className="w-2 h-2 mt-1 rounded-full bg-primary/70" />
						</View>
					</Mapbox.MarkerView>
				</Mapbox.MapView>
			</View>

			<View className="px-4 pb-safe pt-4 bg-canvas border-t border-hairline">
				<View className="flex-row items-center justify-between mb-2">
					<Text className="text-xl text-ink" fontName="PlusJakartaSans_700Bold">
						{location.name}
					</Text>
					<View className="flex-row items-center px-2 py-1 bg-primary/10 rounded-full">
						<Star size={12} color="#FBBF24" fill="#FBBF24" />
						<Text className="ml-1 text-ink text-sm" fontName="PlusJakartaSans_600SemiBold">
							{location.rating}
						</Text>
					</View>
				</View>
				<Text className="mb-1 text-muted text-sm" fontName="PlusJakartaSans_400Regular">
					{location.location}
				</Text>
				<Text className="mb-4 text-body text-sm" fontName="PlusJakartaSans_400Regular">
					{location.description}
				</Text>
				<TouchableOpacity
					className="items-center justify-center py-3 bg-primary rounded-xl"
					onPress={() => router.back()}
					activeOpacity={0.8}
				>
					<Text className="font-semibold text-on-primary" fontName="PlusJakartaSans_600SemiBold">
						Back to Details
					</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
}
