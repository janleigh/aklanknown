import { controllers } from "@lib/api/supabase/controller";
import { supabase } from "@lib/api/supabase/supabase";
import type { Location as SupabaseLocation } from "@lib/types/supabase";
import type { Camera } from "@rnmapbox/maps";
import { useLocalSearchParams, useRouter } from "expo-router";
import type { Feature, LineString } from "geojson";
import { ArrowLeft, MapPin, Navigation, Route, Star } from "lucide-react-native";
import { type ElementRef, useEffect, useMemo, useRef, useState } from "react";
import { NativeModules, Platform, TouchableOpacity, View } from "react-native";
import { Text } from "@/components/ui/Text";
import { API_KEYS } from "@/config";

type Coordinate = {
	latitude: number;
	longitude: number;
};

type TravelMode = {
	key: "walking" | "bicycle" | "motorcycle" | "car";
	label: string;
	speedKmh: number;
};

type MapboxModule = typeof import("@rnmapbox/maps");

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

function buildMapLocation(
	location: SupabaseLocation,
	rating: number,
	reviews: number,
): MapLocationCardData {
	const locationLabel = [location.street, location.barangay, location.town]
		.filter(Boolean)
		.join(", ");

	return {
		id: location.id,
		name: location.name,
		latitude: location.latitude ?? 0,
		longitude: location.longitude ?? 0,
		location: locationLabel || location.town || location.barangay || "Unknown location",
		distance: "Custom location",
		rating,
		reviews,
		image:
			location.banner_image_url ||
			location.panorama_image_url ||
			"https://picsum.photos/seed/location/400/300",
	};
}

const TRAVEL_MODES: TravelMode[] = [
	{ key: "walking", label: "Walking", speedKmh: 5 },
	{ key: "bicycle", label: "Bicycle", speedKmh: 16 },
	{ key: "motorcycle", label: "Motorcycle", speedKmh: 40 },
	{ key: "car", label: "Car", speedKmh: 50 },
];

