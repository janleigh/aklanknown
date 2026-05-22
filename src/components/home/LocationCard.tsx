import { TouchableOpacity, View, Image } from "react-native";
import { Heart, MapPin, Star } from "lucide-react-native";
import { Text } from "../Text";
import type { Location } from "@/types";

export interface LocationCardProps {
	location: Location;
	onPress?: () => void;
	onBookmark?: () => void;
	isBookmarked?: boolean;
}

export function LocationCard({
	location,
	onPress,
	onBookmark,
	isBookmarked = false,
}: LocationCardProps) {
	return (
		<TouchableOpacity
			className="bg-canvas rounded-xl overflow-hidden mb-4 shadow-sm border border-hairline"
			onPress={onPress}
			activeOpacity={0.9}
		>
			<View className="relative h-48">
				<Image source={{ uri: location.image }} className="w-full h-full" resizeMode="cover" />
				<View className="absolute top-3 left-3 bg-scrim/50 px-3 py-1 rounded-full">
					<Text className="text-on-dark text-xs font-medium" fontName="PlusJakartaSans_500Medium">
						{location.distance}
					</Text>
				</View>
				<TouchableOpacity
					className="absolute top-3 right-3 w-8 h-8 bg-canvas/90 rounded-full items-center justify-center"
					onPress={(e) => {
						e.stopPropagation();
						onBookmark?.();
					}}
					activeOpacity={0.7}
				>
					<Heart
						size={16}
						color={isBookmarked ? "#ff385c" : "#929292"}
						fill={isBookmarked ? "currentColor" : "none"}
					/>
				</TouchableOpacity>
			</View>
			<View className="p-4">
				<Text className="text-lg text-ink mb-1" fontName="PlusJakartaSans_700Bold">
					{location.name}
				</Text>
				<View className="flex-row items-center justify-between">
					<View className="flex-row items-center">
						<MapPin size={14} color="#929292" />
						<Text className="text-muted ml-1 text-sm" fontName="PlusJakartaSans_400Regular">
							{location.location}
						</Text>
					</View>
					<View className="flex-row items-center bg-primary/10 px-2 py-1 rounded-full">
						<Star size={12} color="#FBBF24" fill="#FBBF24" />
						<Text className="text-ink font-semibold text-sm ml-1" fontName="PlusJakartaSans_600SemiBold">
							{location.rating}
						</Text>
					</View>
				</View>
			</View>
		</TouchableOpacity>
	);
}