import { useOAuth, useSSO } from "@clerk/expo";
import { Text } from "@components/Text";
import AntDesign from "@expo/vector-icons/AntDesign";
import Entypo from "@expo/vector-icons/Entypo";
import { Link, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useCallback } from "react";
import { Pressable, ScrollView, View } from "react-native";

WebBrowser.maybeCompleteAuthSession();

export default function LandingPage() {
	const router = useRouter();
	const { startOAuthFlow: startGoogleOAuthFlow } = useOAuth({ strategy: "oauth_google" });
	const { startOAuthFlow: startFacebookOAuthFlow } = useOAuth({ strategy: "oauth_facebook" });

	const onSelectAuth = useCallback(
		async (strategy: "oauth_google" | "oauth_facebook") => {
			try {
				const startOAuthFlow =
					strategy === "oauth_google" ? startGoogleOAuthFlow : startFacebookOAuthFlow;
				const { createdSessionId, setActive } = await startOAuthFlow();

				if (createdSessionId && setActive) {
					await setActive({ session: createdSessionId });
					router.replace("/(home)");
				}
			} catch (err) {
				console.error("OAuth error", err);
			}
		},
		[startGoogleOAuthFlow, startFacebookOAuthFlow, router],
	);

	return (
		<ScrollView
			className="flex-1 bg-white"
			contentContainerClassName="grow justify-center px-6"
			showsVerticalScrollIndicator={false}
		>
			<View className="mx-auto max-w-100 w-full">
				<View className="mb-12 space-y-3">
					<Text
						className="text-4xl text-center text-gray-900 tracking-tight"
						fontName="PlusJakartaSans_700Bold"
					>
						AklanKnown
					</Text>
					<Text className="text-center text-gray-600 text-lg" fontName="PlusJakartaSans_400Regular">
						Discover the untold beauty of Aklan.
					</Text>
				</View>

				{/* SSO */}
				<View className="mb-12 space-y-3">
					<Pressable
						onPress={() => onSelectAuth("oauth_google")}
						className="flex-row items-center justify-center mb-2 space-x-2 h-11 w-full bg-primary hover:bg-primary-active rounded-lg shadow-sm active:scale-98"
					>
						<AntDesign name="google" size={20} color="white" />
						<Text className="ml-2 text-base text-white" fontName="PlusJakartaSans_600SemiBold">
							Continue with Google
						</Text>
					</Pressable>

					<Pressable
						onPress={() => onSelectAuth("oauth_facebook")}
						className="flex-row items-center justify-center space-x-2 h-11 w-full bg-white hover:bg-gray-100 border border-gray-200 rounded-lg active:scale-98"
					>
						<Entypo name="facebook" size={20} color="black" />
						<Text className="ml-2 text-base text-gray-900" fontName="PlusJakartaSans_600SemiBold">
							Continue with Facebook
						</Text>
					</Pressable>

					{/* Guest */}
					<View className="flex justify-center pt-4">
						<Pressable onPress={() => router.replace("/(home)")}>
							<Text
								className="text-center text-gray-600 text-sm hover:text-gray-900"
								fontName="PlusJakartaSans_400Regular"
							>
								Continue as Guest
							</Text>
						</Pressable>
					</View>
				</View>

				{/* Legal / Footer */}
				<View className="pt-8 space-y-4">
					<Text className="leading-relaxed text-center text-gray-600 text-sm">
						By signing up, you agree to our{" "}
						<Link href="vnd.youtube://watch?v=dQw4w9WgXcQ" asChild>
							<Pressable>
								<Text className="text-gray-900 underline" fontName="PlusJakartaSans_600SemiBold">
									Terms of Service
								</Text>
							</Pressable>
						</Link>
						{"    "}
						and{" "}
						<Link href="vnd.youtube://watch?v=dQw4w9WgXcQ" asChild>
							<Pressable>
								<Text className="text-gray-900 underline" fontName="PlusJakartaSans_600SemiBold">
									Privacy Policy
								</Text>
							</Pressable>
						</Link>
						.
					</Text>
				</View>
			</View>
		</ScrollView>
	);
}
