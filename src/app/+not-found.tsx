import { Text } from "@components/index";
import { useRouter } from "expo-router";
import { AlertCircle } from "lucide-react-native";
import { Pressable, ScrollView, View } from "react-native";

export default function NotFoundScreen() {
	const router = useRouter();

	return (
		<ScrollView className="flex-1 px-4 bg-surface-soft">
			<View className="flex-1 items-center justify-center px-4 py-12">
				<View className="items-center justify-center mb-6 h-20 w-20 bg-error/10 rounded-full">
					<AlertCircle size={40} color="#ef4444" />
				</View>

				<Text
					className="mb-2 font-bold text-3xl text-center text-ink"
					fontName="PlusJakartaSans_700Bold"
				>
					Page Not Found
				</Text>

				<Text className="mb-8 text-center text-muted" fontName="PlusJakartaSans_400Regular">
					The page you're looking for doesn't exist or is coming soon.
				</Text>

				<Pressable
					className="items-center justify-center mb-4 px-6 py-4 w-full bg-primary rounded-xl"
					onPress={() => router.back()}
				>
					<Text className="font-semibold text-on-primary" fontName="PlusJakartaSans_600SemiBold">
						Go Back
					</Text>
				</Pressable>
			</View>
		</ScrollView>
	);
}
