// src/app/_layout.tsx

import { ClerkLoaded, ClerkProvider } from "@clerk/expo";
import {
	Geist_400Regular,
	Geist_500Medium,
	Geist_600SemiBold,
	Geist_700Bold,
} from "@expo-google-fonts/geist";
import {
	PlusJakartaSans_400Regular,
	PlusJakartaSans_500Medium,
	PlusJakartaSans_600SemiBold,
	PlusJakartaSans_700Bold,
} from "@expo-google-fonts/plus-jakarta-sans";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SecureStore from "expo-secure-store";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { API_KEYS } from "@/config";
import "../global.css";

// Keep splash screen visible until fonts & auth are ready
SplashScreen.preventAutoHideAsync();

const tokenCache = {
	async getToken(key: string) {
		try {
			const item = await SecureStore.getItemAsync(key);
			if (item) console.log(`[TokenCache] ${key} was used`);
			else console.log(`[TokenCache] No values stored under key: ${key}`);
			return item;
		} catch (error) {
			console.error("[TokenCache] SecureStore get item error:", error);
			await SecureStore.deleteItemAsync(key);
			return null;
		}
	},
	async saveToken(key: string, value: string) {
		try {
			return SecureStore.setItemAsync(key, value);
		} catch (err) {
			console.error("[TokenCache] SecureStore save item error:", err);
			return;
		}
	},
};

export default function RootLayout() {
	const [fontsLoaded, fontsError] = useFonts({
		Geist_400Regular,
		Geist_500Medium,
		Geist_600SemiBold,
		Geist_700Bold,
		PlusJakartaSans_400Regular,
		PlusJakartaSans_500Medium,
		PlusJakartaSans_600SemiBold,
		PlusJakartaSans_700Bold,
	});

	useEffect(() => {
		if (fontsLoaded || fontsError) {
			SplashScreen.hideAsync();
		}
	}, [fontsLoaded, fontsError]);

	// Prevent flash of unstyled content
	if (!fontsLoaded && !fontsError) {
		return null;
	}

	return (
		<ClerkProvider tokenCache={tokenCache} publishableKey={API_KEYS.clerk.publishableKey}>
			<ClerkLoaded>
				{/* Mobile-optimized status bar */}
				<StatusBar style="auto" backgroundColor="transparent" translucent />
				
				<Stack screenOptions={{ headerShown: false }}>
					<Stack.Screen name="index" />
					<Stack.Screen name="(landing)" />
					<Stack.Screen name="(home)" />
					<Stack.Screen name="(admin)" />
					<Stack.Screen name="location/[id]" />
				</Stack>
			</ClerkLoaded>
		</ClerkProvider>
	);
}