import { Text } from "@components/Text";
import { controllers } from "@lib/api/supabase/controller";
import type { UserProfile } from "@lib/types/supabase";
import { useRouter } from "expo-router";
import { ArrowLeft, Shield, UserRound } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { Image, ScrollView, TextInput, TouchableOpacity, View } from "react-native";
import { Card, LoadingSpinner } from "@/components/index";

export default function AdminUsersScreen() {
	const router = useRouter();
	const [users, setUsers] = useState<UserProfile[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");

	useEffect(() => {
		let isMounted = true;

		const loadUsers = async () => {
			setIsLoading(true);
			try {
				const data = await controllers.user.list({ orderBy: "created_at" });
				if (isMounted) {
					setUsers(data);
				}
			} catch (error) {
				console.error("[Admin Users] Failed to load users:", error);
			} finally {
				if (isMounted) {
					setIsLoading(false);
				}
			}
		};

		loadUsers();

		return () => {
			isMounted = false;
		};
	}, []);

	const filteredUsers = useMemo(() => {
		const query = searchQuery.trim().toLowerCase();
		if (!query) {
			return users;
		}

		return users.filter((user) => {
			const haystack = [user.name, user.email, user.role, user.id].join(" ").toLowerCase();
			return haystack.includes(query);
		});
	}, [searchQuery, users]);

	return (
		<View className="flex-1 bg-surface-soft">
			<View className="px-4 pb-4 pt-14 bg-canvas border-b border-hairline flex-row items-center gap-3">
				<TouchableOpacity
					onPress={() => router.back()}
					className="h-10 w-10 items-center justify-center rounded-full bg-surface-soft"
					activeOpacity={0.8}
				>
					<ArrowLeft size={20} color="#1a1a1a" />
				</TouchableOpacity>
				<View className="flex-1">
					<Text className="text-2xl text-ink" fontName="PlusJakartaSans_700Bold">
						Inspect Users
					</Text>
					<Text className="text-muted" fontName="PlusJakartaSans_400Regular">
						Review account details and role assignments.
					</Text>
				</View>
			</View>

			<View className="px-4 pt-4">
				<View className="flex-row items-center px-4 py-3 bg-canvas border border-hairline rounded-full shadow-sm">
					<UserRound size={18} color="#929292" />
					<TextInput
						className="flex-1 ml-3 text-ink"
						placeholder="Search users, emails, or roles"
						placeholderTextColor="#929292"
						value={searchQuery}
						onChangeText={setSearchQuery}
					/>
				</View>
			</View>

			{isLoading ? (
				<View className="flex-1 items-center justify-center">
					<LoadingSpinner size="large" />
				</View>
			) : (
				<ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
					{filteredUsers.length === 0 ? (
						<View className="items-center justify-center px-8 py-16">
							<View className="mb-4 h-14 w-14 items-center justify-center rounded-full bg-primary/10">
								<Shield size={24} color="#ff385c" />
							</View>
							<Text
								className="mb-2 text-center text-ink text-lg"
								fontName="PlusJakartaSans_700Bold"
							>
								No matching users
							</Text>
							<Text className="text-center text-muted" fontName="PlusJakartaSans_400Regular">
								Try a different name, email, or role filter.
							</Text>
						</View>
					) : null}

					{filteredUsers.map((user) => (
						<Card key={user.id} className="mb-4">
							<View className="flex-row items-start gap-5">
								<View className="h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10">
									{user.avatar_url ? (
										<Image source={{ uri: user.avatar_url }} className="h-full w-full" />
									) : (
										<UserRound size={24} color="#ff385c" />
									)}
								</View>
								<View className="flex-1 pt-1">
									<View className="flex-row items-center justify-between gap-3">
										<View className="flex-1">
											<Text className="text-ink" fontName="PlusJakartaSans_700Bold">
												{user.name}
											</Text>
											<Text className="text-sm text-muted" fontName="PlusJakartaSans_400Regular">
												{user.email}
											</Text>
										</View>
										<View className="rounded-full bg-surface-soft px-3 py-1">
											<Text className="text-sm text-ink" fontName="PlusJakartaSans_600SemiBold">
												{user.role}
											</Text>
										</View>
									</View>

									<Text className="mt-3 text-sm text-muted" fontName="PlusJakartaSans_400Regular">
										User ID: {user.id}
									</Text>
									<Text className="text-sm text-muted" fontName="PlusJakartaSans_400Regular">
										Provider IDs:{" "}
										{user.google_id || user.facebook_id
											? [user.google_id, user.facebook_id].filter(Boolean).join(" • ")
											: "None linked"}
									</Text>
									<Text className="text-sm text-muted" fontName="PlusJakartaSans_400Regular">
										Joined:{" "}
										{user.created_at ? new Date(user.created_at).toLocaleDateString() : "Unknown"}
									</Text>
								</View>
							</View>
						</Card>
					))}
				</ScrollView>
			)}
		</View>
	);
}
