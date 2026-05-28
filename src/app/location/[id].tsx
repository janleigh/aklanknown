import { controllers } from "@lib/api/supabase/controller";
import { supabase } from "@lib/api/supabase/supabase";
import type { Location as SupabaseLocation } from "@lib/types/supabase";
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
	User,
	X,
} from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import { useUser } from "@clerk/expo";
import { Alert, Dimensions, Image, KeyboardAvoidingView, Linking, Modal, Platform, ScrollView, TextInput, TouchableOpacity, View } from "react-native";
import { Text } from "@/components/Text";

type LocationDetails = {
	id: string;
	name: string;
	location: string;
	rating: number;
	reviews: number;
	description: string;
	fullDescription: string;
	images: string[];
	latitude?: number | null;
	longitude?: number | null;
};

type ReviewItem = {
	id: string;
	userName: string;
	rating: number;
	date: string;
	comment: string;
};

function buildLocationDetails(
	location: SupabaseLocation,
	imageUrls: string[],
	rating: number,
	reviews: number,
): LocationDetails {
	const description = location.description_en || location.description_tl || location.description_akl || "No description available yet.";
	const locationLabel = [location.street, location.barangay, location.town].filter(Boolean).join(", ");
	const fallbackImages = [location.banner_image_url, location.panorama_image_url].filter(Boolean) as string[];
	const images = imageUrls.length > 0 ? imageUrls : fallbackImages;

	return {
		id: location.id,
		name: location.name,
		location: locationLabel || location.town || location.barangay || "Unknown location",
		rating,
		reviews,
		description,
		fullDescription: description,
		images: images.length > 0 ? images : ["https://picsum.photos/seed/location/800/400"],
		latitude: location.latitude,
		longitude: location.longitude,
	};
}

