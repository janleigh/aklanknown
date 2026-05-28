import { useAuth, useUser } from "@clerk/expo";
import { Text } from "@components/index";
import { userController } from "@lib/api/supabase/controller";
import { useRouter } from "expo-router";
import { Bell, LogOut, Settings, Shield, User, ChevronRight } from "lucide-react-native";
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
		{ icon: Settings, label: "App Settings", action: goToNotFound },
	];

	return (
		<ScrollView className="flex-1 bg-surface-soft">
			<View className="bg-primary rounded-b-[40px] shadow-sm pb-8 pt-16 px-6 items-center">
				<View className="relative mb-2">
					<View className="overflow-hidden items-center justify-center h-28 w-28 bg-surface-soft rounded-full border-4 border-canvas">
						{user?.imageUrl ? (
							<Image source={{ uri: user.imageUrl }} className="h-full w-full" />
						) : (
							<Text className="font-bold text-4xl text-primary" fontName="PlusJakartaSans_700Bold">
								{user?.firstName?.[0]?.toUpperCase() || "G"}
							</Text>
						)}
					</View>
					{isAdmin && (
						<View className="absolute bottom-0 right-0 bg-primary h-8 w-8 rounded-full items-center justify-center border-2 border-canvas">
							<Shield size={14} color="#ffffff" />
						</View>
					)}
				</View>

				<Text className="mt-2 font-bold text-canvas text-2xl" fontName="PlusJakartaSans_700Bold">
					{user?.firstName || user?.emailAddresses[0]?.emailAddress || "Guest"}
				</Text>
				<Text className="text-canvas mt-1 mb-5" fontName="PlusJakartaSans_400Regular">
					{user?.emailAddresses[0]?.emailAddress}
				</Text>

				<Pressable className="bg-canvas/20 px-6 py-2.5 rounded-full" onPress={goToNotFound}>
					<Text className="text- font-semibold" fontName="PlusJakartaSans_600SemiBold">
						Edit Profile
					</Text>
				</Pressable>
			</View>

			{/* <View className="flex-row mx-4 mt-6 bg-canvas rounded-2xl shadow-sm p-5 justify-between">
				<View className="items-center flex-1 border-r border-hairline">
					<Text className="font-bold text-xl text-ink" fontName="PlusJakartaSans_700Bold">12</Text>
					<Text className="text-muted text-xs mt-1" fontName="PlusJakartaSans_600SemiBold">Saved</Text>
				</View>
				<View className="items-center flex-1 border-r border-hairline">
					<Text className="font-bold text-xl text-ink" fontName="PlusJakartaSans_700Bold">5</Text>
					<Text className="text-muted text-xs mt-1" fontName="PlusJakartaSans_600SemiBold">Reviews</Text>
				</View>
				<View className="items-center flex-1">
					<Text className="font-bold text-xl text-ink" fontName="PlusJakartaSans_700Bold">8</Text>
					<Text className="text-muted text-xs mt-1" fontName="PlusJakartaSans_600SemiBold">Visited</Text>
				</View>
			</View> */}

			<View className="mt-8 px-4">
				<Text
					className="text-muted font-bold text-xs uppercase tracking-wider mb-3 ml-2"
					fontName="PlusJakartaSans_700Bold"
				>
					Preferences
				</Text>
				<View className="bg-canvas rounded-2xl overflow-hidden shadow-sm">
					{menuItems.map((item, i) => {
						const Icon = item.icon;
						const isLast = i === menuItems.length - 1;
						return (
							<Pressable
								key={i}
								className={`flex-row items-center p-4 bg-canvas ${!isLast ? "border-b border-hairline" : ""}`}
								onPress={() => item.action?.()}
							>
								<View className="items-center justify-center mr-4 h-10 w-10 bg-surface-soft rounded-full">
									<Icon size={20} color="#222222" />
								</View>
								<Text
									className="flex-1 font-semibold text-ink text-base"
									fontName="PlusJakartaSans_600SemiBold"
								>
									{item.label}
								</Text>
								<ChevronRight size={20} color="#999999" />
							</Pressable>
						);
					})}
				</View>
			</View>

			<View className="px-4 mt-6 mb-12">
				<Pressable
					className="flex-row items-center justify-center py-4 bg-canvas rounded-2xl shadow-sm"
					onPress={handleLogout}
				>
					<LogOut size={20} color="#ff385c" />
					<Text
						className="ml-2 font-semibold text-primary text-base"
						fontName="PlusJakartaSans_600SemiBold"
					>
						Log Out
					</Text>
				</Pressable>
			</View>
		</ScrollView>
	);
}
