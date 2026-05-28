import { controllers } from "@lib/api/supabase/controller";
import { supabase } from "@lib/api/supabase/supabase";
import { decode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Image as ImageIcon } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Alert, Image, ScrollView, TouchableOpacity, View } from "react-native";
import { Input, LoadingSpinner } from "@/components/index";
import { Text } from "@/components/ui/Text";
import type { Location } from "@/types";

export default function EditLocationScreen() {
	const router = useRouter();
	const { id } = useLocalSearchParams<{ id: string }>();
	const [isLoading, setIsLoading] = useState(false);
	const [isFetching, setIsFetching] = useState(true);

	const [form, setForm] = useState({
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
	const [existingBannerUrl, setExistingBannerUrl] = useState<string | null>(null);
	const [existingPanoramaUrl, setExistingPanoramaUrl] = useState<string | null>(null);

	useEffect(() => {
		let isMounted = true;

		const loadLocation = async () => {
			if (!id) return;

			try {
				const location = await controllers.location.getById(id);
				if (isMounted) {
					setForm({
						name: location.name,
						street: location.street ?? "",
						barangay: location.barangay ?? "",
						town: location.town ?? "",
						description_en: location.description_en ?? "",
						latitude: location.latitude?.toString() ?? "",
						longitude: location.longitude?.toString() ?? "",
					});
					setExistingBannerUrl(location.banner_image_url);
					setExistingPanoramaUrl(location.panorama_image_url);
				}
			} catch (error) {
				console.error("[Edit Location] Failed to load:", error);
				if (isMounted) {
					Alert.alert("Error", "Failed to load location data.");
					router.back();
				}
			} finally {
				if (isMounted) {
					setIsFetching(false);
				}
			}
		};

		loadLocation();

		return () => {
			isMounted = false;
		};
	}, [id, router]);

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
		try {
			const base64 = await FileSystem.readAsStringAsync(uri, { encoding: "base64" });
			const fileExt = uri.split(".").pop() || "jpeg";
			const fileName = `${pathPrefix}-${Date.now()}.${fileExt}`;

			const { error } = await supabase.storage.from("locations").upload(fileName, decode(base64), {
				contentType: `image/${fileExt === "jpg" ? "jpeg" : fileExt}`,
			});

			if (error) throw error;

			const { data } = supabase.storage.from("locations").getPublicUrl(fileName);
			return data.publicUrl;
		} catch (error) {
			console.error("Upload error:", error);
			throw error;
		}
	};

	const handleUpdate = async () => {
		if (!id) return;

		if (!form.name || !form.street || !form.town || !form.barangay) {
			Alert.alert("Missing Fields", "Please make sure to fill the required fields.");
			return;
		}

		setIsLoading(true);
		try {
			let banner_url = existingBannerUrl ?? "";
			let panorama_url = existingPanoramaUrl ?? "";

			if (bannerImage) {
				banner_url = await uploadImageAsync(bannerImage, "banner");
			}
			if (panoramaImage) {
				panorama_url = await uploadImageAsync(panoramaImage, "panorama");
			}

			const payload: Partial<Omit<Location, "id" | "created_at">> = {
				name: form.name,
				street: form.street,
				barangay: form.barangay,
				town: form.town,
				description_en: form.description_en,
				banner_image_url: banner_url,
				panorama_image_url: panorama_url,
				latitude: Number.parseFloat(form.latitude) || null,
				longitude: Number.parseFloat(form.longitude) || null,
			};

			await controllers.location.update(id, payload);
			router.back();
		} catch (error) {
			console.error("[Edit Location] Error:", error);
			Alert.alert("Error", "Failed to update location.");
		} finally {
			setIsLoading(false);
		}
	};

	if (isFetching) {
		return (
			<View className="flex-1 items-center justify-center bg-surface-soft">
				<LoadingSpinner size="large" />
			</View>
		);
	}

	const displayBanner = bannerImage ?? existingBannerUrl;
	const displayPanorama = panoramaImage ?? existingPanoramaUrl;

	return (
		<View className="flex-1 bg-surface-soft">
			<View className="flex-row items-center pb-4 pt-14 px-4 bg-canvas border-b border-hairline">
				<TouchableOpacity
					onPress={() => router.back()}
					className="items-center justify-center mr-3 h-10 w-10 bg-surface-soft rounded-full"
				>
					<ArrowLeft size={20} color="#1a1a1a" />
				</TouchableOpacity>
				<View>
					<Text className="text-ink text-xl" fontName="PlusJakartaSans_700Bold">
						Edit Location
					</Text>
				</View>
			</View>

			<ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
				<View className="mb-4 bg-canvas rounded-[28px] shadow-sm p-5">
					<Text className="mb-4 text-ink text-lg" fontName="PlusJakartaSans_700Bold">
						Basic Details
					</Text>
					<Input
						label="Name *"
						placeholder="e.g. Riverside Park"
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
				</View>

				<View className="mb-4 bg-canvas rounded-[28px] shadow-sm p-5">
					<Text className="mb-4 text-ink text-lg" fontName="PlusJakartaSans_700Bold">
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
				</View>

				<View className="mb-4 bg-canvas rounded-[28px] shadow-sm p-5">
					<Text className="mb-4 text-ink text-lg" fontName="PlusJakartaSans_700Bold">
						Media & Map
					</Text>

					<Text className="mb-2 ml-1 font-semibold text-ink" fontName="PlusJakartaSans_600SemiBold">
						Banner Image
					</Text>
					<TouchableOpacity
						onPress={() => pickImage(setBannerImage)}
						className="overflow-hidden items-center justify-center mb-4 h-40 bg-surface-soft border-2 border-dashed border-hairline rounded-xl"
					>
						{displayBanner ? (
							<Image source={{ uri: displayBanner }} className="h-full w-full" resizeMode="cover" />
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
						onPress={() => pickImage(setPanoramaImage)}
						className="overflow-hidden items-center justify-center mb-4 h-40 bg-surface-soft border-2 border-dashed border-hairline rounded-xl"
					>
						{displayPanorama ? (
							<Image
								source={{ uri: displayPanorama }}
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
				</View>

				<TouchableOpacity
					className={`bg-primary rounded-full py-4 items-center shadow-md mb-8 ${isLoading ? "opacity-70" : ""}`}
					onPress={handleUpdate}
					disabled={isLoading}
					activeOpacity={0.8}
				>
					<Text className="text-white text-base" fontName="PlusJakartaSans_700Bold">
						{isLoading ? "Saving..." : "Save Changes"}
					</Text>
				</TouchableOpacity>
			</ScrollView>
		</View>
	);
}
