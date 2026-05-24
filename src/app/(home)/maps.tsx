import { useLocalSearchParams, useRouter } from "expo-router";
import { MapPin, Navigation, Search, SlidersHorizontal, Star } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Image, ScrollView, TextInput, TouchableOpacity, View } from "react-native";
import { Text } from "@/components/Text";

const CATEGORIES = ["Beaches", "Parks", "Churches", "Historical", "Hotels"];

const LOCATIONS = [
	{
		id: "1",
		name: "Boracay White Beach",
		location: "Malay, Aklan",
		rating: 4.9,
		reviews: 1245,
		image: "https://picsum.photos/seed/boracay/400/300",
		x: 20,
		y: 30,
	},
	{
		id: "2",
		name: "Jawili Falls",
		location: "Tangalan, Aklan",
		rating: 4.7,
		reviews: 328,
		image: "https://picsum.photos/seed/jawili/400/300",
		x: 45,
		y: 25,
	},
	{
		id: "3",
		name: "Hinugtan Beach",
		location: "Buruanga, Aklan",
		rating: 4.8,
		reviews: 156,
		image: "https://picsum.photos/seed/hinugtan/400/300",
		x: 70,
		y: 40,
	},
	{
		id: "4",
		name: "Bakhawan Eco-Park",
		location: "Kalibo, Aklan",
		rating: 4.6,
		reviews: 89,
		image: "https://picsum.photos/seed/bakhawan/400/300",
		x: 30,
		y: 60,
	},
];

export default function MapsScreen() {
	const router = useRouter();
	const params = useLocalSearchParams();
	const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

	useEffect(() => {
		if (params.locationId) {
			setSelectedLocation(params.locationId as string);
		}
	}, [params]);

	const selectedData = LOCATIONS.find((l) => l.id === selectedLocation);

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
				{/* Subtle Map Grid Pattern */}
				<View className="absolute inset-0 opacity-15">
					{[...Array(8)].map((_, i) => (
						<View
							key={`h-${i}`}
							className="absolute left-0 right-0 border-blue-400 border-t"
							style={{ top: `${i * 12.5}%` }}
						/>
					))}
					{[...Array(8)].map((_, i) => (
						<View
							key={`v-${i}`}
							className="absolute bottom-0 top-0 border-blue-400 border-l"
							style={{ left: `${i * 12.5}%` }}
						/>
					))}
				</View>

				{/* Location Pins */}
				{LOCATIONS.map((loc) => (
					<TouchableOpacity
						key={loc.id}
						className="absolute"
						style={{
							left: `${loc.x}%`,
							top: `${loc.y}%`,
							transform: [{ translateX: -14 }, { translateY: -28 }],
						}}
						onPress={() => setSelectedLocation(loc.id)}
						activeOpacity={0.8}
					>
						<View
							className={`w-7 h-7 rounded-full items-center justify-center shadow-md border-2 ${selectedLocation === loc.id ? "bg-primary border-white" : "bg-canvas border-primary/30"}`}
						>
							<MapPin size={14} color={selectedLocation === loc.id ? "#fff" : "#ff385c"} />
						</View>
					</TouchableOpacity>
				))}

				{/* My Location Button */}
				<TouchableOpacity
					className="absolute bottom-4 right-4 p-3 bg-canvas border border-hairline rounded-full shadow-lg"
					activeOpacity={0.7}
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
							onPress={() => router.push(`/location/${selectedData.id}` as any)}
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
