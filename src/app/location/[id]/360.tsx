import { controllers } from "@lib/api/supabase/controller";
import type { Location as SupabaseLocation } from "@lib/types/supabase";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Maximize2, RotateCw } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
	Dimensions,
	Image,
	type NativeScrollEvent,
	type NativeSyntheticEvent,
	ScrollView,
	TouchableOpacity,
	View,
} from "react-native";
import { Text } from "@/components/ui/Text";

type PanoramaLocation = Pick<
	SupabaseLocation,
	"id" | "name" | "banner_image_url" | "panorama_image_url"
>;

export default function Location360Screen() {
	const router = useRouter();
	const { id } = useLocalSearchParams();
	const locationId = typeof id === "string" ? id : Array.isArray(id) ? id[0] : "";
	const [location, setLocation] = useState<PanoramaLocation | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [panoramaSize, setPanoramaSize] = useState<{ width: number; height: number } | null>(null);
	const scrollRef = useRef<ScrollView | null>(null);
	const hasCenteredRef = useRef(false);
	const loopCopies = 5;
	const middleCopyIndex = 2;

	useEffect(() => {
		let isMounted = true;

		const loadLocation = async () => {
			if (!locationId) {
				if (isMounted) {
					setLocation(null);
					setLoadError("Location not found.");
					setIsLoading(false);
				}
				return;
			}

			if (isMounted) {
				setIsLoading(true);
				setLoadError(null);
			}

			try {
				const locationResult = await controllers.location.getById(locationId);

				if (isMounted) {
					setLocation({
						id: locationResult.id,
						name: locationResult.name,
						banner_image_url: locationResult.banner_image_url,
						panorama_image_url: locationResult.panorama_image_url,
					});
				}
			} catch (error) {
				console.error("[Location360] Failed to load location:", error);
				if (isMounted) {
					setLocation(null);
					setLoadError("We couldn't load the 360 view for this location.");
				}
			} finally {
				if (isMounted) {
					setIsLoading(false);
				}
			}
		};

		loadLocation();

		return () => {
			isMounted = false;
		};
	}, [locationId]);

	const panoramaUrl = location?.panorama_image_url || location?.banner_image_url || "";
	const screenWidth = Dimensions.get("window").width;
	const screenHeight = Dimensions.get("window").height;

	useEffect(() => {
		if (!panoramaUrl) {
			setPanoramaSize(null);
			hasCenteredRef.current = false;
			return;
		}

		let isMounted = true;

		Image.getSize(
			panoramaUrl,
			(width, height) => {
				if (isMounted) {
					setPanoramaSize({ width, height });
				}
			},
			() => {
				if (isMounted) {
					setPanoramaSize(null);
				}
			},
		);

		return () => {
			isMounted = false;
		};
	}, [panoramaUrl]);

	useEffect(() => {
		hasCenteredRef.current = false;
	}, []);

	const imageWidth = panoramaSize
		? Math.max(screenHeight * (panoramaSize.width / panoramaSize.height), screenWidth)
		: Math.max(screenWidth * 1.6, 900);

	const centerPanorama = (animated = false) => {
		scrollRef.current?.scrollTo({ x: imageWidth * middleCopyIndex, y: 0, animated });
		hasCenteredRef.current = true;
	};

	const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
		const x = event.nativeEvent.contentOffset.x;
		const loopWidth = imageWidth;

		if (x < loopWidth * 1) {
			scrollRef.current?.scrollTo({ x: x + loopWidth * middleCopyIndex, y: 0, animated: false });
		} else if (x > loopWidth * (loopCopies - 2)) {
			scrollRef.current?.scrollTo({ x: x - loopWidth * middleCopyIndex, y: 0, animated: false });
		}
	};

	const handleMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
		const x = event.nativeEvent.contentOffset.x;
		const loopWidth = imageWidth;

		if (x < loopWidth) {
			centerPanorama(false);
		} else if (x > loopWidth * (loopCopies - 2)) {
			centerPanorama(false);
		}
	};

	useEffect(() => {
		if (!panoramaSize || hasCenteredRef.current) {
			return;
		}

		const timer = setTimeout(() => {
			centerPanorama(false);
		}, 0);

		return () => clearTimeout(timer);
		// biome-ignore lint/correctness/useExhaustiveDependencies: needed
	}, [panoramaSize, centerPanorama]);

	if (isLoading) {
		return (
			<View className="flex-1 items-center justify-center px-6 bg-canvas">
				<Text className="text-center text-ink text-lg" fontName="PlusJakartaSans_700Bold">
					Loading 360 view...
				</Text>
			</View>
		);
	}

	if (!location) {
		return (
			<View className="flex-1 items-center justify-center px-6 bg-canvas">
				<Text className="mb-3 text-center text-ink text-lg" fontName="PlusJakartaSans_700Bold">
					{loadError ?? "Location not found."}
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

	if (!panoramaUrl) {
		return (
			<View className="flex-1 items-center justify-center px-6 bg-canvas">
				<Text className="mb-3 text-center text-ink text-lg" fontName="PlusJakartaSans_700Bold">
					No 360 image available for this location yet.
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
			<View className="absolute left-4 right-4 top-12 z-10 flex-row items-center justify-between">
				<TouchableOpacity
					className="items-center justify-center h-10 w-10 bg-canvas/85 rounded-full shadow-sm"
					onPress={() => router.back()}
					activeOpacity={0.8}
				>
					<ArrowLeft size={20} color="#222222" />
				</TouchableOpacity>
				<View className="flex-row gap-2 items-center px-3 py-2 bg-canvas/85 rounded-full shadow-sm">
					<Maximize2 size={16} color="#ff385c" />
					<Text className="font-semibold text-ink" fontName="PlusJakartaSans_600SemiBold">
						360 View
					</Text>
				</View>
			</View>

			<ScrollView
				className="flex-1"
				horizontal
				pagingEnabled={false}
				showsHorizontalScrollIndicator={false}
				bounces={false}
				ref={scrollRef}
				onScroll={handleScroll}
				onMomentumScrollEnd={handleMomentumEnd}
				scrollEventThrottle={16}
				contentContainerStyle={{ alignItems: "center", justifyContent: "center" }}
				decelerationRate="fast"
			>
				{Array.from({ length: loopCopies }).map((_, index) => (
					<Image
						key={index}
						source={{ uri: panoramaUrl }}
						style={{ width: imageWidth, height: screenHeight }}
						resizeMode="contain"
					/>
				))}
			</ScrollView>

			<View className="absolute bottom-8 left-4 right-4 px-4 py-3 bg-canvas/90 rounded-2xl shadow-sm">
				<View className="flex-row gap-2 items-center">
					<RotateCw size={16} color="#ff385c" />
					<Text className="font-semibold text-ink" fontName="PlusJakartaSans_600SemiBold">
						Swipe sideways to explore the panorama
					</Text>
				</View>
			</View>
		</View>
	);
}
