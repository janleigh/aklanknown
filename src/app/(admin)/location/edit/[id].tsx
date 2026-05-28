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

type GalleryImageRecord = {
	id: string;
	image_url: string;
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
	const [existingGalleryImages, setExistingGalleryImages] = useState<GalleryImageRecord[]>([]);
	const [newGalleryImages, setNewGalleryImages] = useState<string[]>([]);

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
				const [location, galleryImages] = await Promise.all([
					controllers.location.getById(locationId),
					supabase
						.from("location_images")
						.select("id, image_url")
						.eq("location_id", locationId)
						.order("created_at", { ascending: true }),
				]);
				if (!isMounted) return;
				setForm(toFormState(location));
				setExistingBannerImage(location.banner_image_url || "");
				setExistingPanoramaImage(location.panorama_image_url || "");
				setExistingGalleryImages((galleryImages.data ?? []) as GalleryImageRecord[]);
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

	const pickGalleryImages = async () => {
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ["images"],
			allowsEditing: false,
			allowsMultipleSelection: true,
			selectionLimit: 10,
			quality: 0.8,
		});

		if (result.canceled) {
			return;
		}

		const selectedUris = result.assets.map((asset) => asset.uri);
		setNewGalleryImages((prev) => Array.from(new Set([...prev, ...selectedUris])));
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

	const getStoragePathFromPublicUrl = (publicUrl: string) => {
		try {
			const path = new URL(publicUrl).pathname;
			const marker = "/object/public/locations/";
			const index = path.indexOf(marker);
			if (index === -1) {
				return null;
			}
			return decodeURIComponent(path.slice(index + marker.length));
		} catch {
			return null;
		}
	};

	const deleteGalleryImage = async (image: GalleryImageRecord) => {
		try {
			const storagePath = getStoragePathFromPublicUrl(image.image_url);
			if (storagePath) {
				const { error: storageError } = await supabase.storage.from("locations").remove([storagePath]);
				if (storageError) {
					throw storageError;
				}
			}

			const { error: dbError } = await supabase.from("location_images").delete().eq("id", image.id);
			if (dbError) {
				throw dbError;
			}

			setExistingGalleryImages((prev) => prev.filter((item) => item.id !== image.id));
		} catch (error) {
			console.error("[Edit Location] Failed to delete gallery image:", error);
			Alert.alert("Delete Failed", "We couldn't remove that image right now.");
		}
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

			const newGalleryUrls = await Promise.all(
				newGalleryImages.map((imageUri, index) =>
					uploadImageAsync(imageUri, `gallery-${locationId}-${Date.now()}-${index}`),
				),
			);

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

			if (newGalleryUrls.length > 0) {
				await Promise.all(
					newGalleryUrls.map((imageUrl) =>
						controllers.locationImage.create({
							location_id: locationId,
							image_url: imageUrl,
						}),
					),
				);
			}

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

					<Text className="mb-2 ml-1 font-semibold text-ink" fontName="PlusJakartaSans_600SemiBold">
						Additional Gallery Images
					</Text>
					<TouchableOpacity
						onPress={() => void pickGalleryImages()}
						className="mb-3 min-h-24 items-center justify-center rounded-xl border-2 border-dashed border-hairline bg-surface-soft px-4 py-4"
					>
						<View className="items-center">
							<ImageIcon size={24} color="#929292" />
							<Text className="mt-2 text-muted" fontName="PlusJakartaSans_500Medium">
								Tap to add more gallery images
							</Text>
						</View>
					</TouchableOpacity>

					{existingGalleryImages.length > 0 || newGalleryImages.length > 0 ? (
						<View className="mb-3 gap-3">
							{existingGalleryImages.length > 0 ? (
								<View>
									<Text className="mb-2 ml-1 text-sm text-muted" fontName="PlusJakartaSans_400Regular">
										Existing images
									</Text>
									<ScrollView horizontal showsHorizontalScrollIndicator={false}>
										<View className="flex-row gap-2">
											{existingGalleryImages.map((image) => (
												<View key={image.id} className="relative">
													<Image
														source={{ uri: image.image_url }}
														className="h-20 w-20 rounded-lg"
														resizeMode="cover"
													/>
													<TouchableOpacity
														className="absolute -right-1 -top-1 h-6 w-6 items-center justify-center rounded-full bg-error"
														onPress={() => {
															void deleteGalleryImage(image);
														}}
														activeOpacity={0.8}
													>
														<Text className="text-xs text-white" fontName="PlusJakartaSans_700Bold">
															x
														</Text>
													</TouchableOpacity>
												</View>
											))}
										</View>
									</ScrollView>
								</View>
							) : null}

							{newGalleryImages.length > 0 ? (
								<View>
									<Text className="mb-2 ml-1 text-sm text-muted" fontName="PlusJakartaSans_400Regular">
										New images to add
									</Text>
									<ScrollView horizontal showsHorizontalScrollIndicator={false}>
										<View className="flex-row gap-2">
											{newGalleryImages.map((imageUri) => (
												<View key={imageUri} className="relative">
													<Image
														source={{ uri: imageUri }}
														className="h-20 w-20 rounded-lg"
														resizeMode="cover"
													/>
													<TouchableOpacity
														className="absolute -right-1 -top-1 h-6 w-6 items-center justify-center rounded-full bg-error"
														onPress={() => {
															setNewGalleryImages((prev) => prev.filter((uri) => uri !== imageUri));
														}}
														activeOpacity={0.8}
													>
														<Text className="text-xs text-white" fontName="PlusJakartaSans_700Bold">
															x
														</Text>
													</TouchableOpacity>
												</View>
											))}
										</View>
									</ScrollView>
								</View>
							) : null}
						</View>
					) : null}

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
