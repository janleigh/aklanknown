import { useAuth, useUser } from "@clerk/expo";
import { Text } from "@components/Text";
import { controllers } from "@lib/api/supabase/controller";
import type {
	Location as LocationRecord,
	Review as ReviewRecord,
	UserProfile,
} from "@lib/types/supabase";
import { useRouter } from "expo-router";
import {
	ArrowRight,
	BadgeAlert,
	Building2,
	FileText,
	MapPinned,
	Shield,
	Users,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { Button, Card, LoadingSpinner } from "@/components/index";

type AdminStats = {
	users: number;
	locations: number;
	reviews: number;
	flaggedReviews: number;
};

type AdminHighlights = {
	recentLocations: LocationRecord[];
	recentReviews: ReviewRecord[];
	recentUsers: UserProfile[];
};

const INITIAL_STATS: AdminStats = {
	users: 0,
	locations: 0,
	reviews: 0,
	flaggedReviews: 0,
};

const INITIAL_HIGHLIGHTS: AdminHighlights = {
	recentLocations: [],
	recentReviews: [],
	recentUsers: [],
};

export default function AdminDashboardScreen() {
	const router = useRouter();
	const { user, isLoaded } = useUser();
	const { signOut } = useAuth();
	const [isCheckingAccess, setIsCheckingAccess] = useState(true);
	const [hasAccess, setHasAccess] = useState(false);
	const [stats, setStats] = useState<AdminStats>(INITIAL_STATS);
	const [highlights, setHighlights] = useState<AdminHighlights>(INITIAL_HIGHLIGHTS);
	const [isLoadingData, setIsLoadingData] = useState(false);

	useEffect(() => {
		if (!isLoaded || !user) return;

		let isMounted = true;

		const checkAccess = async () => {
			try {
				const profile = await controllers.user.getById(user.id);
				if (!isMounted) return;
				setHasAccess(profile.role === "admin");
			} catch (error) {
				console.error("[Admin] Unable to load profile:", error);
				if (isMounted) {
					setHasAccess(false);
				}
			} finally {
				if (isMounted) {
					setIsCheckingAccess(false);
				}
			}
		};

		checkAccess();

		return () => {
			isMounted = false;
		};
	}, [isLoaded, user]);

	useEffect(() => {
		if (!hasAccess) return;

		let isMounted = true;

		const loadDashboard = async () => {
			setIsLoadingData(true);

			try {
				const [users, locations, reviews] = await Promise.all([
					controllers.user.list({ orderBy: "created_at" }),
					controllers.location.list({ orderBy: "created_at" }),
					controllers.review.list({ orderBy: "created_at" }),
				]);

				if (!isMounted) return;

				setStats({
					users: users.length,
					locations: locations.length,
					reviews: reviews.length,
					flaggedReviews: reviews.filter((review) => review.is_flagged).length,
				});

				setHighlights({
					recentLocations: locations.slice(0, 3),
					recentReviews: reviews.slice(0, 3),
					recentUsers: users.slice(0, 3),
				});
			} catch (error) {
				console.error("[Admin] Failed to load dashboard data:", error);
			} finally {
				if (isMounted) {
					setIsLoadingData(false);
				}
			}
		};

		loadDashboard();

		return () => {
			isMounted = false;
		};
	}, [hasAccess]);

	const handleSignOut = async () => {
		await signOut();
		router.replace("/(landing)");
	};

	if (!isLoaded || isCheckingAccess) {
		return (
			<View className="flex-1 items-center justify-center bg-surface-soft">
				<LoadingSpinner />
				<Text className="mt-4 text-muted" fontName="PlusJakartaSans_500Medium">
					Loading admin access...
				</Text>
			</View>
		);
	}

	if (!hasAccess) {
		return (
			<View className="flex-1 items-center justify-center bg-surface-soft px-6">
				<Card className="w-full max-w-md items-center">
					<View className="mb-4 h-14 w-14 items-center justify-center rounded-full bg-error/10">
						<Shield size={24} color="#ef4444" />
					</View>
					<Text className="mb-2 text-center text-2xl text-ink" fontName="PlusJakartaSans_700Bold">
						Admin access required
					</Text>
					<Text className="mb-6 text-center text-muted" fontName="PlusJakartaSans_400Regular">
						Your account is signed in, but it does not have the admin role yet.
					</Text>
					<Button
						label="Back to Home"
						onPress={() => router.replace("/(home)")}
						className="w-full"
					/>
				</Card>
			</View>
		);
	}

	return (
		<ScrollView className="flex-1 bg-surface-soft" contentContainerClassName="pb-10">
			<View className="px-4 pb-6 pt-14 bg-primary">
				<View className="mb-4 flex-row items-center justify-between">
					<View className="flex-row items-center">
						<View className="mr-3 h-11 w-11 items-center justify-center rounded-2xl bg-on-primary/15">
							<Shield size={20} color="#ffffff" />
						</View>
						<View>
							{/* <Text className="text-sm text-on-primary/80" fontName="PlusJakartaSans_500Medium">
								Admin Panel
							</Text> */}
							<Text className="text-2xl text-on-primary" fontName="PlusJakartaSans_700Bold">
								Admin Panel
							</Text>
						</View>
					</View>
					<Pressable
						className="h-11 w-11 items-center justify-center rounded-full bg-on-primary/15"
						onPress={() => router.push("/(home)")}
					>
						<ArrowRight size={18} color="#ffffff" />
					</Pressable>
				</View>
			</View>

			<View className="-mt-4 px-4">
				<View className="mb-4 flex-row gap-3">
					<AdminMetric icon={Users} label="Users" value={stats.users} />
					<AdminMetric icon={MapPinned} label="Locations" value={stats.locations} />
				</View>
				<View className="mb-4 flex-row gap-3">
					<AdminMetric icon={FileText} label="Reviews" value={stats.reviews} />
					<AdminMetric icon={BadgeAlert} label="Flagged" value={stats.flaggedReviews} />
				</View>

				<Card className="mb-4">
					<View className="mb-4 flex-row items-center justify-between">
						<View>
							<Text className="text-lg text-ink" fontName="PlusJakartaSans_700Bold">
								Quick Actions
							</Text>
							{/* <Text className="text-muted" fontName="PlusJakartaSans_400Regular">
								Common admin tasks and shortcuts.
							</Text> */}
						</View>
						<Building2 size={20} color="#ff385c" />
					</View>
					<View className="gap-3">
						<AdminAction
							label="Manage Locations"
							description="Keep place data accurate and current."
							onPress={() => router.push("/(admin)/location")}
						/>
						<AdminAction
							label="Review Flagged Reports"
							description="Check suspicious or reported content."
							onPress={() => router.push("/+not-found")}
						/>
						<AdminAction
							label="Inspect Users"
							description="Track accounts and role assignments."
							onPress={() => router.push("/+not-found")}
						/>
					</View>
				</Card>

				<Card className="mb-4">
					<View className="mb-4">
						<Text className="text-lg text-ink" fontName="PlusJakartaSans_700Bold">
							Flagged Reviews
						</Text>
						<Text className="text-muted" fontName="PlusJakartaSans_400Regular">
							Watchlist items that may need attention.
						</Text>
					</View>
					<View className="gap-3">
						{highlights.recentReviews.length === 0 ? (
							<Text className="text-muted" fontName="PlusJakartaSans_400Regular">
								No reviews available yet.
							</Text>
						) : (
							highlights.recentReviews.map((review) => (
								<View
									key={review.id}
									className="rounded-xl border border-hairline bg-surface-soft px-4 py-3"
								>
									<Text className="text-ink" fontName="PlusJakartaSans_600SemiBold">
										{review.comment ?? "No comment provided"}
									</Text>
									<Text className="text-sm text-muted" fontName="PlusJakartaSans_400Regular">
										Rating: {review.rating ?? "N/A"}
									</Text>
								</View>
							))
						)}
					</View>
				</Card>
			</View>
		</ScrollView>
	);
}

function AdminMetric({
	icon: Icon,
	label,
	value,
	accent = false,
}: {
	icon: typeof Shield;
	label: string;
	value: number;
	accent?: boolean;
}) {
	return (
		<Card className="flex-1">
			<View className="flex-row items-start justify-between">
				<View>
					<Text className="text-sm text-muted" fontName="PlusJakartaSans_500Medium">
						{label}
					</Text>
					<Text
						className={`mt-1 text-3xl ${accent ? "text-error" : "text-ink"}`}
						fontName="PlusJakartaSans_700Bold"
					>
						{value}
					</Text>
				</View>
				<View
					className={`h-11 w-11 items-center justify-center rounded-2xl ${accent ? "bg-error/10" : "bg-primary/10"}`}
				>
					<Icon size={18} color={accent ? "#ef4444" : "#ff385c"} />
				</View>
			</View>
		</Card>
	);
}

function AdminAction({
	label,
	description,
	onPress,
}: {
	label: string;
	description: string;
	onPress?: () => void;
}) {
	return (
		<Pressable
			onPress={onPress}
			className="flex-row items-center justify-between rounded-xl border border-hairline bg-surface-soft px-4 py-4"
		>
			<View className="flex-1 pr-3">
				<Text className="text-ink" fontName="PlusJakartaSans_600SemiBold">
					{label}
				</Text>
				<Text className="text-sm text-muted" fontName="PlusJakartaSans_400Regular">
					{description}
				</Text>
			</View>
			<ArrowRight size={18} color="#929292" />
		</Pressable>
	);
}
