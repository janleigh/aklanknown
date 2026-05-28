import { useClerk } from "@clerk/expo";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

export default function OAuthNativeCallbackScreen() {
	const clerk = useClerk();
	const router = useRouter();
	const searchParams = useLocalSearchParams();

	useEffect(() => {
		let isActive = true;

		const completeOAuth = async () => {
			try {
				await clerk.handleRedirectCallback(searchParams as never);
				if (isActive) {
					router.replace("/(home)");
				}
			} catch (error) {
				console.error("[OAuth callback] Failed to complete sign-in:", error);
				if (isActive) {
					router.replace("/(landing)");
				}
			}
		};

		void completeOAuth();

		return () => {
			isActive = false;
		};
	}, [clerk, router, searchParams]);

	return (
		<View className="flex-1 items-center justify-center bg-white">
			<ActivityIndicator size="large" color="#ff385c" />
		</View>
	);
}
