import { View } from "react-native";
import { Bookmark } from "lucide-react-native";
import { Text } from "@/components/index";

export default function BookmarksScreen() {
	return (
		<View className="flex-1 items-center justify-center px-8 bg-surface-soft">
			<View className="items-center justify-center mb-6 h-20 w-20 bg-primary/10 rounded-full">
				<Bookmark size={40} color="#ff385c" />
			</View>
			<Text className="mb-2 text-2xl text-ink" fontName="PlusJakartaSans_700Bold">
				My Bookmarks
			</Text>
			<Text className="mb-8 text-body text-center" fontName="PlusJakartaSans_400Regular">
				Save your favorite Aklan locations to visit later.
			</Text>
			<View className="px-8 py-3 bg-primary rounded-lg">
				<Text className="font-semibold text-on-primary" fontName="PlusJakartaSans_600SemiBold">
					Explore Locations
				</Text>
			</View>
		</View>
	);
}