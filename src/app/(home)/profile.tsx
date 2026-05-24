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
			<View className="items-center pb-8 pt-16 px-4 bg-primary">
				<View className="items-center justify-center mb-4 h-24 w-24 bg-on-primary/30 rounded-full">
					<Text className="font-bold text-3xl text-on-primary" fontName="PlusJakartaSans_700Bold">
						{user?.firstName?.[0]?.toUpperCase() || "G"}
					</Text>
				</View>
				<Text className="mb-1 font-bold text-on-primary text-xl" fontName="PlusJakartaSans_700Bold">
					{user?.firstName || user?.emailAddresses[0]?.emailAddress || "Guest"}
				</Text>
				<Text className="text-on-primary/80" fontName="PlusJakartaSans_400Regular">
					Aklan Explorer
				</Text>
			</View>

			{/* Stats */}
			<View className="flex-row justify-around mx-4 p-4 bg-canvas border border-hairline rounded-xl shadow-sm -mt-6">
				<View className="items-center">
					<Text className="font-bold text-2xl text-primary" fontName="PlusJakartaSans_700Bold">12</Text>
					<Text className="text-muted text-sm" fontName="PlusJakartaSans_400Regular">Saved</Text>
				</View>
				<View className="items-center">
					<Text className="font-bold text-2xl text-primary" fontName="PlusJakartaSans_700Bold">5</Text>
					<Text className="text-muted text-sm" fontName="PlusJakartaSans_400Regular">Reviews</Text>
				</View>
				<View className="items-center">
					<Text className="font-bold text-2xl text-primary" fontName="PlusJakartaSans_700Bold">28</Text>
					<Text className="text-muted text-sm" fontName="PlusJakartaSans_400Regular">Visited</Text>
				</View>
			</View>

			{/* Menu Items */}
			<View className="mt-6 px-4">
				{menuItems.map((item, i) => {
					const Icon = item.icon;
					return (
						<Pressable
							key={i}
							className="flex-row items-center mb-3 p-4 bg-canvas border border-hairline rounded-xl shadow-sm"
							onPress={() => {
								if (item.route) {
									router.push(`/(home)/${item.route}` as any);
								} else {
									item.action?.();
								}
							}}
						>
							<View className="items-center justify-center mr-4 h-10 w-10 bg-primary/10 rounded-full">
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