import { Text } from "@components/Text";
import { controllers } from "@lib/api/supabase/controller";
import type { Location as LocationRecord } from "@lib/types/supabase";
import { useRouter } from "expo-router";
import { Building2, MapPin, Plus } from "lucide-react-native";
import { useEffect, useState } from "react";
import { FlatList, TouchableOpacity, View } from "react-native";
import { Card, LoadingSpinner } from "@/components/index";

export default function AdminLocationsScreen() {
	const router = useRouter();
	const [locations, setLocations] = useState<LocationRecord[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		let isMounted = true;

		const loadLocations = async () => {
			setIsLoading(true);
			try {
				const data = await controllers.location.list({ orderBy: "created_at" });
				if (isMounted) {
					setLocations(data);
				}
			} catch (error) {
				console.error("[Admin Locations] Failed to load locations:", error);
			} finally {
				if (isMounted) {
					setIsLoading(false);
				}
			}
		};

		loadLocations();

		return () => {
			isMounted = false;
		};
	}, []);

	return (
		<View className="flex-1 bg-surface-soft">
			<View className="px-4 pb-4 pt-14 bg-canvas border-b border-hairline flex-row items-center justify-between">
				<View>
					<Text className="text-2xl text-ink" fontName="PlusJakartaSans_700Bold">
						Locations
					</Text>
					<Text className="text-muted" fontName="PlusJakartaSans_400Regular">
						Manage existing locations or add new ones.
					</Text>
				</View>
				<TouchableOpacity
					className="h-12 w-12 items-center justify-center rounded-full bg-primary"
					onPress={() => router.push("/(admin)/location/create")}
					activeOpacity={0.8}
				>
					<Plus size={24} color="#ffffff" />
				</TouchableOpacity>
			</View>

			{isLoading ? (
				<View className="flex-1 items-center justify-center">
					<LoadingSpinner size="large" />
				</View>
			) : (
				<FlatList
					data={locations}
					keyExtractor={(item) => item.id}
					contentContainerStyle={{ padding: 16 }}
					showsVerticalScrollIndicator={false}
					renderItem={({ item }) => (
						<Card className="mb-4">
							<View className="flex-row items-start justify-between">
								<View className="flex-1 pr-4">
									<Text className="mb-1 text-lg text-ink" fontName="PlusJakartaSans_700Bold">
										{item.name}
									</Text>
									<View className="flex-row items-center mb-1">
										<MapPin size={14} color="#929292" />
										<Text className="ml-1 text-muted text-sm" fontName="PlusJakartaSans_400Regular">
											{item.street}, {item.town}
										</Text>
									</View>
								</View>
								<View className="h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
									<Building2 size={18} color="#ff385c" />
								</View>
							</View>
						</Card>
					)}
					ListEmptyComponent={
						<View className="items-center justify-center py-10">
							<Text className="text-lg text-ink" fontName="PlusJakartaSans_600SemiBold">
								No locations yet
							</Text>
							<Text className="text-center text-muted mt-1" fontName="PlusJakartaSans_400Regular">
								Tap the + button to create your first location.
							</Text>
						</View>
					}
				/>
			)}
		</View>
	);
}