export default function LocationDetailsScreen() {
	const { id } = useLocalSearchParams();
	const router = useRouter();
	const { user } = useUser();

	const locationId = typeof id === "string" ? id : Array.isArray(id) ? id[0] : "";
	const [location, setLocation] = useState<LocationDetails | null>(null);
	const [isLoadingLocation, setIsLoadingLocation] = useState(true);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const [isExpanded, setIsExpanded] = useState(false);
	const [userRating, setUserRating] = useState(0);
	const [reviewText, setReviewText] = useState("");
	const [isFavorite, setIsFavorite] = useState(false);
	const [reviews, setReviews] = useState<ReviewItem[]>([]);
	const [isSubmittingReview, setIsSubmittingReview] = useState(false);
	const [isImageModalVisible, setIsImageModalVisible] = useState(false);
	const [imageError, setImageError] = useState(false);
	const [showAllReviews, setShowAllReviews] = useState(false);

	const isMountedRef = useRef(true);

	useEffect(() => {
		isMountedRef.current = true;
		return () => { isMountedRef.current = false; };
	}, []);

	useEffect(() => {
		const loadLocation = async () => {
			if (!locationId) {
				if (isMountedRef.current) {
					setLocation(null);
					setLoadError("Location not found.");
					setIsLoadingLocation(false);
				}
				return;
			}

			if (isMountedRef.current) {
				setIsLoadingLocation(true);
				setLoadError(null);
				setCurrentImageIndex(0);
				setImageError(false);
			}

			try {
				const [locationResult, imageResult, reviewResult] = await Promise.all([
					controllers.location.getById(locationId),
					supabase.from("location_images").select("image_url").eq("location_id", locationId).order("created_at", { ascending: true }),
					supabase.from("reviews").select("id, rating, comment, created_at, user_id").eq("location_id", locationId).order("created_at", { ascending: false }),
				]);

				const imageUrls = [
					locationResult.banner_image_url,
					locationResult.panorama_image_url,
					...(imageResult.data ?? []).map((i) => i.image_url),
				].filter(Boolean) as string[];

				const numericRatings = (reviewResult.data ?? []).flatMap((r) => (typeof r.rating === "number" ? [r.rating] : []));
				const averageRating = numericRatings.length > 0 ? Number((numericRatings.reduce((s, r) => s + r, 0) / numericRatings.length).toFixed(1)) : 0;

				const reviewerIds = [...new Set((reviewResult.data ?? []).map((r) => r.user_id).filter(Boolean) as string[])];
				const reviewerProfiles = await Promise.all(reviewerIds.map(async (rid) => {
					try { return await controllers.user.getById(rid); } catch { return null; }
				}));

				const reviewerNameById = new Map(
					reviewerProfiles.filter((p): p is NonNullable<typeof p> => p !== null).map((p) => [p.id, p.name])
				);

				const hydratedReviews: ReviewItem[] = (reviewResult.data ?? []).map((r) => ({
					id: r.id,
					userName: r.user_id ? reviewerNameById.get(r.user_id) ?? "Guest" : "Guest",
					rating: typeof r.rating === "number" ? r.rating : 0,
					date: r.created_at ? new Date(r.created_at).toLocaleDateString("en-PH", { day: "2-digit", month: "short", year: "numeric" }) : "Recently",
					comment: r.comment || "",
				}));

				if (isMountedRef.current) {
					setLocation(buildLocationDetails(locationResult, imageUrls, averageRating, (reviewResult.data ?? []).length));
					setReviews(hydratedReviews);
				}
			} catch (error) {
				console.error("[LocationDetails] Failed to load:", error);
				if (isMountedRef.current) {
					setLocation(null);
					setLoadError("We couldn't find that location.");
				}
			} finally {
				if (isMountedRef.current) setIsLoadingLocation(false);
			}
		};
		loadLocation();
	}, [locationId]);

	const handleSubmitReview = async () => {
		if (!reviewText.trim() || userRating === 0) {
			Alert.alert("Missing Info", "Please select a rating and write your review.");
			return;
		}
		if (!locationId) {
			Alert.alert("Missing Location", "We could not determine which location to review.");
			return;
		}

		setIsSubmittingReview(true);
		try {
			const submittedReview = await controllers.review.create({
				location_id: locationId,
				user_id: user?.id ?? null,
				rating: userRating,
				comment: reviewText.trim(),
				is_flagged: false,
			});
			if (isMountedRef.current) {
				setReviews((prev) => [{
					id: submittedReview.id,
					userName: user?.fullName || user?.firstName || "Guest",
					rating: userRating,
					date: new Date(submittedReview.created_at).toLocaleDateString("en-PH", { day: "2-digit", month: "short", year: "numeric" }),
					comment: reviewText.trim(),
				}, ...prev]);
				setReviewText("");
				setUserRating(0);
				Alert.alert("Review Submitted!", "Thank you for sharing your experience.");
			}
		} catch (error: any) {
			const errMsg = error?.message ?? String(error);
			if (isMountedRef.current) {
				if (errMsg.includes("row-level security")) {
					Alert.alert("Review Failed", "Permission denied. Please ensure you're signed in.");
				} else {
					Alert.alert("Review Failed", "We could not save your review right now.");
				}
			}
		} finally {
			if (isMountedRef.current) setIsSubmittingReview(false);
		}
	};

	const openContextualMap = async () => {
		if (!location?.latitude || !location?.longitude) {
			Alert.alert("Map Unavailable", "This location doesn't have coordinates yet.");
			return;
		}
		
		const lat = location.latitude;
		const lng = location.longitude;
		const encodedName = encodeURIComponent(location.name);
		
		const url = Platform.select({
			ios: `http://maps.apple.com/?q=${encodedName}&ll=${lat},${lng}`,
			android: `geo:0,0?q=${lat},${lng}(${encodedName})`,
			default: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
		});

		if (!url) {
			Alert.alert("Map Unavailable", "Could not generate map URL.");
			return;
		}

		const supported = await Linking.canOpenURL(url);
		if (supported) {
			await Linking.openURL(url);
		} else {
			Alert.alert("Map Unavailable", "Could not open map app on this device.");
		}
	};

	const nextImage = () => {
		if (!location) return;
		setImageError(false);
		setCurrentImageIndex((p) => (p < location.images.length - 1 ? p + 1 : 0));
	};

	const prevImage = () => {
		if (!location) return;
		setImageError(false);
		setCurrentImageIndex((p) => (p > 0 ? p - 1 : location.images.length - 1));
	};

	const visibleThumbnails = useMemo(() => location?.images.slice(0, 3) ?? [], [location]);
	const remainingImages = useMemo(() => Math.max(0, (location?.images.length ?? 0) - 3), [location]);

	const renderImageSection = () => (
		<View className="relative h-[420px]">
			{!imageError && location?.images[currentImageIndex] ? (
				<Image 
					source={{ uri: location.images[currentImageIndex] }} 
					className="w-full h-[420px]" 
					resizeMode="cover" 
					onError={() => setImageError(true)} 
				/>
			) : (
				<View className="w-full h-[420px] items-center justify-center bg-surface-soft">
					<MapPin size={48} color="#929292" />
				</View>
			)}
			<View className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />

			<View className="absolute top-12 left-4 right-4 flex-row justify-between items-center z-20">
				<TouchableOpacity 
					className="h-11 w-11 items-center justify-center bg-white/90 backdrop-blur-md rounded-full shadow-lg" 
					onPress={() => router.back()} 
					activeOpacity={0.7}
				>
					<ArrowLeft size={20} color="#222222" />
				</TouchableOpacity>
				<TouchableOpacity 
					className="h-11 w-11 items-center justify-center bg-white/90 backdrop-blur-md rounded-full shadow-lg" 
					onPress={() => setIsFavorite(!isFavorite)} 
					activeOpacity={0.7}
				>
					<Heart size={18} color={isFavorite ? "#ff385c" : "#222222"} fill={isFavorite ? "#ff385c" : "none"} />
				</TouchableOpacity>
			</View>

			<TouchableOpacity 
				className="absolute inset-0 z-10" 
				activeOpacity={0.9}
				onPress={() => setIsImageModalVisible(true)}
			/>

			{location && location.images.length > 1 && (
				<View className="absolute top-24 left-4 z-20">
					<View className="bg-canvas rounded-2xl p-1.5 shadow-xl">
						{visibleThumbnails.map((_, idx) => (
							<TouchableOpacity 
								key={idx} 
								className={`mb-1.5 rounded-xl overflow-hidden ${currentImageIndex === idx ? "opacity-100 ring-2 ring-primary" : "opacity-70"}`} 
								onPress={() => setCurrentImageIndex(idx)} 
								activeOpacity={0.8}
							>
								<Image source={{ uri: location.images[idx] }} className="h-16 w-16" resizeMode="cover" />
							</TouchableOpacity>
						))}
						{remainingImages > 0 && (
							<TouchableOpacity 
								className="h-16 w-16 items-center justify-center bg-scrim/60 rounded-xl" 
								onPress={() => setIsImageModalVisible(true)} 
								activeOpacity={0.8}
							>
								<Text className="text-on-dark font-bold text-sm">+{remainingImages}</Text>
							</TouchableOpacity>
						)}
					</View>
				</View>
			)}

			{location && location.images.length > 1 && (
				<>
					<TouchableOpacity 
						className="absolute left-4 bottom-6 h-12 w-12 items-center justify-center bg-white/90 backdrop-blur-md rounded-full shadow-lg z-20" 
						onPress={(e) => { e.stopPropagation(); prevImage(); }} 
						activeOpacity={0.7}
					>
						<ChevronLeft size={24} color="#222222" />
					</TouchableOpacity>
					<TouchableOpacity 
						className="absolute right-4 bottom-6 h-12 w-12 items-center justify-center bg-white/90 backdrop-blur-md rounded-full shadow-lg z-20" 
						onPress={(e) => { e.stopPropagation(); nextImage(); }} 
						activeOpacity={0.7}
					>
						<ChevronRight size={24} color="#222222" />
					</TouchableOpacity>
				</>
			)}
		</View>
	);

	const renderContentSection = () => (
		<View className="px-5 py-6">
			<View className="mb-5">
				<Text className="text-3xl font-bold text-ink mb-2" fontName="PlusJakartaSans_700Bold">
					{location?.name}
				</Text>
				<View className="flex-row items-center gap-2">
					<MapPin size={18} color="#ff385c" />
					<Text className="flex-1 text-body text-base" numberOfLines={2} fontName="PlusJakartaSans_400Regular">
						{location?.location}
					</Text>
				</View>
			</View>

			<View className="mb-6">
				<View className="flex-row items-center gap-2">
					<Star size={18} color="#FBBF24" fill="#FBBF24" />
					<Text className="text-xl font-bold text-ink" fontName="PlusJakartaSans_700Bold">
						{location?.rating.toFixed(1)}
					</Text>
					<Text className="text-muted text-sm">
						({location?.reviews} {location?.reviews === 1 ? "review" : "reviews"})
					</Text>
				</View>
			</View>

			{/* ✅ ENHANCED ABOUT SECTION */}
			<View className="mb-8">
				<Text className="text-xl font-bold text-ink mb-3" fontName="PlusJakartaSans_700Bold">About</Text>
				<Text className="text-base text-body leading-7" fontName="PlusJakartaSans_400Regular">
					{isExpanded ? location?.fullDescription : location?.description}
				</Text>
				{location && location.description.length > 120 && (
					<TouchableOpacity onPress={() => setIsExpanded(!isExpanded)} className="mt-3" activeOpacity={0.7}>
						<Text className="text-primary text-sm font-semibold" fontName="PlusJakartaSans_600SemiBold">
							{isExpanded ? "Read Less" : "Read More"}
						</Text>
					</TouchableOpacity>
				)}
			</View>

			<View className="flex-row gap-3 mb-8">
				<TouchableOpacity 
					className="flex-1 flex-row gap-2 items-center justify-center py-3.5 bg-primary rounded-2xl shadow-lg shadow-primary/30" 
					activeOpacity={0.8} 
					onPress={openContextualMap}
				>
					<MapIcon size={18} color="#ffffff" />
					<Text className="font-semibold text-on-primary text-sm" fontName="PlusJakartaSans_600SemiBold">View on Map</Text>
				</TouchableOpacity>
				<TouchableOpacity 
					className="flex-1 flex-row gap-2 items-center justify-center py-3.5 bg-primary/10 rounded-2xl border border-primary/20" 
					activeOpacity={0.8} 
					onPress={() => router.push(`/location/${locationId}/360`)}
				>
					<Camera size={18} color="#ff385c" />
					<Text className="font-semibold text-primary text-sm" fontName="PlusJakartaSans_600SemiBold">View 360</Text>
				</TouchableOpacity>
			</View>

			<View className="mb-6">
				<View className="flex-row items-center justify-between mb-4">
					<Text className="text-lg font-bold text-ink" fontName="PlusJakartaSans_700Bold">
						Reviews ({reviews.length})
					</Text>
					{reviews.length > 3 && !showAllReviews && (
						<TouchableOpacity onPress={() => setShowAllReviews(true)} activeOpacity={0.7}>
							<Text className="text-primary text-sm font-semibold" fontName="PlusJakartaSans_600SemiBold">View all</Text>
						</TouchableOpacity>
					)}
				</View>
				
				{reviews.length === 0 ? (
					<View className="py-4">
						<Text className="text-center text-muted text-base" fontName="PlusJakartaSans_400Regular">
							No reviews yet. Be the first!
						</Text>
					</View>
				) : (
					<>
						{(showAllReviews ? reviews : reviews.slice(0, 3)).map((review) => (
							<View key={review.id} className="mb-4 pb-4 border-b border-hairline-soft last:border-b-0">
								<View className="flex-row items-start justify-between mb-2">
									<View className="flex-row items-center flex-1">
										<View className="h-9 w-9 rounded-full bg-primary/10 items-center justify-center mr-3">
											<User size={16} color="#ff385c" />
										</View>
										<View className="flex-1">
											<Text className="font-semibold text-ink text-sm" fontName="PlusJakartaSans_600SemiBold">
												{review.userName}
											</Text>
											<Text className="text-muted-soft text-xs mt-0.5">{review.date}</Text>
										</View>
									</View>
									{/* ✅ SMALLER REVIEW STARS */}
									<View className="flex-row gap-0.5">
										{Array.from({ length: review.rating }).map((_, i) => (
											<Star key={i} size={11} color="#FBBF24" fill="#FBBF24" />
										))}
									</View>
								</View>
								<Text className="text-body text-sm leading-5" fontName="PlusJakartaSans_400Regular">
									{review.comment}
								</Text>
							</View>
						))}
						
						{showAllReviews && (
							<TouchableOpacity onPress={() => setShowAllReviews(false)} className="mt-2 py-3" activeOpacity={0.7}>
								<Text className="text-center text-primary text-sm font-semibold" fontName="PlusJakartaSans_600SemiBold">
									Show less
								</Text>
							</TouchableOpacity>
						)}
					</>
				)}
			</View>

			<KeyboardAvoidingView 
				behavior={Platform.OS === "ios" ? "padding" : "height"} 
				className="mb-6"
			>
				<Text className="text-lg font-bold text-ink mb-4" fontName="PlusJakartaSans_700Bold">
					Write a Review
				</Text>
				<View className="flex-row gap-1 mb-4 justify-center">
					{[1, 2, 3, 4, 5].map((star) => (
						<TouchableOpacity key={star} onPress={() => setUserRating(star)} activeOpacity={0.7}>
							<Star size={28} color={star <= userRating ? "#FBBF24" : "#e5e7eb"} fill={star <= userRating ? "#FBBF24" : "none"} />
						</TouchableOpacity>
					))}
				</View>
				<View className="bg-surface-soft rounded-2xl p-3 border border-hairline-soft shadow-sm mb-4">
					<TextInput
						className="h-24 text-sm text-body"
						placeholder="Share your experience..."
						placeholderTextColor="#929292"
						multiline
						value={reviewText}
						onChangeText={setReviewText}
						textAlignVertical="top"
					/>
				</View>
				<TouchableOpacity
					className={`items-center py-4 rounded-2xl shadow-lg ${isSubmittingReview ? "bg-primary/60 shadow-none" : "bg-primary shadow-primary/30"}`}
					onPress={handleSubmitReview}
					activeOpacity={0.8}
					disabled={isSubmittingReview}
				>
					<Text className="font-semibold text-on-primary text-sm" fontName="PlusJakartaSans_600SemiBold">
						{isSubmittingReview ? "Submitting..." : "Submit Review"}
					</Text>
				</TouchableOpacity>
			</KeyboardAvoidingView>
		</View>
	);

	if (isLoadingLocation) {
		return (
			<View className="flex-1 items-center justify-center bg-canvas px-6">
				<Text className="text-center text-ink text-lg" fontName="PlusJakartaSans_700Bold">Loading location...</Text>
			</View>
		);
	}
	if (!location) {
		return (
			<View className="flex-1 items-center justify-center bg-canvas px-6">
				<Text className="mb-3 text-center text-ink text-lg" fontName="PlusJakartaSans_700Bold">{loadError ?? "Location not found."}</Text>
				<TouchableOpacity className="px-5 py-3 bg-primary rounded-xl" onPress={() => router.back()} activeOpacity={0.8}>
					<Text className="font-semibold text-on-primary" fontName="PlusJakartaSans_600SemiBold">Go Back</Text>
				</TouchableOpacity>
			</View>
		);
	}

	return (
		<KeyboardAvoidingView 
			className="flex-1 bg-canvas" 
			behavior={Platform.OS === "ios" ? "padding" : undefined}
			keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
		>
			<ScrollView 
				showsVerticalScrollIndicator={false} 
				className="flex-1" 
				contentContainerClassName="pb-8"
				keyboardShouldPersistTaps="handled"
			>
				{renderImageSection()}
				{renderContentSection()}
			</ScrollView>

			<Modal visible={isImageModalVisible} transparent={false} animationType="fade" onRequestClose={() => setIsImageModalVisible(false)}>
				<View className="flex-1 bg-black items-center justify-center relative">
					<TouchableOpacity 
						className="absolute top-12 right-4 z-20 h-10 w-10 items-center justify-center bg-white/20 rounded-full" 
						onPress={() => setIsImageModalVisible(false)} 
						activeOpacity={0.7}
					>
						<X size={24} color="#fff" />
					</TouchableOpacity>
					<Image source={{ uri: location?.images[currentImageIndex] }} className="w-full h-full" resizeMode="contain" />
					{location && location.images.length > 1 && (
						<>
							<TouchableOpacity 
								className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 items-center justify-center bg-white/20 rounded-full" 
								onPress={prevImage} 
								activeOpacity={0.7}
							>
								<ChevronLeft size={28} color="#fff" />
							</TouchableOpacity>
							<TouchableOpacity 
								className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 items-center justify-center bg-white/20 rounded-full" 
								onPress={nextImage} 
								activeOpacity={0.7}
							>
								<ChevronRight size={28} color="#fff" />
							</TouchableOpacity>
						</>
					)}
					{location && location.images.length > 1 && (
						<View className="absolute bottom-8 bg-scrim/60 px-4 py-2 rounded-full">
							<Text className="text-on-dark text-sm font-medium">
								{currentImageIndex + 1} / {location.images.length}
							</Text>
						</View>
					)}
				</View>
			</Modal>
		</KeyboardAvoidingView>
	);
}