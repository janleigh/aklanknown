import { useAuth, useUser } from "@clerk/expo";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";
import { Settings, Bell, LogOut, User, Shield } from "lucide-react-native";
import { Text } from "@/components/index";

export default function ProfileScreen() {
	const { signOut } = useAuth();
	const { user } = useUser();
	const router = useRouter();

	const handleLogout = async () => {
		await signOut();
		router.replace("/(landing)");
	};

	const menuItems = [
		{ icon: User, label: "Edit Profile", action: () => {} },
		{ icon: Settings, label: "App Settings", route: "settings" as const },
		{ icon: Bell, label: "Notifications", action: () => {} },
		{ icon: Shield, label: "Privacy & Security", action: () => {} },
	];

	return (
		<ScrollView className="flex-1 bg-surface-soft">
			{/* Header */}
			<View className="bg-primary pt-16 pb-8 px-4 items-center">
				<View className="w-24 h-24 bg-on-primary/30 rounded-full items-center justify-center mb-4">
					<Text className="text-3xl font-bold text-on-primary" fontName="PlusJakartaSans_700Bold">
						{user?.firstName?.[0]?.toUpperCase() || "G"}
					</Text>
				</View>
				<Text className="text-xl font-bold text-on-primary mb-1" fontName="PlusJakartaSans_700Bold">
					{user?.firstName || user?.emailAddresses[0]?.emailAddress || "Guest"}
				</Text>
				<Text className="text-on-primary/80" fontName="PlusJakartaSans_400Regular">
					Aklan Explorer
				</Text>
			</View>

			{/* Stats */}
			<View className="flex-row justify-around bg-canvas mx-4 -mt-6 p-4 rounded-xl shadow-sm border border-hairline">
				<View className="items-center">
					<Text className="text-2xl font-bold text-primary" fontName="PlusJakartaSans_700Bold">12</Text>
					<Text className="text-muted text-sm" fontName="PlusJakartaSans_400Regular">Saved</Text>
				</View>
				<View className="items-center">
					<Text className="text-2xl font-bold text-primary" fontName="PlusJakartaSans_700Bold">5</Text>
					<Text className="text-muted text-sm" fontName="PlusJakartaSans_400Regular">Reviews</Text>
				</View>
				<View className="items-center">
					<Text className="text-2xl font-bold text-primary" fontName="PlusJakartaSans_700Bold">28</Text>
					<Text className="text-muted text-sm" fontName="PlusJakartaSans_400Regular">Visited</Text>
				</View>
			</View>

			{/* Menu Items */}
			<View className="px-4 mt-6">
				{menuItems.map((item, i) => {
					const Icon = item.icon;
					return (
						<Pressable
							key={i}
							className="flex-row items-center bg-canvas p-4 rounded-xl mb-3 shadow-sm border border-hairline"
							onPress={() => {
								if (item.route) {
									router.push(`/(home)/${item.route}` as any);
								} else {
									item.action?.();
								}
							}}
						>
							<View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center mr-4">
								<Icon size={20} color="#ff385c" />
							</View>
							<Text className="flex-1 font-semibold text-ink" fontName="PlusJakartaSans_600SemiBold">
								{item.label}
							</Text>
						</Pressable>
					);
				})}
			</View>

			{/* Logout */}
			<Pressable
				className="flex-row items-center justify-center bg-error/10 mx-4 my-8 py-4 rounded-xl"
				onPress={handleLogout}
			>
				<LogOut size={20} color="#ef4444" />
				<Text className="text-error font-semibold ml-2" fontName="PlusJakartaSans_600SemiBold">
					Log Out
				</Text>
			</Pressable>
		</ScrollView>
	);
}