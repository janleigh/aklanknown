/** biome-ignore-all lint/suspicious/noExplicitAny: needed */

import { useLocalSearchParams, useRouter } from "expo-router";
import {
	ArrowLeft,
	Camera,
	ChevronLeft,
	ChevronRight,
	Heart,
	Map as MapIcon,
	MapPin,
	Star,
	X,
} from "lucide-react-native";
import { useState } from "react";
import { Alert, Image, ScrollView, TextInput, TouchableOpacity, View } from "react-native";
import { Text } from "@/components/Text";

const LOCATION_DATA: Record<string, any> = {
	"1": {
		id: "1",
		name: "Boracay White Beach",
		location: "Malay, Aklan",
		rating: 4.9,
		reviews: 1245,
		description: "World-renowned white sand beach with crystal clear waters.",
		fullDescription:
			"Boracay White Beach is world-renowned for its pristine white sand and crystal clear turquoise waters. Stretching over 4 kilometers, it offers stunning sunsets, water activities, and vibrant nightlife. The beach is divided into three distinct stations, each with its own unique charm and atmosphere. Station 1 is known for luxury resorts, Station 2 for bustling D'Mall, and Station 3 for a relaxed, budget-friendly vibe.",
		images: [
			"https://picsum.photos/seed/boracay1/800/400",
			"https://picsum.photos/seed/boracay2/800/400",
			"https://picsum.photos/seed/boracay3/800/400",
		],
	},
	"2": {
		id: "2",
		name: "Jawili Falls",
		location: "Tangalan, Aklan",
		rating: 4.7,
		reviews: 328,
		description: "Stunning multi-tiered waterfall surrounded by lush greenery.",
		fullDescription:
			"Jawili Falls is a stunning multi-tiered waterfall surrounded by lush greenery. The crystal-clear natural pools are perfect for swimming and relaxation. A hidden gem in Aklan, it offers a peaceful escape from the bustling beaches. The trek to the falls takes about 15-20 minutes through scenic forest trails.",
		images: [
			"https://picsum.photos/seed/jawili1/800/400",
			"https://picsum.photos/seed/jawili2/800/400",
		],
	},
	"3": {
		id: "3",
		name: "Hinugtan Beach",
		location: "Buruanga, Aklan",
		rating: 4.8,
		reviews: 156,
		description: "Secluded paradise beach perfect for snorkeling and sunsets.",
		fullDescription:
			"Hinugtan Beach is a secluded paradise with powdery white sand and calm turquoise waters. Perfect for snorkeling and sunset watching, this hidden gem offers tranquility away from the crowds. The beach stretches for about 1 kilometer and is surrounded by coconut trees, providing natural shade.",
		images: [
			"https://picsum.photos/seed/hinugtan1/800/400",
			"https://picsum.photos/seed/hinugtan2/800/400",
		],
	},
	"4": {
		id: "4",
		name: "Bakhawan Eco-Park",
		location: "Kalibo, Aklan",
		rating: 4.6,
		reviews: 89,
		description: "Mangrove forest with hanging bridge and eco-trails.",
		fullDescription:
			"Bakhawan Eco-Park features a massive man-made forest with towering bamboo structures and hanging bridges. It's a favorite for nature walks, photography, and educational tours. The park spans 22 hectares and is a successful reforestation project that has become a major tourist attraction.",
		images: [
			"https://picsum.photos/seed/bakhawan1/800/400",
			"https://picsum.photos/seed/bakhawan2/800/400",
		],
	},
};

const MOCK_REVIEWS = [
	{
		id: "1",
		userName: "Janleugggh",
		rating: 5,
		date: "Apr 6, 2026",
		comment:
			"Absolutely breathtaking! The sand is incredibly soft and the water is perfect for swimming.",
	},
	{
		id: "2",
		userName: "Pauleeenn",
		rating: 3,
		date: "May 29, 2026",
		comment: "Beautiful beach, but can get crowded during peak season. Still worth visiting!",
	},
];

