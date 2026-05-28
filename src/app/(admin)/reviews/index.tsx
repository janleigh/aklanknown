import { controllers } from "@lib/api/supabase/controller";
import type {
	Location as LocationRecord,
	Review as ReviewRecord,
	UserProfile,
} from "@lib/types/supabase";
import { useRouter } from "expo-router";
import { ArrowLeft, BadgeAlert, CircleCheck, MapPin, Trash2, User } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { Alert, FlatList, TouchableOpacity, View } from "react-native";
import { LoadingSpinner } from "@/components/index";
import { Text } from "@/components/ui/Text";

type FlaggedReviewItem = ReviewRecord & {
	locationName: string;
	authorName: string;
};

export default function AdminReviewsScreen() {
	const router = useRouter();
	const [reviews, setReviews] = useState<FlaggedReviewItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [activeReviewId, setActiveReviewId] = useState<string | null>(null);

	useEffect(() => {
		let isMounted = true;

		const loadReviews = async () => {
			setIsLoading(true);

			try {
				const reviewRecords = await controllers.review.list({ orderBy: "created_at" });
				const flaggedReviews = reviewRecords.filter((review) => review.is_flagged);
				const locationIds = [
					...new Set(
						flaggedReviews
							.map((review) => review.location_id)
							.filter((id): id is string => Boolean(id)),
					),
				];
				const userIds = [
					...new Set(
						flaggedReviews
							.map((review) => review.user_id)
							.filter((id): id is string => Boolean(id)),
					),
				];

				const [locations, users] = await Promise.all([
					Promise.all(
						locationIds.map(async (locationId) => {
							try {
								return await controllers.location.getById(locationId);
							} catch {
								return null;
							}
						}),
					),
					Promise.all(
						userIds.map(async (userId) => {
							try {
								return await controllers.user.getById(userId);
							} catch {
								return null;
							}
						}),
					),
				]);

				const locationNameById = new Map(
					locations
						.filter((location): location is LocationRecord => location !== null)
						.map((location) => [location.id, location.name]),
				);
				const userNameById = new Map(
					users
						.filter((user): user is UserProfile => user !== null)
						.map((user) => [user.id, user.name]),
				);

				if (!isMounted) return;

				setReviews(
					flaggedReviews.map((review) => ({
						...review,
						locationName: review.location_id
							? (locationNameById.get(review.location_id) ?? "Unknown location")
							: "Unknown location",
						authorName: review.user_id ? (userNameById.get(review.user_id) ?? "Guest") : "Guest",
					})),
				);
			} catch (error) {
				console.error("[Admin Reviews] Failed to load flagged reviews:", error);
				if (isMounted) {
					setReviews([]);
				}
			} finally {
				if (isMounted) {
					setIsLoading(false);
				}
			}
		};

		loadReviews();

		return () => {
			isMounted = false;
		};
	}, []);

	const handleResolve = async (reviewId: string) => {
		setActiveReviewId(reviewId);
		try {
			await controllers.review.update(reviewId, { is_flagged: false });
			setReviews((prev) => prev.filter((review) => review.id !== reviewId));
		} catch (error) {
			console.error("[Admin Reviews] Failed to resolve review:", error);
			Alert.alert("Update Failed", "We couldn't clear that report right now.");
		} finally {
			setActiveReviewId(null);
		}
	};

	const handleDelete = async (reviewId: string, reviewLabel: string) => {
		Alert.alert("Delete review?", `This will permanently remove the report for ${reviewLabel}.`, [
			{ text: "Cancel", style: "cancel" },
			{
				text: "Delete",
				style: "destructive",
				onPress: () => {
					void (async () => {
						setActiveReviewId(reviewId);
						try {
							await controllers.review.remove(reviewId);
							setReviews((prev) => prev.filter((review) => review.id !== reviewId));
						} catch (error) {
							console.error("[Admin Reviews] Failed to delete review:", error);
							Alert.alert("Delete Failed", "We couldn't delete that review right now.");
						} finally {
							setActiveReviewId(null);
						}
					})();
				},
			},
		]);
	};

	const emptyState = useMemo(
		() => (
			<View className="items-center justify-center px-8 py-16">
				<View className="items-center justify-center mb-4 h-14 w-14 bg-primary/10 rounded-full">
					<BadgeAlert size={24} color="#ff385c" />
				</View>
				<Text className="mb-2 text-center text-ink text-lg" fontName="PlusJakartaSans_700Bold">
					No flagged reviews
				</Text>
				<Text className="text-center text-muted" fontName="PlusJakartaSans_400Regular">
					Flagged reports will appear here once users report suspicious content.
				</Text>
			</View>
		),
		[],
	);

	return (
		<View className="flex-1 bg-surface-soft">
			<View className="flex-row gap-3 items-center pb-4 pt-14 px-4 bg-canvas border-b border-hairline">
				<TouchableOpacity
					onPress={() => router.back()}
					className="items-center justify-center h-10 w-10 bg-surface-soft rounded-full"
					activeOpacity={0.8}
				>
					<ArrowLeft size={20} color="#1a1a1a" />
				</TouchableOpacity>
				<View className="flex-1">
					<Text className="text-2xl text-ink" fontName="PlusJakartaSans_700Bold">
						Flagged Reviews
					</Text>
					<Text className="text-muted" fontName="PlusJakartaSans_400Regular">
						Review and resolve reported content.
					</Text>
				</View>
			</View>

			{isLoading ? (
				<View className="flex-1 items-center justify-center">
					<LoadingSpinner size="large" />
				</View>
			) : (
				<FlatList
					data={reviews}
					keyExtractor={(item) => item.id}
					contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
					showsVerticalScrollIndicator={false}
					ListEmptyComponent={emptyState}
					renderItem={({ item }) => (
						<View className="mb-4 bg-canvas rounded-[28px] shadow-sm p-5">
							<View className="flex-row gap-3 items-start justify-between">
								<View className="flex-1">
									<View className="flex-row gap-2 items-center mb-2">
										<View className="items-center justify-center h-8 w-8 bg-primary/10 rounded-full">
											<BadgeAlert size={14} color="#ff385c" />
										</View>
										<Text className="text-ink" fontName="PlusJakartaSans_700Bold">
											{item.locationName}
										</Text>
									</View>
									<View className="flex-row gap-2 items-center mb-2">
										<User size={14} color="#929292" />
										<Text className="text-muted text-sm" fontName="PlusJakartaSans_400Regular">
											{item.authorName}
										</Text>
									</View>
									<View className="flex-row gap-2 items-center mb-2">
										<MapPin size={14} color="#929292" />
										<Text className="text-muted text-sm" fontName="PlusJakartaSans_400Regular">
											Rating: {item.rating ?? "N/A"}
										</Text>
									</View>
									<Text className="text-ink" fontName="PlusJakartaSans_400Regular">
										{item.comment ?? "No comment provided"}
									</Text>
								</View>
								<View className="gap-2">
									<TouchableOpacity
										className="items-center justify-center h-10 w-10 bg-primary/10 rounded-xl"
										onPress={() => void handleResolve(item.id)}
										disabled={activeReviewId === item.id}
										activeOpacity={0.75}
									>
										<CircleCheck size={16} color="#ff385c" />
									</TouchableOpacity>
									<TouchableOpacity
										className="items-center justify-center h-10 w-10 bg-error/10 rounded-xl"
										onPress={() => void handleDelete(item.id, item.locationName)}
										disabled={activeReviewId === item.id}
										activeOpacity={0.75}
									>
										<Trash2 size={16} color="#ef4444" />
									</TouchableOpacity>
								</View>
							</View>
						</View>
					)}
				/>
			)}
		</View>
	);
}
