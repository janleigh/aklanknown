import { Text } from "@components/Text";
import { controllers } from "@lib/api/supabase/controller";
import { supabase } from "@lib/api/supabase/supabase";
import type { Location as LocationRecord } from "@lib/types/supabase";
import { decode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Image as ImageIcon } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Alert, Image, ScrollView, TouchableOpacity, View } from "react-native";
import { Button, Card, Input, LoadingSpinner } from "@/components/index";

type FormState = {
	name: string;
	street: string;
	barangay: string;
	town: string;
	description_en: string;
	latitude: string;
	longitude: string;
};

function toFormState(location: LocationRecord): FormState {
	return {
		name: location.name,
		street: location.street,
		barangay: location.barangay,
		town: location.town,
		description_en: location.description_en ?? "",
		latitude: location.latitude?.toString() ?? "",
		longitude: location.longitude?.toString() ?? "",
	};
}

export default function EditLocationScreen() {
	const router = useRouter();
	const { id } = useLocalSearchParams();
	const locationId = typeof id === "string" ? id : Array.isArray(id) ? id[0] : "";

	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [form, setForm] = useState<FormState>({
		name: "",
		street: "",
		barangay: "",
		town: "",
		description_en: "",
		latitude: "",
		longitude: "",
	});
	const [bannerImage, setBannerImage] = useState<string | null>(null);
	const [panoramaImage, setPanoramaImage] = useState<string | null>(null);
	const [existingBannerImage, setExistingBannerImage] = useState<string>("");
	const [existingPanoramaImage, setExistingPanoramaImage] = useState<string>("");

	useEffect(() => {
		let isMounted = true;

		const loadLocation = async () => {
			if (!locationId) {
				if (isMounted) {
					setIsLoading(false);
				}
				return;
			}

			setIsLoading(true);
			try {
				const location = await controllers.location.getById(locationId);
				if (!isMounted) return;
				setForm(toFormState(location));
				setExistingBannerImage(location.banner_image_url || "");
				setExistingPanoramaImage(location.panorama_image_url || "");
			} catch (error) {
				console.error("[Edit Location] Failed to load location:", error);
				Alert.alert("Error", "Unable to load location details.");
				if (isMounted) {
					router.back();
				}
			} finally {
				if (isMounted) {
					setIsLoading(false);
				}
			}
		};

		void loadLocation();

		return () => {
			isMounted = false;
		};
	}, [locationId, router]);

	const pickImage = async (setImage: (uri: string) => void) => {
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ["images"],
			allowsEditing: true,
			quality: 0.8,
		});

		if (!result.canceled) {
			setImage(result.assets[0].uri);
		}
	};

	const uploadImageAsync = async (uri: string, pathPrefix: string) => {
		const base64 = await FileSystem.readAsStringAsync(uri, { encoding: "base64" });
		const fileExt = uri.split(".").pop() || "jpeg";
		const fileName = `${pathPrefix}-${Date.now()}.${fileExt}`;

		const { error } = await supabase.storage.from("locations").upload(fileName, decode(base64), {
			contentType: `image/${fileExt === "jpg" ? "jpeg" : fileExt}`,
		});

		if (error) {
			throw error;
		}

		const { data } = supabase.storage.from("locations").getPublicUrl(fileName);
		return data.publicUrl;
	};

	const handleUpdate = async () => {
		if (!locationId) {
			Alert.alert("Error", "Missing location id.");
			return;
		}

		if (!form.name || !form.street || !form.barangay || !form.town) {
			Alert.alert("Missing Fields", "Please complete all required fields.");
			return;
		}

		setIsSaving(true);
		try {
			const nextBannerImage = bannerImage
				? await uploadImageAsync(bannerImage, "banner")
				: existingBannerImage;
			const nextPanoramaImage = panoramaImage
				? await uploadImageAsync(panoramaImage, "panorama")
				: existingPanoramaImage;

			await controllers.location.update(locationId, {
				name: form.name,
				street: form.street,
				barangay: form.barangay,
				town: form.town,
				description_en: form.description_en,
				latitude: Number.parseFloat(form.latitude) || null,
				longitude: Number.parseFloat(form.longitude) || null,
				banner_image_url: nextBannerImage,
				panorama_image_url: nextPanoramaImage,
			});

			Alert.alert("Updated", "Location details updated successfully.");
			router.back();
		} catch (error) {
			console.error("[Edit Location] Failed to update location:", error);
			Alert.alert("Update Failed", "We couldn't update this location right now.");
		} finally {
			setIsSaving(false);
		}
	};

	if (isLoading) {
		return (
			<View className="flex-1 items-center justify-center bg-surface-soft">
				<LoadingSpinner size="large" />
			</View>
		);
	}

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
						Edit Location
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
						placeholder="e.g. Riverside Park"
						value={form.name}
						onChangeText={(text) => setForm((prev) => ({ ...prev, name: text }))}
					/>
					<Input
						label="Description (English)"
						placeholder="Brief info about the location"
						value={form.description_en}
						onChangeText={(text) => setForm((prev) => ({ ...prev, description_en: text }))}
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
						onChangeText={(text) => setForm((prev) => ({ ...prev, street: text }))}
					/>
					<Input
						label="Barangay"
						placeholder="e.g. Balabag"
						value={form.barangay}
						onChangeText={(text) => setForm((prev) => ({ ...prev, barangay: text }))}
					/>
					<Input
						label="Town"
						placeholder="e.g. Malay"
						value={form.town}
						onChangeText={(text) => setForm((prev) => ({ ...prev, town: text }))}
					/>
				</Card>

				<Card className="mb-4">
					<Text className="mb-4 text-lg text-ink" fontName="PlusJakartaSans_700Bold">
						Media & Map
					</Text>

					<Text className="mb-2 ml-1 font-semibold text-ink" fontName="PlusJakartaSans_600SemiBold">
						Banner Image
					</Text>
					<TouchableOpacity
						onPress={() => void pickImage(setBannerImage)}
						className="mb-4 h-40 items-center justify-center rounded-xl border-2 border-dashed border-hairline bg-surface-soft overflow-hidden"
					>
						{bannerImage || existingBannerImage ? (
							<Image
								source={{ uri: bannerImage ?? existingBannerImage }}
								className="h-full w-full"
								resizeMode="cover"
							/>
						) : (
							<View className="items-center">
								<ImageIcon size={28} color="#929292" />
								<Text className="mt-2 text-muted" fontName="PlusJakartaSans_500Medium">
									Tap to upload banner
								</Text>
							</View>
						)}
					</TouchableOpacity>

					<Text className="mb-2 ml-1 font-semibold text-ink" fontName="PlusJakartaSans_600SemiBold">
						Panorama Image
					</Text>
					<TouchableOpacity
						onPress={() => void pickImage(setPanoramaImage)}
						className="mb-4 h-40 items-center justify-center rounded-xl border-2 border-dashed border-hairline bg-surface-soft overflow-hidden"
					>
						{panoramaImage || existingPanoramaImage ? (
							<Image
								source={{ uri: panoramaImage ?? existingPanoramaImage }}
								className="h-full w-full"
								resizeMode="cover"
							/>
						) : (
							<View className="items-center">
								<ImageIcon size={28} color="#929292" />
								<Text className="mt-2 text-muted" fontName="PlusJakartaSans_500Medium">
									Tap to upload panorama
								</Text>
							</View>
						)}
					</TouchableOpacity>

					<View className="flex-row gap-3 mt-2">
						<View className="flex-1">
							<Input
								label="Latitude"
								placeholder="11.96"
								keyboardType="numeric"
								value={form.latitude}
								onChangeText={(text) => setForm((prev) => ({ ...prev, latitude: text }))}
							/>
						</View>
						<View className="flex-1">
							<Input
								label="Longitude"
								placeholder="121.92"
								keyboardType="numeric"
								value={form.longitude}
								onChangeText={(text) => setForm((prev) => ({ ...prev, longitude: text }))}
							/>
						</View>
					</View>
				</Card>

				<Button
					label={isSaving ? "Saving..." : "Save Changes"}
					onPress={handleUpdate}
					disabled={isSaving}
					className="mb-8"
				/>
			</ScrollView>
		</View>
	);
}
