// src/components/location/LocationCard.tsx
import { Heart, MapPin, Star, CircleDot } from "lucide-react-native";
import { Image, TouchableOpacity, View } from "react-native";
import type { Location } from "@/types";
import { Text } from "../Text";

export interface LocationCardProps {
	location: Location;
	onPress?: () => void;
	onBookmark?: () => void;
	onView360?: () => void; // 👈 NEW: Callback for 360° view
	isBookmarked?: boolean;
	show360Button?: boolean; // 👈 NEW: Toggle 360° button visibility
}

export function LocationCard({
	location,
	onPress,
	onBookmark,
	onView360,
	isBookmarked = false,
	show360Button = false, // Default to false for list views
}: LocationCardProps) {
	return (
		<TouchableOpacity
			className="overflow-hidden mb-4 bg-canvas border border-hairline rounded-xl shadow-sm"
			onPress={onPress}
			activeOpacity={0.9}
		>
			<View className="relative h-48">
				<Image source={{ uri: location.image }} className="h-full w-full" resizeMode="cover" />
				
				{/* Distance Badge */}
				<View className="absolute left-3 top-3 px-3 py-1 bg-scrim/50 rounded-full">
					<Text className="font-medium text-on-dark text-xs" fontName="PlusJakartaSans_500Medium">
						{location.distance}
					</Text>
				</View>
				
				{/* Bookmark Button */}
				<TouchableOpacity
					className="absolute right-3 top-3 items-center justify-center h-8 w-8 bg-canvas/90 rounded-full"
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

				{/* 👈 NEW: 360° View Button (only show if location has panorama & prop enabled) */}
				{show360Button && location.panorama_image_url && (
					<TouchableOpacity
						className="absolute right-3 bottom-3 items-center justify-center h-8 w-8 bg-primary rounded-full shadow-md"
						onPress={(e) => {
							e.stopPropagation();
							onView360?.();
						}}
						activeOpacity={0.8}
					>
						<CircleDot size={16} color="#fff" />
					</TouchableOpacity>
				)}
			</View>
			
			<View className="p-4">
				<Text className="mb-1 text-ink text-lg" fontName="PlusJakartaSans_700Bold">
					{location.name}
				</Text>
				<View className="flex-row items-center justify-between">
					<View className="flex-row items-center">
						<MapPin size={14} color="#929292" />
						<Text className="ml-1 text-muted text-sm" fontName="PlusJakartaSans_400Regular">
							{location.location}
						</Text>
					</View>
					<View className="flex-row items-center px-2 py-1 bg-primary/10 rounded-full">
						<Star size={12} color="#FBBF24" fill="#FBBF24" />
						<Text
							className="ml-1 font-semibold text-ink text-sm"
							fontName="PlusJakartaSans_600SemiBold"
						>
							{location.rating}
						</Text>
					</View>
				</View>
			</View>
		</TouchableOpacity>
	);
}