function haversineKm(start: Coordinate, end: Coordinate) {
	const toRadians = (value: number) => (value * Math.PI) / 180;
	const earthRadiusKm = 6371;
	const deltaLatitude = toRadians(end.latitude - start.latitude);
	const deltaLongitude = toRadians(end.longitude - start.longitude);
	const latitude1 = toRadians(start.latitude);
	const latitude2 = toRadians(end.latitude);

	const a =
		Math.sin(deltaLatitude / 2) * Math.sin(deltaLatitude / 2) +
		Math.cos(latitude1) *
			Math.cos(latitude2) *
			Math.sin(deltaLongitude / 2) *
			Math.sin(deltaLongitude / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

	return earthRadiusKm * c;
}

function buildFallbackRoute(start: Coordinate, end: Coordinate): Feature<LineString> {
	return {
		type: "Feature",
		properties: {},
		geometry: {
			type: "LineString",
			coordinates: [
				[start.longitude, start.latitude],
				[end.longitude, end.latitude],
			],
		},
	};
}

function formatTravelTime(totalMinutes: number) {
	const roundedMinutes = Math.max(1, Math.round(totalMinutes));

	if (roundedMinutes < 60) {
		return `${roundedMinutes} min`;
	}

	const hours = Math.floor(roundedMinutes / 60);
	const minutes = roundedMinutes % 60;

	return minutes > 0 ? `${hours} hr ${minutes} min` : `${hours} hr`;
}

function formatDistance(kilometers: number) {
	return kilometers < 1 ? `${Math.round(kilometers * 1000)} m` : `${kilometers.toFixed(1)} km`;
}

export default function LocationMapScreen() {
	const router = useRouter();
	const { id } = useLocalSearchParams();
	const locationId = typeof id === "string" ? id : Array.isArray(id) ? id[0] : "";
	const [customLocation, setCustomLocation] = useState<MapLocationCardData | null>(null);
	const [isLocationLoading, setIsLocationLoading] = useState(true);
	const [locationError, setLocationError] = useState<string | null>(null);
	const [Mapbox, setMapbox] = useState<MapboxModule | null>(null);
	const cameraRef = useRef<ElementRef<typeof Camera> | null>(null);
	const [currentPosition, setCurrentPosition] = useState<Coordinate | null>(null);
	const [routeGeometry, setRouteGeometry] = useState<Feature<LineString> | null>(null);
	const [routeDistanceKm, setRouteDistanceKm] = useState<number | null>(null);
	const [routeStatus, setRouteStatus] = useState<"idle" | "loading" | "ready" | "approx">("idle");
	const [locationStatus, setLocationStatus] = useState<"loading" | "ready" | "denied" | "error">(
		"loading",
	);
	const hasMapboxNative = Platform.OS === "android" && Boolean(NativeModules.RNMBXModule);

	const selectedData = useMemo(() => customLocation, [customLocation]);

	useEffect(() => {
		let isMounted = true;

		const loadLocation = async () => {
			if (!locationId) {
				if (isMounted) {
					setCustomLocation(null);
					setLocationError(null);
					setIsLocationLoading(false);
				}
				return;
			}

			if (isMounted) {
				setIsLocationLoading(true);
				setLocationError(null);
			}

			try {
				const [locationResult, reviewResult] = await Promise.all([
					controllers.location.getById(locationId),
					supabase.from("reviews").select("rating").eq("location_id", locationId),
				]);

				if (locationResult.latitude === null || locationResult.longitude === null) {
					throw new Error("Location does not have coordinates yet.");
				}

				const numericRatings = (reviewResult.data ?? []).flatMap((review) =>
					typeof review.rating === "number" ? [review.rating] : [],
				);
				const averageRating =
					numericRatings.length > 0
						? Number(
								(
									numericRatings.reduce((sum, rating) => sum + rating, 0) / numericRatings.length
								).toFixed(1),
							)
						: 0;

				if (isMounted) {
					setCustomLocation(
						buildMapLocation(locationResult, averageRating, (reviewResult.data ?? []).length),
					);
					setLocationError(null);
				}
			} catch (error) {
				console.error("[LocationMap] Failed to load location:", error);
				if (isMounted) {
					setCustomLocation(null);
					setLocationError("This location is not available on the map yet.");
				}
			} finally {
				if (isMounted) {
					setIsLocationLoading(false);
				}
			}
		};

		loadLocation();

		return () => {
			isMounted = false;
		};
	}, [locationId]);

	useEffect(() => {
		if (!hasMapboxNative) {
			return;
		}

		let isMounted = true;

		try {
			const loadedMapbox = require("@rnmapbox/maps") as MapboxModule & {
				default?: MapboxModule;
			};
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

	useEffect(() => {
		let isMounted = true;

		const readCurrentPosition = async () => {
			try {
				const Location = (await import("expo-location")) as typeof import("expo-location");
				const permission = await Location.requestForegroundPermissionsAsync();

				if (!isMounted) {
					return;
				}

				if (permission.status !== "granted") {
					setLocationStatus("denied");
					return;
				}

				const lastKnown = await Location.getLastKnownPositionAsync();

				if (lastKnown && isMounted) {
					setCurrentPosition({
						latitude: lastKnown.coords.latitude,
						longitude: lastKnown.coords.longitude,
					});
					setLocationStatus("ready");
				}

				const precisePosition = await Location.getCurrentPositionAsync({
					accuracy: Location.Accuracy.Balanced,
				});

				if (!isMounted) {
					return;
				}

				setCurrentPosition({
					latitude: precisePosition.coords.latitude,
					longitude: precisePosition.coords.longitude,
				});
				setLocationStatus("ready");
			} catch (error) {
				console.warn("Unable to read the current position for directions:", error);
				if (isMounted) {
					setLocationStatus("error");
				}
			}
		};

		readCurrentPosition();

		return () => {
			isMounted = false;
		};
	}, []);

	useEffect(() => {
		if (!currentPosition || !selectedData) {
			setRouteGeometry(null);
			setRouteDistanceKm(null);
			setRouteStatus("idle");
			return;
		}

		if (!API_KEYS.mapbox) {
			setRouteGeometry(buildFallbackRoute(currentPosition, selectedData));
			setRouteDistanceKm(
				haversineKm(currentPosition, {
					latitude: selectedData.latitude,
					longitude: selectedData.longitude,
				}),
			);
			setRouteStatus("approx");
			return;
		}

		let isMounted = true;
		const controller = new AbortController();

		const fetchRoute = async () => {
			try {
				setRouteStatus("loading");
				const origin = `${currentPosition.longitude},${currentPosition.latitude}`;
				const destination = `${selectedData.longitude},${selectedData.latitude}`;
				const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${origin};${destination}?geometries=geojson&overview=full&access_token=${API_KEYS.mapbox}`;

				const response = await fetch(url, { signal: controller.signal });
				if (!response.ok) {
					const errorBody = await response.text();
					throw new Error(`Directions request failed: ${response.status} ${errorBody}`.trim());
				}

				const data = (await response.json()) as {
					routes?: Array<{ distance?: number; geometry?: LineString }>;
				};

				const route = data.routes?.[0];
				if (!route?.geometry || route.geometry.coordinates.length === 0) {
					if (isMounted) {
						setRouteGeometry(buildFallbackRoute(currentPosition, selectedData));
						setRouteDistanceKm(
							haversineKm(currentPosition, {
								latitude: selectedData.latitude,
								longitude: selectedData.longitude,
							}),
						);
						setRouteStatus("approx");
					}
					return;
				}

				if (isMounted) {
					setRouteGeometry({
						type: "Feature",
						properties: {},
						geometry: route.geometry,
					});
					setRouteDistanceKm(typeof route.distance === "number" ? route.distance / 1000 : null);
					setRouteStatus("ready");
				}
			} catch (error) {
				if (isMounted && !controller.signal.aborted) {
					console.warn("Unable to fetch Mapbox directions:", error);
					setRouteGeometry(buildFallbackRoute(currentPosition, selectedData));
					setRouteDistanceKm(
						haversineKm(currentPosition, {
							latitude: selectedData.latitude,
							longitude: selectedData.longitude,
						}),
					);
					setRouteStatus("approx");
				}
			}
		};

		fetchRoute();

		return () => {
			isMounted = false;
			controller.abort();
		};
	}, [
		currentPosition?.latitude,
		currentPosition?.longitude,
		selectedData?.latitude,
		selectedData?.longitude,
		currentPosition,
		selectedData,
	]);

	const mapCenter = currentPosition
		? [currentPosition.longitude, currentPosition.latitude]
		: selectedData
			? [selectedData.longitude, selectedData.latitude]
			: [0, 0];

	const distanceForEstimates = useMemo(() => {
		if (routeDistanceKm != null) {
			return routeDistanceKm;
		}

		if (currentPosition) {
			return null;
		}

		if (!selectedData) {
			return null;
		}

		const parsedDistance = Number.parseFloat(selectedData.distance);
		return Number.isFinite(parsedDistance) ? parsedDistance : null;
	}, [routeDistanceKm, currentPosition, selectedData?.distance, selectedData]);

	const travelEstimates = useMemo(() => {
		if (distanceForEstimates == null) {
			return TRAVEL_MODES.map((mode) => ({ ...mode, timeLabel: "--" }));
		}

		return TRAVEL_MODES.map((mode) => ({
			...mode,
			timeLabel: formatTravelTime((distanceForEstimates / mode.speedKmh) * 60),
		}));
	}, [distanceForEstimates]);

	const locationStatusLabel =
		locationStatus === "loading"
			? "Getting your starting point..."
			: locationStatus === "denied"
				? "Location permission is off. Using the destination center."
				: locationStatus === "error"
					? "Could not read your current position right now."
					: "Starting from your current position.";
	const routeStatusLabel =
		routeStatus === "loading"
			? "Loading the road route..."
			: routeStatus === "approx"
				? "Using a straight-line estimate for this route."
				: routeStatus === "ready"
					? "Road route loaded."
					: "Waiting for a location fix...";
	const canFocusRoute = Boolean(routeGeometry);
	const focusRoute = () => {
		if (!cameraRef.current || !routeGeometry) {
			return;
		}

		const coordinates = routeGeometry.geometry.coordinates;
		if (coordinates.length === 0) {
			return;
		}

		let minLatitude = coordinates[0]![1];
		let maxLatitude = coordinates[0]![1];
		let minLongitude = coordinates[0]![0];
		let maxLongitude = coordinates[0]![0];

		coordinates.forEach(([longitude, latitude]) => {
			minLatitude = Math.min(minLatitude, latitude);
			maxLatitude = Math.max(maxLatitude, latitude);
			minLongitude = Math.min(minLongitude, longitude);
			maxLongitude = Math.max(maxLongitude, longitude);
		});

		cameraRef.current.fitBounds([maxLongitude, maxLatitude], [minLongitude, minLatitude], 80, 600);
	};

	if (Platform.OS !== "android") {
		return (
			<View className="flex-1 items-center justify-center px-6 bg-canvas">
				<Text className="text-center text-ink text-lg" fontName="PlusJakartaSans_700Bold">
					This map view is available on Android only.
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

	if (isLocationLoading) {
		return (
			<View className="flex-1 items-center justify-center px-6 bg-canvas">
				<Text className="text-center text-ink text-lg" fontName="PlusJakartaSans_700Bold">
					Loading map location...
				</Text>
			</View>
		);
	}

	if (!selectedData) {
		return (
			<View className="flex-1 items-center justify-center px-6 bg-canvas">
				<Text className="mb-3 text-center text-ink text-lg" fontName="PlusJakartaSans_700Bold">
					{locationError ?? "Location not found."}
				</Text>
				<TouchableOpacity
					className="px-4 py-3 bg-primary rounded-xl"
					onPress={() => router.back()}
					activeOpacity={0.8}
				>
					<Text className="font-semibold text-white" fontName="PlusJakartaSans_600SemiBold">
						Go Back
					</Text>
				</TouchableOpacity>
			</View>
		);
	}

	return (
		<View className="flex-1 bg-canvas">
			<View className="flex-1">
				<Mapbox.MapView style={{ flex: 1 }} styleURL={Mapbox.StyleURL.Street}>
					<Mapbox.Camera
						ref={cameraRef}
						defaultSettings={{
							centerCoordinate: mapCenter,
							zoomLevel: 14,
							animationDuration: 800,
						}}
						centerCoordinate={mapCenter}
						zoomLevel={14}
						animationMode="flyTo"
						animationDuration={800}
					/>

					{routeGeometry ? (
						<Mapbox.ShapeSource id="route-line" shape={routeGeometry}>
							<Mapbox.LineLayer
								id="route-line-layer"
								style={{
									lineColor: "#ff385c",
									lineCap: "round",
									lineJoin: "round",
									lineWidth: 4,
									lineOpacity: 0.85,
								}}
							/>
						</Mapbox.ShapeSource>
					) : null}

					{currentPosition ? (
						<Mapbox.MarkerView
							coordinate={[currentPosition.longitude, currentPosition.latitude]}
							allowOverlap
						>
							<View className="items-center justify-center">
								<View className="h-8 w-8 bg-sky-500 border-2 border-white rounded-full shadow-lg items-center justify-center">
									<View className="h-3 w-3 bg-white rounded-full" />
								</View>
							</View>
						</Mapbox.MarkerView>
					) : null}

					{selectedData ? (
						<Mapbox.MarkerView
							coordinate={[selectedData.longitude, selectedData.latitude]}
							allowOverlap
						>
							<View className="items-center justify-center pb-8">
								<View className="items-center justify-center h-12 w-12 bg-primary border-4 border-white rounded-full shadow-xl">
									<MapPin size={20} color="#fff" />
								</View>
								<View className="absolute bottom-0 h-2 w-8 bg-black/20 rounded-full blur-sm" />
							</View>
						</Mapbox.MarkerView>
					) : null}
				</Mapbox.MapView>
			</View>

			<View className="absolute left-4 right-4 top-12 z-20 flex-row items-center justify-between">
				<TouchableOpacity
					className="items-center justify-center h-12 w-12 bg-white rounded-full shadow-lg"
					onPress={() => router.back()}
					activeOpacity={0.8}
				>
					<ArrowLeft size={22} color="#222222" />
				</TouchableOpacity>
				<View className="px-5 py-3 bg-white rounded-full shadow-lg">
					<Text className="text-ink text-sm" fontName="PlusJakartaSans_700Bold">
						{selectedData.name}
					</Text>
				</View>
			</View>

			<View className="absolute bottom-0 left-0 right-0 pt-6 pb-8 px-6 bg-canvas rounded-t-4xl shadow-[0_-8px_30px_rgba(0,0,0,0.12)]">
				<View className="items-center mb-6">
					<View className="h-1.5 w-12 bg-surface-strong rounded-full" />
				</View>

				<View className="flex-row items-center justify-between mb-5">
					<View className="flex-1 pr-4">
						<Text className="text-ink text-2xl leading-tight" fontName="PlusJakartaSans_700Bold">
							{selectedData.name}
						</Text>
						<Text className="mt-1.5 text-muted text-sm" fontName="PlusJakartaSans_400Regular">
							{selectedData.location}
						</Text>
					</View>
					<View className="flex-row items-center px-3 py-2 bg-surface-strong rounded-full">
						<Star size={16} color="#FBBF24" fill="#FBBF24" />
						<Text className="ml-1.5 text-ink text-sm" fontName="PlusJakartaSans_700Bold">
							{selectedData.rating}
						</Text>
					</View>
				</View>

				<View className="flex-row gap-3 items-center mb-5 px-4 py-3 bg-surface-soft border border-hairline-soft rounded-2xl">
					<View className="items-center justify-center h-10 w-10 bg-primary/10 rounded-full">
						<Route size={18} color="#ff385c" />
					</View>
					<View className="flex-1">
						<Text className="text-ink text-sm" fontName="PlusJakartaSans_600SemiBold">
							{locationStatusLabel}
						</Text>
						{routeStatusLabel ? (
							<Text
								className="mt-0.5 text-muted-soft text-xs"
								fontName="PlusJakartaSans_400Regular"
							>
								{routeStatusLabel}
							</Text>
						) : null}
					</View>
				</View>

				<View className="flex-row flex-wrap gap-3 justify-between mb-6">
					{travelEstimates.map((mode) => (
						<View
							key={mode.key}
							className="px-4 py-3 w-[48%] bg-surface-strong/50 border border-hairline-soft rounded-2xl"
						>
							<Text
								className="text-muted-soft text-[11px] uppercase tracking-wider"
								fontName="PlusJakartaSans_600SemiBold"
							>
								{mode.label}
							</Text>
							<Text className="mt-1.5 text-ink text-xl" fontName="PlusJakartaSans_700Bold">
								{mode.timeLabel}
							</Text>
							<Text
								className="mt-0.5 text-muted-soft text-xs"
								fontName="PlusJakartaSans_400Regular"
							>
								{distanceForEstimates == null
									? "Distance unavailable"
									: formatDistance(distanceForEstimates)}
							</Text>
						</View>
					))}
				</View>

				<View className="flex-row gap-3">
					<TouchableOpacity
						className="flex-1 items-center justify-center py-4 bg-surface-strong rounded-full"
						onPress={() => router.back()}
						activeOpacity={0.8}
					>
						<Text className="text-ink text-base" fontName="PlusJakartaSans_600SemiBold">
							Back to Details
						</Text>
					</TouchableOpacity>
					<TouchableOpacity
						className={`flex-1 flex-row items-center justify-center gap-2 rounded-full py-4 shadow-sm ${
							canFocusRoute ? "bg-primary" : "bg-primary/50"
						}`}
						onPress={focusRoute}
						activeOpacity={canFocusRoute ? 0.8 : 1}
						disabled={!canFocusRoute}
					>
						<Navigation size={18} color="#ffffff" />
						<Text className="text-white text-base" fontName="PlusJakartaSans_600SemiBold">
							Route Details
						</Text>
					</TouchableOpacity>
				</View>
			</View>
		</View>
	);
}
