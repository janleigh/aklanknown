import { useAuth, useUser } from "@clerk/expo";
import { Text } from "@components/index";
import { userController } from "@lib/api/supabase/controller";
import { useRouter } from "expo-router";
import { Bell, LogOut, Settings, Shield, User } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, View } from "react-native";

export default function ProfileScreen() {
	const { signOut } = useAuth();
	const { user } = useUser();
	const router = useRouter();
	const [isAdmin, setIsAdmin] = useState(false);

	const goToNotFound = () => {
		router.push("/+not-found");
	};

	useEffect(() => {
		if (!user) return;

		let isMounted = true;

		const loadRole = async () => {
			try {
				const profile = await userController.getById(user.id);
				if (isMounted) {
					setIsAdmin(profile.role === "admin");
				}
			} catch (error) {
				console.error("[Profile] Failed to load user role:", error);
				if (isMounted) {
					setIsAdmin(false);
				}
			}
		};

		loadRole();

		return () => {
			isMounted = false;
		};
	}, [user]);

	const handleLogout = async () => {
		await signOut();
		router.replace("/(landing)");
	};

	const menuItems = [
		...(isAdmin
			? [{ icon: Shield, label: "Admin Panel", action: () => router.push("/(admin)") }]
			: []),
		{ icon: User, label: "Edit Profile", action: goToNotFound },
		{ icon: Settings, label: "App Settings", action: goToNotFound }
	];

	return (
		<ScrollView className="flex-1 bg-surface-soft">
			{/* Header */}
			<View className="items-center pb-8 pt-16 px-4 bg-primary">
				<View className="overflow-hidden items-center justify-center mb-4 h-24 w-24 bg-on-primary/30 rounded-full">
					{user?.imageUrl ? (
						<Image source={{ uri: user.imageUrl }} className="h-24 w-24" />
					) : (
						<Text className="font-bold text-3xl text-on-primary" fontName="PlusJakartaSans_700Bold">
							{user?.firstName?.[0]?.toUpperCase() || "G"}
						</Text>
					)}
				</View>
				<Text className="mb-1 font-bold text-on-primary text-xl" fontName="PlusJakartaSans_700Bold">
					{user?.firstName || user?.emailAddresses[0]?.emailAddress || "Guest"}
				</Text>
			</View>

			{/* Stats */}
			{/* <View className="flex-row justify-around mx-4 p-4 bg-canvas border border-hairline rounded-xl shadow-sm -mt-6">
				<View className="items-center">
					<Text className="font-bold text-2xl text-primary" fontName="PlusJakartaSans_700Bold">
						TBD
					</Text>
					<Text className="text-muted text-sm" fontName="PlusJakartaSans_400Regular">
						Saved
					</Text>
				</View>
				<View className="items-center">
					<Text className="font-bold text-2xl text-primary" fontName="PlusJakartaSans_700Bold">
						TBD
					</Text>
					<Text className="text-muted text-sm" fontName="PlusJakartaSans_400Regular">
						Reviews
					</Text>
				</View>
				<View className="items-center">
					<Text className="font-bold text-2xl text-primary" fontName="PlusJakartaSans_700Bold">
						TBD
					</Text>
					<Text className="text-muted text-sm" fontName="PlusJakartaSans_400Regular">
						Visited
					</Text>
				</View>
			</View> */}

			{/* Menu Items */}
			<View className="mt-6 px-4">
				{menuItems.map((item, i) => {
					const Icon = item.icon;
					return (
						<Pressable
							key={i}
							className="flex-row items-center mb-3 p-4 bg-canvas border border-hairline rounded-xl shadow-sm"
							onPress={() => {
								item.action?.();
							}}
						>
							<View className="items-center justify-center mr-4 h-10 w-10 bg-primary/10 rounded-full">
								<Icon size={20} color="#ff385c" />
							</View>
							<Text
								className="flex-1 font-semibold text-ink"
								fontName="PlusJakartaSans_600SemiBold"
							>
								{item.label}
							</Text>
						</Pressable>
					);
				})}
			</View>

			{/* Logout */}
			<Pressable
				className="flex-row items-center justify-center mx-4 my-8 py-4 bg-error/10 rounded-xl"
				onPress={handleLogout}
			>
				<LogOut size={20} color="#ef4444" />
				<Text className="ml-2 font-semibold text-error" fontName="PlusJakartaSans_600SemiBold">
					Log Out
				</Text>
			</Pressable>
		</ScrollView>
	);
}