export default function LocationDetailsScreen() {
	const { id } = useLocalSearchParams();
	const router = useRouter();

	// Safely parse ID to prevent white screen crashes
	const locationId = typeof id === "string" ? id : "1";
	const location = LOCATION_DATA[locationId] || LOCATION_DATA["1"];

	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const [isExpanded, setIsExpanded] = useState(false);
	const [userRating, setUserRating] = useState(0);
	const [reviewText, setReviewText] = useState("");
	const [isFavorite, setIsFavorite] = useState(false);

	const handleSubmitReview = () => {
		if (!reviewText.trim() || userRating === 0) {
			Alert.alert("Missing Info", "Please select a rating and write your review.");
			return;
		}
		Alert.alert("Review Submitted!", "Thank you for sharing your experience.");
		setReviewText("");
		setUserRating(0);
	};

	const nextImage = () => {
		setCurrentImageIndex((prev) => (prev < location.images.length - 1 ? prev + 1 : 0));
	};

	const prevImage = () => {
		setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : location.images.length - 1));
	};

	return (
		<View className="flex-1 bg-canvas">
			<ScrollView showsVerticalScrollIndicator={false}>
				{/* Image Carousel */}
				<View className="relative h-72 bg-surface-soft">
					<Image
						source={{ uri: location.images[currentImageIndex] }}
						className="h-full w-full"
						resizeMode="cover"
					/>

					{location.images.length > 1 && (
						<>
							<TouchableOpacity
								className="absolute left-4 top-1/2 items-center justify-center h-10 w-10 bg-canvas/80 rounded-full shadow-sm -translate-y-1/2"
								onPress={prevImage}
								activeOpacity={0.7}
							>
								<ChevronLeft size={24} color="#222222" />
							</TouchableOpacity>
							<TouchableOpacity
								className="absolute right-4 top-1/2 items-center justify-center h-10 w-10 bg-canvas/80 rounded-full shadow-sm -translate-y-1/2"
								onPress={nextImage}
								activeOpacity={0.7}
							>
								<ChevronRight size={24} color="#222222" />
							</TouchableOpacity>
						</>
					)}

					<View className="absolute left-4 right-4 top-12 flex-row justify-between">
						<TouchableOpacity
							className="items-center justify-center h-10 w-10 bg-canvas/80 rounded-full shadow-sm"
							onPress={() => router.back()}
							activeOpacity={0.7}
						>
							<ArrowLeft size={20} color="#222222" />
						</TouchableOpacity>
						<View className="flex-row gap-2">
							<TouchableOpacity
								className="items-center justify-center h-10 w-10 bg-canvas/80 rounded-full shadow-sm"
								onPress={() => setIsFavorite(!isFavorite)}
								activeOpacity={0.7}
							>
								<Heart
									size={20}
									color={isFavorite ? "#ff385c" : "#222222"}
									fill={isFavorite ? "#ff385c" : "none"}
								/>
							</TouchableOpacity>
							<TouchableOpacity
								className="items-center justify-center h-10 w-10 bg-canvas/80 rounded-full shadow-sm"
								onPress={() => router.back()}
								activeOpacity={0.7}
							>
								<X size={20} color="#222222" />
							</TouchableOpacity>
						</View>
					</View>

					{location.images.length > 1 && (
						<View className="absolute bottom-4 left-0 right-0 flex-row gap-2 justify-center">
							{location.images.map((_: any, index: number) => (
								<View
									key={index}
									className={`h-2 rounded-full ${
										index === currentImageIndex ? "bg-canvas w-6" : "bg-canvas/50 w-2"
									}`}
								/>
							))}
						</View>
					)}
				</View>

				{/* Content */}
				<View className="pb-32 pt-6 px-5">
					<Text className="mb-2 text-2xl text-ink" fontName="PlusJakartaSans_700Bold">
						{location.name}
					</Text>
					<View className="flex-row items-center justify-between mb-4">
						<View className="flex-row gap-2 items-center">
							<View className="flex-row items-center">
								<Star size={16} color="#FBBF24" fill="#FBBF24" />
								<Text
									className="ml-1 font-semibold text-ink"
									fontName="PlusJakartaSans_600SemiBold"
								>
									{location.rating}
								</Text>
							</View>
							<Text className="text-muted text-sm" fontName="PlusJakartaSans_400Regular">
								({location.reviews} reviews)
							</Text>
						</View>
						<View className="flex-row gap-1 items-center">
							<MapPin size={16} color="#929292" />
							<Text className="text-muted text-sm" fontName="PlusJakartaSans_400Regular">
								{location.location}
							</Text>
						</View>
					</View>

					<Text className="mb-2 leading-6 text-body" fontName="PlusJakartaSans_400Regular">
						{isExpanded ? location.fullDescription : location.description}
					</Text>
					<TouchableOpacity onPress={() => setIsExpanded(!isExpanded)} activeOpacity={0.7}>
						<Text
							className="mb-6 font-semibold text-primary"
							fontName="PlusJakartaSans_600SemiBold"
						>
							{isExpanded ? "Read Less" : "Read More"}
						</Text>
					</TouchableOpacity>

					{/* Action Buttons */}
					<View className="flex-row gap-3 mb-8">
						<TouchableOpacity
							className="flex-1 flex-row gap-2 items-center justify-center py-3 bg-primary rounded-xl"
							activeOpacity={0.8}
							onPress={() => {
								router.push(`/location/${locationId}/map` as any);
							}}
						>
							<MapIcon size={18} color="#ffffff" />
							<Text
								className="font-semibold text-on-primary"
								fontName="PlusJakartaSans_600SemiBold"
							>
								View on Map
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							className="flex-1 flex-row gap-2 items-center justify-center py-3 bg-primary/15 rounded-xl"
							activeOpacity={0.8}
						>
							<Camera size={18} color="#ff385c" />
							<Text className="font-semibold text-primary" fontName="PlusJakartaSans_600SemiBold">
								View 360
							</Text>
						</TouchableOpacity>
					</View>

					<View className="mb-6 h-px bg-hairline-soft" />

					<Text className="mb-3 text-ink text-lg" fontName="PlusJakartaSans_700Bold">
						Write a Review
					</Text>

					<View className="flex-row gap-1 mb-3">
						{[1, 2, 3, 4, 5].map((star) => (
							<TouchableOpacity key={star} onPress={() => setUserRating(star)} activeOpacity={0.7}>
								<Star
									size={28}
									color={star <= userRating ? "#FBBF24" : "#ebebeb"}
									fill={star <= userRating ? "#FBBF24" : "none"}
								/>
							</TouchableOpacity>
						))}
					</View>

					<TextInput
						className="mb-4 p-4 h-24 text-body bg-surface-soft border border-hairline rounded-xl"
						placeholder="Share your experience..."
						placeholderTextColor="#929292"
						multiline
						value={reviewText}
						onChangeText={setReviewText}
						textAlignVertical="top"
					/>

					<TouchableOpacity
						className="items-center mb-8 py-3 bg-primary rounded-xl"
						onPress={handleSubmitReview}
						activeOpacity={0.8}
					>
						<Text className="font-semibold text-on-primary" fontName="PlusJakartaSans_600SemiBold">
							Submit Review
						</Text>
					</TouchableOpacity>

					<View className="mb-6 h-px bg-hairline-soft" />

					<Text className="mb-4 text-ink text-lg" fontName="PlusJakartaSans_700Bold">
						Reviews ({MOCK_REVIEWS.length})
					</Text>

					{MOCK_REVIEWS.map((review) => (
						<View key={review.id} className="mb-6">
							<View className="flex-row items-start justify-between mb-2">
								<View>
									<Text
										className="mb-1 font-semibold text-ink"
										fontName="PlusJakartaSans_600SemiBold"
									>
										{review.userName}
									</Text>
									<View className="flex-row gap-0.5">
										{Array.from({ length: review.rating }).map((_, i) => (
											<Star key={i} size={14} color="#FBBF24" fill="#FBBF24" />
										))}
									</View>
								</View>
								<Text className="text-muted-soft text-sm" fontName="PlusJakartaSans_400Regular">
									{review.date}
								</Text>
							</View>
							<Text className="leading-5 text-body" fontName="PlusJakartaSans_400Regular">
								{review.comment}
							</Text>
						</View>
					))}
				</View>
			</ScrollView>

			{/* Bottom Tab Bar */}
			<View className="absolute bottom-0 left-0 right-0 z-50 flex-row pb-safe pt-2 px-2 bg-canvas border-hairline border-t">
				{[
					{ key: "index", label: "Home", route: "/(home)" },
					{ key: "maps", label: "Maps", route: "/(home)/maps" },
					{ key: "bookmarks", label: "Saved", route: "/(home)/bookmarks" },
					{ key: "profile", label: "Profile", route: "/(home)/profile" },
				].map((tab) => (
					<TouchableOpacity
						key={tab.key}
						className="flex-1 items-center justify-center py-2"
						onPress={() => router.push(tab.route as any)}
						activeOpacity={0.7}
					>
						<Text
							className={`text-xs ${
								tab.key === "index" ? "text-primary font-semibold" : "text-muted"
							}`}
							fontName="PlusJakartaSans_600SemiBold"
						>
							{tab.label}
						</Text>
					</TouchableOpacity>
				))}
			</View>
		</View>
	);
}
