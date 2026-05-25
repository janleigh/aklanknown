import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useState } from "react";
import { ScrollView, TouchableOpacity, View, Alert } from "react-native";
import { Button, Card, Input } from "@/components/index";
import { Text } from "@/components/Text";
import { controllers } from "@/shared/api/supabase/controller";

export default function CreateLocationScreen() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	const [form, setForm] = useState({
		name: "",
		street: "",
		barangay: "",
		town: "",
		description_en: "",
		banner_image_url: "",
		latitude: "",
		longitude: "",
	});

	const handleCreate = async () => {
		if (!form.name || !form.street || !form.town || !form.barangay) {
			Alert.alert("Missing Fields", "Please make sure to fill the required fields.");
			return;
		}

		setIsLoading(true);
		try {
			await controllers.location.create({
				name: form.name,
				street: form.street,
				barangay: form.barangay,
				town: form.town,
				description_en: form.description_en,
				description_tl: null,
				description_akl: null,
				banner_image_url: form.banner_image_url,
				panorama_image: "",
				latitude: Number.parseFloat(form.latitude) || null,
				longitude: Number.parseFloat(form.longitude) || null,
			});
			router.back();
		} catch (error) {
			console.error("[Create Location] Error:", error);
			Alert.alert("Error", "Failed to create location.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<View className="flex-1 bg-surface-soft">
			<View className="px-4 pb-4 pt-14 bg-canvas border-b border-hairline flex-row items-center">
				<TouchableOpacity
					onPress={() => router.back()}
					className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-surface-soft"
				>
					<ArrowLeft size={20} color="#1a1a1a" />
				</TouchableOpacity>
				<View>
					<Text className="text-xl text-ink" fontName="PlusJakartaSans_700Bold">
						Create Location
					</Text>
				</View>
			</View>

			<ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
				<Card className="mb-4">
					<Text className="mb-4 text-lg text-ink" fontName="PlusJakartaSans_700Bold">
						Basic Details
					</Text>
					<Input
						label="Name *"
						placeholder="e.g. Boracay White Beach"
						value={form.name}
						onChangeText={(text) => setForm({ ...form, name: text })}
					/>
					<Input
						label="Description (English)"
						placeholder="Brief info about the location"
						value={form.description_en}
						onChangeText={(text) => setForm({ ...form, description_en: text })}
						multiline
						numberOfLines={3}
					/>
				</Card>

				<Card className="mb-4">
					<Text className="mb-4 text-lg text-ink" fontName="PlusJakartaSans_700Bold">
						Address *
					</Text>
					<Input
						label="Street"
						placeholder="e.g. Station 2"
						value={form.street}
						onChangeText={(text) => setForm({ ...form, street: text })}
					/>
					<Input
						label="Barangay"
						placeholder="e.g. Balabag"
						value={form.barangay}
						onChangeText={(text) => setForm({ ...form, barangay: text })}
					/>
					<Input
						label="Town"
						placeholder="e.g. Malay"
						value={form.town}
						onChangeText={(text) => setForm({ ...form, town: text })}
					/>
				</Card>

				<Card className="mb-4">
					<Text className="mb-4 text-lg text-ink" fontName="PlusJakartaSans_700Bold">
						Media & Map
					</Text>
					<Input
						label="Image URL"
						placeholder="https://..."
						value={form.banner_image_url}
						onChangeText={(text) => setForm({ ...form, banner_image_url: text })}
					/>
					<View className="flex-row gap-3">
						<View className="flex-1">
							<Input
								label="Latitude"
								placeholder="11.96"
								keyboardType="numeric"
								value={form.latitude}
								onChangeText={(text) => setForm({ ...form, latitude: text })}
							/>
						</View>
						<View className="flex-1">
							<Input
								label="Longitude"
								placeholder="121.92"
								keyboardType="numeric"
								value={form.longitude}
								onChangeText={(text) => setForm({ ...form, longitude: text })}
							/>
						</View>
					</View>
				</Card>

				<Button
					label={isLoading ? "Creating..." : "Create Location"}
					onPress={handleCreate}
					disabled={isLoading}
					className="mb-8"
				/>
			</ScrollView>
		</View>
	);
}
