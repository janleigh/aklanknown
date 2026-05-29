import { controllers } from "@lib/api/supabase/controller";
import type { UserProfile } from "@lib/types/supabase";
import { useRouter } from "expo-router";
import { ArrowLeft, ChevronDown, ChevronUp, Shield, UserRound } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { Alert, Image, ScrollView, TextInput, TouchableOpacity, View } from "react-native";
import { LoadingSpinner } from "@/components/index";
import { Text } from "@/components/ui/Text";

export default function AdminUsersScreen() {
	const router = useRouter();
	const [users, setUsers] = useState<UserProfile[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
	const [isUpdating, setIsUpdating] = useState(false);

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

	const toggleExpand = (id: string) => {
		setExpandedUserId((prev) => (prev === id ? null : id));
	};

	const handleUpdateRole = async (userId: string, currentRole: string) => {
		const newRole = currentRole === "admin" ? "user" : "admin";

		Alert.alert("Confirm Role Change", `Are you sure you want to change this user to ${newRole}?`, [
			{ text: "Cancel", style: "cancel" },
			{
				text: "Confirm",
				onPress: async () => {
					setIsUpdating(true);
					try {
						await controllers.user.update(userId, { role: newRole as "admin" | "user" });
						setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
					} catch (error) {
						console.error("[Admin Users] Failed to update role:", error);
						Alert.alert("Error", "Failed to update user role.");
					} finally {
						setIsUpdating(false);
					}
				},
			},
		]);
	};

	return (
		<View className="flex-1 bg-surface-soft">
			<View className="flex-row gap-3 items-center pb-4 pt-14 px-4 bg-canvas border-b border-hairline shadow-sm z-10">
				<TouchableOpacity
					onPress={() => router.back()}
					className="items-center justify-center h-10 w-10 bg-surface-soft rounded-full"
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

			<View className="pt-4 px-4">
				<View className="flex-row items-center px-4 py-4 bg-canvas border border-hairline rounded-2xl shadow-sm">
					<UserRound size={20} color="#929292" />
					<TextInput
						className="flex-1 ml-3 text-ink text-base"
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
				<ScrollView
					className="flex-1"
					contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
					showsVerticalScrollIndicator={false}
				>
					{filteredUsers.length === 0 ? (
						<View className="items-center justify-center px-8 py-16 bg-canvas rounded-3xl shadow-sm border border-hairline/50">
							<View className="items-center justify-center mb-4 h-16 w-16 bg-primary/10 rounded-full">
								<Shield size={28} color="#ff385c" />
							</View>
							<Text
								className="mb-2 text-center text-ink text-xl"
								fontName="PlusJakartaSans_700Bold"
							>
								No matching users
							</Text>
							<Text className="text-center text-muted" fontName="PlusJakartaSans_400Regular">
								Try a different name, email, or role filter.
							</Text>
						</View>
					) : null}

					{filteredUsers.map((user) => {
						const isExpanded = expandedUserId === user.id;

						return (
							<TouchableOpacity
								key={user.id}
								activeOpacity={0.9}
								onPress={() => toggleExpand(user.id)}
								className="mb-4 bg-canvas rounded-3xl shadow-sm border border-hairline/50 overflow-hidden"
							>
								<View className="p-5 flex-row gap-4 items-center">
									<View className="overflow-hidden items-center justify-center shrink-0 h-14 w-14 bg-primary/10 rounded-full border border-hairline/50">
										{user.avatar_url ? (
											<Image source={{ uri: user.avatar_url }} className="h-full w-full" />
										) : (
											<UserRound size={24} color="#ff385c" />
										)}
									</View>
									<View className="flex-1">
										<Text
											className="text-ink text-lg"
											fontName="PlusJakartaSans_700Bold"
											numberOfLines={1}
										>
											{user.name}
										</Text>
										<Text
											className="text-muted"
											fontName="PlusJakartaSans_400Regular"
											numberOfLines={1}
										>
											{user.email}
										</Text>
									</View>
									<View className="items-end gap-2">
										<View
											className={`px-3 py-1 rounded-full ${user.role === "admin" ? "bg-primary/10" : "bg-surface-soft"}`}
										>
											<Text
												className={`text-sm ${user.role === "admin" ? "text-primary" : "text-ink"}`}
												fontName="PlusJakartaSans_600SemiBold"
											>
												{String(user.role).toUpperCase()}
											</Text>
										</View>
										{isExpanded ? (
											<ChevronUp size={20} color="#929292" />
										) : (
											<ChevronDown size={20} color="#929292" />
										)}
									</View>
								</View>

								{isExpanded && (
									<View className="px-5 pb-5 pt-2 border-t border-hairline/50 bg-surface-soft/30">
										<View className="mb-4 gap-2">
											<View className="flex-row justify-between">
												<Text className="text-muted" fontName="PlusJakartaSans_500Medium">
													User ID
												</Text>
												<Text
													className="text-ink text-right flex-1 ml-4"
													fontName="PlusJakartaSans_400Regular"
													numberOfLines={1}
													ellipsizeMode="middle"
												>
													{user.id}
												</Text>
											</View>
											<View className="flex-row justify-between">
												<Text className="text-muted" fontName="PlusJakartaSans_500Medium">
													Joined
												</Text>
												<Text className="text-ink" fontName="PlusJakartaSans_400Regular">
													{user.created_at
														? new Date(user.created_at).toLocaleDateString(undefined, {
																year: "numeric",
																month: "long",
																day: "numeric",
															})
														: "Unknown"}
												</Text>
											</View>
											<View className="flex-row justify-between">
												<Text className="text-muted" fontName="PlusJakartaSans_500Medium">
													Provider IDs
												</Text>
												<Text
													className="text-ink text-right flex-1 ml-4"
													fontName="PlusJakartaSans_400Regular"
												>
													{user.google_id || user.facebook_id
														? [user.google_id, user.facebook_id].filter(Boolean).join("\n")
														: "None linked"}
												</Text>
											</View>
										</View>

										<TouchableOpacity
											className={`py-3 rounded-xl items-center shadow-sm ${user.role === "admin" ? "bg-ink" : "bg-primary"} ${isUpdating ? "opacity-70" : ""}`}
											onPress={() => handleUpdateRole(user.id, user.role)}
											disabled={isUpdating}
										>
											<Text className="text-white text-base" fontName="PlusJakartaSans_700Bold">
												{user.role === "admin" ? "Demote to User" : "Promote to Admin"}
											</Text>
										</TouchableOpacity>
									</View>
								)}
							</TouchableOpacity>
						);
					})}
				</ScrollView>
			)}
		</View>
	);
}
