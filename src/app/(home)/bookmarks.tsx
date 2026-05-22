import { View } from "react-native";
import { Bookmark } from "lucide-react-native";
import { Text } from "@/components/index";

export default function BookmarksScreen() {
	return (
		<View className="flex-1 bg-surface-soft items-center justify-center px-8">
			<View className="w-20 h-20 bg-primary/10 rounded-full items-center justify-center mb-6">
				<Bookmark size={40} color="#ff385c" />
			</View>
			<Text className="text-2xl text-ink mb-2" fontName="PlusJakartaSans_700Bold">
				My Bookmarks
			</Text>
			<Text className="text-body text-center mb-8" fontName="PlusJakartaSans_400Regular">
				Save your favorite Aklan locations to visit later.
			</Text>
			<View className="bg-primary px-8 py-3 rounded-lg">
				<Text className="text-on-primary font-semibold" fontName="PlusJakartaSans_600SemiBold">
					Explore Locations
				</Text>
			</View>
		</View>
	);
}