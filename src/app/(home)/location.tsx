import { SafeAreaView, View, Text } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { MapViewModal } from "@/components/LocationMap/MapViewModal";
import { useMapLocation } from "@/hooks/useMapLocation";
import { useState } from "react";

export default function LocationScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const { location, loading, error } = useMapLocation(id);
	const [mapVisible, setMapVisible] = useState(true);

	const handleCloseMap = () => {
		setMapVisible(false);
		router.back();
	};

	if (error && !loading) {
		return (
			<SafeAreaView style={{ flex: 1, backgroundColor: "#f7f7f7" }}>
				<View
					style={{
						flex: 1,
						justifyContent: "center",
						alignItems: "center",
						padding: 24,
					}}
				>
					<Text
						style={{
							fontSize: 18,
							fontWeight: "600",
							color: "#dc2626",
							textAlign: "center",
							marginBottom: 16,
						}}
					>
						Error Loading Location
					</Text>
					<Text
						style={{
							fontSize: 14,
							color: "#666666",
							textAlign: "center",
							marginBottom: 24,
						}}
					>
						{error}
					</Text>
				</View>
			</SafeAreaView>
		);
	}

	if (location) {
		return (
			<MapViewModal
				visible={mapVisible}
				onClose={handleCloseMap}
				location={location}
			/>
		);
	}

	return null;
}
