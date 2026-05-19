import { SafeAreaView, View, TouchableOpacity, Text } from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";

export default function HomeScreen() {
	const handleNavigateToMap = () => {
		// Navigate to location route with a test location ID
		router.push({
			pathname: "/(home)/location",
			params: { id: "test-location" },
		});
	};

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: "#f7f7f7" }}>
			<View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
				<View style={{ marginBottom: 32 }}>
					<Feather name="map" size={64} color="#0ff6be" />
				</View>

				<Text
					style={{
						fontSize: 28,
						fontWeight: "700",
						color: "#161719",
						marginBottom: 12,
						textAlign: "center",
					}}
				>
					Aklan Unknown
				</Text>

				<Text
					style={{
						fontSize: 16,
						color: "#666666",
						marginBottom: 32,
						textAlign: "center",
						lineHeight: 24,
					}}
				>
					Discover locations and view them on the interactive map with real-time directions.
				</Text>

				<TouchableOpacity
					onPress={handleNavigateToMap}
					style={{
						backgroundColor: "#0ff6be",
						paddingVertical: 12,
						paddingHorizontal: 24,
						borderRadius: 8,
						alignItems: "center",
					}}
				>
					<Text
						style={{
							fontSize: 16,
							fontWeight: "700",
							color: "#161719",
							letterSpacing: -0.05,
						}}
					>
						View Map
					</Text>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
}
