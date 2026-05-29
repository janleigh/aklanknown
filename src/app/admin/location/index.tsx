import { controllers } from "@lib/api/supabase/controller";
import { supabase } from "@lib/api/supabase/supabase";
import type { Location as LocationRecord } from "@lib/types/supabase";
import { useRouter } from "expo-router";
import { ArrowLeft, MapPin, Pencil, Plus, Trash2 } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Alert, FlatList, TouchableOpacity, View } from "react-native";
import { LoadingSpinner } from "@/components/index";
import { Text } from "@/components/ui/Text";

export default function AdminLocationsScreen() {
	const router = useRouter();
	const [locations, setLocations] = useState<LocationRecord[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isDeletingLocationId, setIsDeletingLocationId] = useState<string | null>(null);

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

	const deleteLocationCascade = async (locationId: string) => {
		setIsDeletingLocationId(locationId);

		try {
			await Promise.all([
				supabase.from("bookmarks").delete().eq("location_id", locationId),
				supabase.from("cached_routes").delete().eq("location_id", locationId),
				supabase.from("location_images").delete().eq("location_id", locationId),
				supabase.from("reviews").delete().eq("location_id", locationId),
			]);

			await controllers.location.remove(locationId);
			setLocations((prev) => prev.filter((location) => location.id !== locationId));
		} catch (error) {
			console.error("[Admin Locations] Failed to delete location:", error);
			Alert.alert("Delete Failed", "We couldn't delete that location right now.");
		} finally {
			setIsDeletingLocationId((current) => (current === locationId ? null : current));
		}
	};

	return (
		<View className="flex-1 bg-surface-soft">
			<View className="flex-row items-center justify-between pb-4 pt-14 px-4 bg-canvas border-b border-hairline">
				<TouchableOpacity
					onPress={() => router.back()}
					className="items-center justify-center h-10 w-10 bg-surface-soft rounded-full"
					activeOpacity={0.8}
				>
					<ArrowLeft size={20} color="#1a1a1a" />
				</TouchableOpacity>
				<View>
					<Text className="text-2xl text-ink" fontName="PlusJakartaSans_700Bold">
						Locations
					</Text>
					<Text className="text-muted" fontName="PlusJakartaSans_400Regular">
						Manage existing locations or add new ones.
					</Text>
				</View>
				<TouchableOpacity
					className="items-center justify-center h-12 w-12 bg-primary rounded-full"
					onPress={() => router.push("/admin/location/create")}
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
						<View className="mb-4 bg-canvas rounded-[28px] shadow-sm p-5">
							<View className="flex-row items-start justify-between">
								<View className="flex-1 pr-4">
									<Text className="mb-1 text-ink text-lg" fontName="PlusJakartaSans_700Bold">
										{item.name}
									</Text>
									<View className="flex-row items-center mb-1">
										<MapPin size={14} color="#929292" />
										<Text className="ml-1 text-muted text-sm" fontName="PlusJakartaSans_400Regular">
											{item.street}, {item.town}
										</Text>
									</View>
								</View>
								<View className="gap-2 items-end">
									<TouchableOpacity
										className="items-center justify-center h-10 w-10 bg-primary/10 rounded-xl"
										onPress={() =>
											router.push({
												pathname: "/location/edit/[id]",
												params: { id: item.id },
											})
										}
										activeOpacity={0.75}
									>
										<Pencil size={16} color="#ff385c" />
									</TouchableOpacity>
									<TouchableOpacity
										className="items-center justify-center h-10 w-10 bg-error/10 rounded-xl"
										onPress={() => {
											Alert.alert(
												"Delete location?",
												`This will permanently remove ${item.name} and its related reviews, bookmarks, cached routes, and images.`,
												[
													{ text: "Cancel", style: "cancel" },
													{
														text: "Delete",
														style: "destructive",
														onPress: () => {
															void deleteLocationCascade(item.id);
														},
													},
												],
											);
										}}
										disabled={isDeletingLocationId === item.id}
										activeOpacity={0.75}
									>
										<Trash2 size={16} color="#ef4444" />
									</TouchableOpacity>
								</View>
							</View>
						</View>
					)}
					ListEmptyComponent={
						<View className="items-center justify-center py-10">
							<Text className="text-ink text-lg" fontName="PlusJakartaSans_600SemiBold">
								No locations yet
							</Text>
							<Text className="mt-1 text-center text-muted" fontName="PlusJakartaSans_400Regular">
								Tap the + button to create your first location.
							</Text>
						</View>
					}
				/>
			)}
		</View>
	);
}
