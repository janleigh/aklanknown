import { useUser } from "@clerk/expo";
import { controllers } from "@lib/api/supabase/controller";
import { supabase } from "@lib/api/supabase/supabase";
import {
	addBookmark,
	isBookmarked,
	removeBookmark,
	subscribeBookmarks,
} from "@lib/storage/bookmarks";
import type { Location as SupabaseLocation } from "@lib/types/supabase";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, ChevronLeft, ChevronRight, Heart, MapPin, Star, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Alert, Image, ScrollView, TextInput, TouchableOpacity, View } from "react-native";
import { Text } from "@/components/ui/Text";

type LocationDetails = {
	id: string;
	name: string;
	location: string;
	rating: number;
	reviews: number;
	description: string;
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
	isFlagged: boolean;
	avatarUrl?: string;
};

function buildLocationDetails(
	location: SupabaseLocation,
	imageUrls: string[],
	rating: number,
	reviews: number,
): LocationDetails {
	const description =
		location.description_en ||
		location.description_tl ||
		location.description_akl ||
		"No description available yet.";
	const locationLabel = [location.street, location.barangay, location.town]
		.filter(Boolean)
		.join(", ");
	const fallbackImages = [location.banner_image_url, location.panorama_image_url].filter(
		(imageUrl): imageUrl is string => Boolean(imageUrl),
	);
	const images = imageUrls.length > 0 ? imageUrls : fallbackImages;

	return {
		id: location.id,
		name: location.name,
		location: locationLabel || location.town || location.barangay || "Unknown location",
		rating,
		reviews,
		description,
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
	const [isSubmittingReview, setIsSubmittingReview] = useState(false);
	const [reviews, setReviews] = useState<ReviewItem[]>([]);

	useEffect(() => {
		let isMounted = true;

		const loadLocation = async () => {
			if (!locationId) {
				if (isMounted) {
					setLocation(null);
					setLoadError("Location not found.");
					setIsLoadingLocation(false);
				}
				return;
			}

			if (isMounted) {
				setIsLoadingLocation(true);
				setLoadError(null);
				setCurrentImageIndex(0);
			}

			try {
				const [locationResult, imageResult, reviewResult] = await Promise.all([
					controllers.location.getById(locationId),
					supabase
						.from("location_images")
						.select("image_url")
						.eq("location_id", locationId)
						.order("created_at", { ascending: true }),
					supabase
						.from("reviews")
						.select("id, rating, comment, created_at, user_id, is_flagged")
						.eq("location_id", locationId)
						.order("created_at", { ascending: false }),
				]);

				const imageUrls = [
					locationResult.banner_image_url,
					locationResult.panorama_image_url,
					...(imageResult.data ?? []).map((image) => image.image_url),
				].filter((imageUrl): imageUrl is string => Boolean(imageUrl));

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

				const reviewerIds = [
					...new Set(
						(reviewResult.data ?? [])
							.map((review) => review.user_id)
							.filter((reviewerId): reviewerId is string => Boolean(reviewerId)),
					),
				];
				const reviewerProfiles = await Promise.all(
					reviewerIds.map(async (reviewerId) => {
						try {
							return await controllers.user.getById(reviewerId);
						} catch {
							return null;
						}
					}),
				);
				const reviewerProfileById = new Map(
					reviewerProfiles
						.filter((profile) => profile !== null)
						.map((profile) => [profile.id, profile]),
				);

				const hydratedReviews: ReviewItem[] = (reviewResult.data ?? []).map((review) => {
					const profile = review.user_id ? reviewerProfileById.get(review.user_id) : null;
					return {
						id: review.id,
						userName: profile?.name ?? "Guest",
						rating: typeof review.rating === "number" ? review.rating : 0,
						date: review.created_at ? new Date(review.created_at).toLocaleDateString() : "Recently",
						comment: review.comment || "",
						isFlagged: Boolean(review.is_flagged),
						avatarUrl: profile?.avatar_url,
					};
				});

				if (isMounted) {
					setLocation(
						buildLocationDetails(
							locationResult,
							imageUrls,
							averageRating,
							(reviewResult.data ?? []).length,
						),
					);
					setReviews(hydratedReviews);
				}
			} catch (error) {
				console.error("[LocationDetails] Failed to load location:", error);
				if (isMounted) {
					setLocation(null);
					setLoadError("We couldn't find that location.");
				}
			} finally {
				if (isMounted) {
					setIsLoadingLocation(false);
				}
			}
		};

		loadLocation();

		return () => {
			isMounted = false;
		};
	}, [locationId]);

	useEffect(() => {
		const refreshBookmarkState = async () => {
			if (!locationId) return;
			const bookmarked = await isBookmarked(locationId);
			setIsFavorite(bookmarked);
		};

		const unsubscribe = subscribeBookmarks(() => {
			void refreshBookmarkState();
		});

		return unsubscribe;
	}, [locationId]);

	useEffect(() => {
		let isMounted = true;

		const loadBookmarkState = async () => {
			if (!locationId) {
				if (isMounted) {
					setIsFavorite(false);
				}
				return;
			}

			try {
				const bookmarked = await isBookmarked(locationId);
				if (isMounted) {
					setIsFavorite(bookmarked);
				}
			} catch (error) {
				console.error("[LocationDetails] Failed to load bookmark state:", error);
			}
		};

		void loadBookmarkState();

		return () => {
			isMounted = false;
		};
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

			setReviews((prev) => [
				{
					id: submittedReview.id,
					userName: user?.fullName || user?.firstName || "Guest",
					rating: userRating,
					date: new Date(submittedReview.created_at).toLocaleDateString(),
					comment: reviewText.trim(),
					isFlagged: false,
					avatarUrl: user?.imageUrl,
				},
				...prev,
			]);
			setReviewText("");
			setUserRating(0);
			Alert.alert("Review Submitted!", "Thank you for sharing your experience.");
		} catch (error) {
			console.error("[LocationDetails] Failed to submit review:", error);
			const errMsg = (error as Error).message ?? String(error);
			if (errMsg.includes("row-level security") || errMsg.includes("violates row-level security")) {
				Alert.alert(
					"Review Failed",
					"The server rejected the review due to permissions. Please sign in with an account that has permission to submit reviews or try again later.",
				);
			} else if (
				errMsg.includes("invalid input syntax for type uuid") ||
				errMsg.includes("22P02")
			) {
				Alert.alert(
					"Review Failed",
					"There was an issue with your account identifier. Your review was not saved. Please try signing out and signing back in.",
				);
			} else {
				Alert.alert("Review Failed", "We could not save your review right now.");
			}
		} finally {
			setIsSubmittingReview(false);
		}
	};

	const handleReportReview = async (reviewId: string) => {
		try {
			await controllers.review.update(reviewId, { is_flagged: true });
			setReviews((prev) =>
				prev.map((review) =>
					review.id === reviewId
						? {
								...review,
								isFlagged: true,
							}
						: review,
				),
			);
			Alert.alert("Reported", "Thanks for reporting this review. Our admins will review it.");
		} catch (error) {
			console.error("[LocationDetails] Failed to report review:", error);
			Alert.alert("Report Failed", "We couldn't report this review right now.");
		}
	};

	const toggleBookmark = async () => {
		if (!locationId) {
			return;
		}

		const nextValue = !isFavorite;
		setIsFavorite(nextValue);

		try {
			if (nextValue) {
				await addBookmark(locationId);
			} else {
				await removeBookmark(locationId);
			}
		} catch (error) {
			console.error("[LocationDetails] Failed to toggle bookmark:", error);
			setIsFavorite(!nextValue);
			Alert.alert("Bookmark Failed", "We couldn't save this bookmark right now.");
		}
	};

	if (isLoadingLocation) {
		return (
			<View className="flex-1 items-center justify-center px-6 bg-canvas">
				<Text className="text-center text-ink text-lg" fontName="PlusJakartaSans_700Bold">
					Loading location...
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

	const nextImage = () => {
		setCurrentImageIndex((prev) => (prev < location.images.length - 1 ? prev + 1 : 0));
	};

	const prevImage = () => {
		setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : location.images.length - 1));
	};

	return (
		<View className="flex-1 bg-canvas">
			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingBottom: 120 }}
			>
				{/* Image Carousel */}
				<View className="relative h-96 bg-surface-soft">
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
								onPress={toggleBookmark}
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
							{location.images.map((_, index: number) => (
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
				<View className="-mt-8 pt-8 px-6 bg-canvas rounded-t-4xl">
					<View className="flex-row justify-between items-start mb-2">
						<Text
							className="flex-1 text-3xl text-ink leading-tight pr-2"
							fontName="PlusJakartaSans_700Bold"
						>
							{location.name}
						</Text>
						<View className="items-end">
							<View className="flex-row items-center">
								<Star size={16} color="#FBBF24" fill="#FBBF24" />
								<Text className="ml-1 text-ink font-bold" fontName="PlusJakartaSans_700Bold">
									{location.rating}
								</Text>
							</View>
							<Text className="text-muted text-sm" fontName="PlusJakartaSans_400Regular">
								({location.reviews} reviews)
							</Text>
						</View>
					</View>

					<View className="flex-row items-center mb-6">
						<MapPin size={16} color="#929292" />
						<Text className="ml-1 text-muted text-sm" fontName="PlusJakartaSans_400Regular">
							{location.location}
						</Text>
					</View>

					<Text className="text-xl text-ink mb-3" fontName="PlusJakartaSans_700Bold">
						Description
					</Text>

					<Text className="mb-2 leading-6 text-body" fontName="PlusJakartaSans_400Regular">
						{isExpanded || location.description.length <= 120
							? location.description
							: `${location.description.slice(0, 120)}...`}
					</Text>
					{location.description.length > 120 && (
						<TouchableOpacity onPress={() => setIsExpanded(!isExpanded)} activeOpacity={0.7}>
							<Text
								className="mb-6 font-semibold text-primary"
								fontName="PlusJakartaSans_600SemiBold"
							>
								{isExpanded ? "Show less" : "Show more"}
							</Text>
						</TouchableOpacity>
					)}

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
						className={`items-center mb-8 py-3 rounded-xl ${isSubmittingReview ? "bg-primary/60" : "bg-primary"}`}
						onPress={handleSubmitReview}
						activeOpacity={0.8}
						disabled={isSubmittingReview}
					>
						<Text className="font-semibold text-on-primary" fontName="PlusJakartaSans_600SemiBold">
							{isSubmittingReview ? "Submitting..." : "Submit Review"}
						</Text>
					</TouchableOpacity>

					<View className="mb-6 h-px bg-hairline-soft" />

					<Text className="mb-4 text-ink text-lg" fontName="PlusJakartaSans_700Bold">
						Reviews ({reviews.length})
					</Text>

					{reviews.map((review) => (
						<View key={review.id} className="mb-6">
							<View className="flex-row items-start justify-between mb-2">
								<View className="flex-row items-center gap-3">
									<View className="h-10 w-10 bg-surface-strong rounded-full overflow-hidden">
										{review.avatarUrl ? (
											<Image source={{ uri: review.avatarUrl }} className="h-full w-full" />
										) : (
											<View className="h-full w-full items-center justify-center bg-primary/10">
												<Text
													className="text-primary font-bold text-lg"
													fontName="PlusJakartaSans_700Bold"
												>
													{review.userName.charAt(0).toUpperCase()}
												</Text>
											</View>
										)}
									</View>
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
								</View>
								<Text className="text-muted-soft text-sm" fontName="PlusJakartaSans_400Regular">
									{review.date}
								</Text>
							</View>
							<Text className="leading-5 text-body" fontName="PlusJakartaSans_400Regular">
								{review.comment}
							</Text>
							<View className="flex-row justify-end mt-3">
								<TouchableOpacity
									className={`rounded-full px-3 py-2 ${review.isFlagged ? "bg-primary/10" : "bg-error/10"}`}
									onPress={() => void handleReportReview(review.id)}
									disabled={review.isFlagged}
									activeOpacity={0.8}
								>
									<Text
										className={`text-xs font-semibold ${review.isFlagged ? "text-primary" : "text-error"}`}
										fontName="PlusJakartaSans_600SemiBold"
									>
										{review.isFlagged ? "Reported" : "Report Review"}
									</Text>
								</TouchableOpacity>
							</View>
						</View>
					))}
				</View>
			</ScrollView>

			<View className="absolute bottom-0 left-0 right-0 px-6 pb-6 py-4 bg-canvas border-t border-hairline-soft flex-row gap-4 items-center">
				<TouchableOpacity
					className="flex-1 items-center justify-center py-4 bg-surface-strong rounded-full"
					activeOpacity={0.8}
					onPress={() => {
						router.push(`/location/${locationId}/360`);
					}}
				>
					<Text className="font-semibold text-ink text-base" fontName="PlusJakartaSans_600SemiBold">
						View 360
					</Text>
				</TouchableOpacity>
				<TouchableOpacity
					className="flex-1 flex-row gap-2 items-center justify-center py-4 bg-primary rounded-full shadow-sm"
					activeOpacity={0.8}
					onPress={() => {
						router.push(`/location/${locationId}/map`);
					}}
				>
					<Text
						className="font-semibold text-white text-base"
						fontName="PlusJakartaSans_600SemiBold"
					>
						View on Map
					</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
}
