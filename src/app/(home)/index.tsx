import { useAuth, useUser } from "@clerk/expo";
import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { Text } from "@/components/index";

export default function HomePage() {
	const { signOut } = useAuth();
	const { user } = useUser();
	const router = useRouter();

	const handleLogout = async () => {
		await signOut();
		router.replace("/(landing)");
	};

	return (
		<View className="flex-1 items-center justify-center px-6 bg-white">
			<View className="items-center space-y-4 max-w-100 w-full">
				<Text className="text-4xl text-gray-900 tracking-tight" fontName="PlusJakartaSans_700Bold">
					Under Construction
				</Text>
				<Text className="mb-8 text-base text-gray-600" fontName="PlusJakartaSans_400Regular">
					Hi, {user?.firstName || user?.emailAddresses[0]?.emailAddress || "User"}! What the fuck
					are you doing here?
				</Text>
				<Pressable
					onPress={handleLogout}
					className="flex-row items-center justify-center mb-2 space-x-2 h-11 w-full bg-primary hover:bg-primary-active rounded-lg shadow-sm active:scale-98"
				>
					<Text className="text-base text-white" fontName="PlusJakartaSans_600SemiBold">
						Logout
					</Text>
				</Pressable>
			</View>
		</View>
	);
}
